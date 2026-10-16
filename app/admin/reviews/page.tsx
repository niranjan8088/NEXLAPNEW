import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { testimonials } from "@/lib/data";
import AdminReviewsContainer from "@/components/AdminReviewsContainer";

export const metadata: Metadata = {
  title: "Admin Reviews Feed | NEXLAPTECH Console",
  robots: "noindex, nofollow",
};

// Fallback reviews mapping from static testimonials
const getFallbackReviews = () => {
  return testimonials.map((t, idx) => ({
    id: t.id,
    customer_name: t.name,
    phone: idx % 2 === 0 ? "+91 8088979706" : null,
    email: idx % 2 === 0 ? "client@example.com" : null,
    city: t.role.split(",").pop()?.trim() || "Bengaluru",
    service_used: t.role.includes("Owner") ? "Annual Maintenance Contracts" : "Laptop Repair",
    product_purchased: t.role.includes("Owner") ? null : "Second-Hand Premium Laptops",
    overall_experience: t.role.includes("Owner") ? "Excellent networking setup" : "Great student discount",
    rating: t.rating,
    review_message: t.quote,
    recommend: true,
    image_urls: [],
    status: (idx === 0 ? "pending" : idx === 1 ? "approved" : "rejected") as "pending" | "approved" | "rejected",
    verified: idx % 2 === 0,
    created_at: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
    admin_reply: idx === 1 ? "Thank you for the wonderful feedback! We are always happy to help." : null,
    admin_reply_at: idx === 1 ? new Date().toISOString() : null,
  }));
};

async function getAllReviews() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return getFallbackReviews();
  }

  try {
    const { data: reviews, error } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return reviews || [];
  } catch (error) {
    console.error("Failed to load admin reviews, using fallbacks:", error);
    return getFallbackReviews();
  }
}

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();

  return <AdminReviewsContainer initialReviews={reviews} />;
}
