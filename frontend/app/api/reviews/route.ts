import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sanitizeText, getFingerprint, checkRateLimit } from "@/lib/security";
import { testimonials } from "@/lib/data";

// Fallback reviews mapping from static testimonials
const getFallbackReviews = () => {
  return testimonials.map((t, idx) => ({
    id: t.id,
    customer_name: t.name,
    city: t.role,
    rating: t.rating,
    review_message: t.quote,
    recommend: true,
    verified: true,
    source: "public_form",
    likes_count: idx + 3,
    helpful_count: idx + 1,
    created_at: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
    admin_reply: idx === 0 ? "Thank you for the wonderful feedback! We are always happy to help." : null,
    admin_reply_at: idx === 0 ? new Date().toISOString() : null,
    image_urls: [],
  }));
};

// GET /api/reviews - Fetch approved reviews
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ratingStr = searchParams.get("rating");
  const sort = searchParams.get("sort") || "newest";
  const limit = parseInt(searchParams.get("limit") || "12", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  // If Supabase URL is not configured, gracefully return fallbacks
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    let mockData = getFallbackReviews();
    if (ratingStr) {
      const rating = parseInt(ratingStr, 10);
      mockData = mockData.filter((r) => r.rating === rating);
    }
    if (sort === "oldest") {
      mockData = mockData.reverse();
    } else if (sort === "highest_rated") {
      mockData = mockData.sort((a, b) => b.rating - a.rating);
    }
    return NextResponse.json({
      reviews: mockData.slice(offset, offset + limit),
      totalCount: mockData.length,
      averageRating: 5.0,
    });
  }

  try {
    // 1. Fetch total count & average rating of approved reviews
    const { data: statsData, error: statsError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("status", "approved");

    if (statsError) throw statsError;

    const totalCount = statsData?.length || 0;
    const averageRating =
      totalCount > 0
        ? parseFloat(
            (statsData.reduce((acc: number, curr: any) => acc + curr.rating, 0) / totalCount).toFixed(1)
          )
        : 0;

    // 2. Fetch paginated list
    let query = supabase
      .from("reviews")
      .select("*")
      .eq("status", "approved");

    if (ratingStr) {
      const ratingVal = parseInt(ratingStr, 10);
      if (!isNaN(ratingVal)) {
        query = query.eq("rating", ratingVal);
      }
    }

    if (sort === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else if (sort === "highest_rated") {
      query = query.order("rating", { ascending: false }).order("created_at", { ascending: false });
    } else {
      // Default: newest
      query = query.order("created_at", { ascending: false });
    }

    const { data: reviews, error: reviewsError } = await query.range(offset, offset + limit - 1);

    if (reviewsError) throw reviewsError;

    return NextResponse.json({
      reviews: reviews || [],
      totalCount,
      averageRating,
    });
  } catch (error: any) {
    console.error("Failed to fetch reviews:", error);
    // Gracefully fall back if database fails
    return NextResponse.json({
      reviews: getFallbackReviews().slice(offset, offset + limit),
      totalCount: getFallbackReviews().length,
      averageRating: 5.0,
      isFallback: true,
    });
  }
}

// POST /api/reviews - Submit a new review
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "";
  const fingerprint = getFingerprint(ip, userAgent);

  // 1. Rate Limit Check (max 5 requests per minute)
  if (!checkRateLimit(ip, 5, 60000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  // 2. Parse Body (supports multipart/form-data or json)
  let body: any = {};
  const imageFiles: File[] = [];

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.formData();
      body.customer_name = formData.get("customer_name") as string;
      body.phone = formData.get("phone") as string;
      body.email = formData.get("email") as string;
      body.city = formData.get("city") as string;
      body.service_used = formData.get("service_used") as string;
      body.product_purchased = formData.get("product_purchased") as string;
      body.overall_experience = formData.get("overall_experience") as string;
      body.rating = parseInt(formData.get("rating") as string, 10);
      body.review_message = formData.get("review_message") as string;
      body.recommend = formData.get("recommend") === "true";
      body.verified = formData.get("verified") === "true";
      body.source = formData.get("source") as string;
      body.honeypot = formData.get("honeypot") as string; // Bot honeypot

      // Parse images
      for (let i = 0; i < 3; i++) {
        const file = formData.get(`image_${i}`) as File;
        if (file && file.size > 0) {
          imageFiles.push(file);
        }
      }
    } catch (e) {
      return NextResponse.json({ error: "Failed to parse form data." }, { status: 400 });
    }
  } else {
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "Failed to parse JSON body." }, { status: 400 });
    }
  }

  // 3. Honeypot check
  if (body.honeypot) {
    return NextResponse.json({ success: true, message: "Review logged." });
  }

  // 4. Strict Validation
  const customer_name = sanitizeText(body.customer_name?.trim() || body.customerName?.trim() || "");
  const phone = sanitizeText(body.phone?.trim() || "");
  const email = sanitizeText(body.email?.trim() || "");
  const city = sanitizeText(body.city?.trim() || "");
  const service_used = sanitizeText(body.service_used?.trim() || body.service?.trim() || "");
  const product_purchased = sanitizeText(body.product_purchased?.trim() || "");
  const overall_experience = sanitizeText(body.overall_experience?.trim() || "");
  const review_message = sanitizeText(body.review_message?.trim() || body.review?.trim() || "");
  const rating = body.rating;
  const recommend = body.recommend ?? true;
  const source = body.source || "public_form";
  const verified = body.verified === true;
  const status = "pending";

  if (!customer_name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!city) return NextResponse.json({ error: "City is required." }, { status: 400 });
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be an integer between 1 and 5." }, { status: 400 });
  }
  if (!review_message) return NextResponse.json({ error: "Review message is required." }, { status: 400 });

  try {
    // We import dbHelper here to ensure it uses the shared global state in mock mode
    const { dbHelper } = await import("@/lib/dbHelper");

    // We skip image uploads for now in this unified logic unless Supabase is strictly required
    const image_urls: string[] = [];
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && imageFiles.length > 0) {
      for (const file of imageFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const { error: uploadError } = await supabaseAdmin.storage
          .from("review-images")
          .upload(fileName, buffer, { contentType: file.type, upsert: true });
        
        if (!uploadError) {
          const { data: urlData } = supabaseAdmin.storage.from("review-images").getPublicUrl(fileName);
          image_urls.push(urlData.publicUrl);
        }
      }
    }

    const newReview = {
      customer_name,
      customerName: customer_name,
      phone,
      email,
      city,
      service_used,
      service: service_used,
      product_purchased,
      overall_experience,
      rating,
      review_message,
      review: review_message,
      recommend,
      image_urls,
      images: image_urls,
      status,
      verified,
      source,
      submitter_fingerprint: fingerprint,
    };

    const saved = await dbHelper.reviews.create(newReview);

    return NextResponse.json({
      success: true,
      review: saved,
      message: "Review submitted successfully",
    });
  } catch (error: any) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: error.message || "Internal server error." }, { status: 500 });
  }
}
