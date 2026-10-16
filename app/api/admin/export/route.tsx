import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { testimonials } from "@/lib/data";
import * as XLSX from "xlsx";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

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
    status: "approved",
    likes_count: idx + 3,
    helpful_count: idx + 1,
    created_at: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
    admin_reply: idx === 0 ? "Thank you for the wonderful feedback! We are always happy to help." : null,
    admin_reply_at: idx === 0 ? new Date().toISOString() : null,
  }));
};

async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("nexbyte_admin_session")?.value;

  if (!sessionToken) return false;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl && sessionToken === "mock-admin-session-token") {
    return true;
  }

  try {
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabaseClient.auth.getUser(sessionToken);

    if (error || !user || !user.email) return false;

    const allowedEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    return allowedEmails.includes(user.email.toLowerCase());
  } catch (e) {
    return false;
  }
}

// PDF Document Styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#333333",
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 20,
    borderBottomColor: "#1E5EFF",
    borderBottomWidth: 1.5,
    paddingBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#05070C",
  },
  subtitle: {
    fontSize: 8,
    color: "#8B93A7",
    marginTop: 4,
  },
  reviewCard: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#F7F9FC",
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1E5EFF",
  },
  rating: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4A8CFF",
  },
  metaText: {
    fontSize: 8,
    color: "#8B93A7",
    marginBottom: 6,
  },
  message: {
    lineHeight: 1.35,
  },
  reply: {
    marginTop: 8,
    paddingLeft: 10,
    borderLeftColor: "#4A8CFF",
    borderLeftWidth: 1.5,
    color: "#555555",
  },
  replyHeader: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#4A8CFF",
    marginBottom: 2,
  },
});

// PDF Component
const ReviewsPdfDocument = ({ reviews }: { reviews: any[] }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.title}>Nex LapTech - Customer Reviews Log</Text>
        <Text style={pdfStyles.subtitle}>Generated on {new Date().toLocaleString("en-IN")}</Text>
      </View>
      {reviews.map((r) => (
        <View key={r.id} style={pdfStyles.reviewCard} wrap={false}>
          <View style={pdfStyles.reviewHeader}>
            <Text style={pdfStyles.reviewerName}>
              {r.customer_name} ({r.city})
            </Text>
            <Text style={pdfStyles.rating}>
              Rating: {r.rating} / 5
            </Text>
          </View>
          <Text style={pdfStyles.metaText}>
            Service: {r.service_used || "N/A"} | Product: {r.product_purchased || "N/A"} | Verified: {r.verified ? "Yes" : "No"} | Source: {r.source}
          </Text>
          <Text style={pdfStyles.message}>{r.review_message}</Text>
          {r.admin_reply && (
            <View style={pdfStyles.reply}>
              <Text style={pdfStyles.replyHeader}>Nex LapTech Response:</Text>
              <Text style={pdfStyles.message}>{r.admin_reply}</Text>
            </View>
          )}
        </View>
      ))}
    </Page>
  </Document>
);

export async function GET(request: NextRequest) {
  const isAuthorized = await verifyAdminSession();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "excel"; // 'excel', 'csv', or 'pdf'

  let reviewsData: any[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    reviewsData = getFallbackReviews();
  } else {
    try {
      const { data, error } = await supabaseAdmin
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      reviewsData = data || [];
    } catch (err) {
      console.error("Export query failed, using fallbacks:", err);
      reviewsData = getFallbackReviews();
    }
  }

  try {
    if (format === "pdf") {
      const pdfBuffer = await renderToBuffer(<ReviewsPdfDocument reviews={reviewsData} />);
      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="nexbyte_reviews_${Date.now()}.pdf"`,
        },
      });
    }

    // Map rows to friendly spreadsheet format
    const rows = reviewsData.map((r) => ({
      ID: r.id,
      "Customer Name": r.customer_name,
      Phone: r.phone || "",
      Email: r.email || "",
      City: r.city,
      Rating: r.rating,
      Message: r.review_message,
      "Service Used": r.service_used || "",
      "Product Purchased": r.product_purchased || "",
      "Overall Experience": r.overall_experience || "",
      "Recommend Us": r.recommend ? "Yes" : "No",
      Status: r.status,
      "Verified Booking": r.verified ? "Yes" : "No",
      "Likes Count": r.likes_count,
      "Helpful Count": r.helpful_count,
      "Admin Reply": r.admin_reply || "",
      "Reply Date": r.admin_reply_at ? new Date(r.admin_reply_at).toLocaleString("en-IN") : "",
      "Submission Date": new Date(r.created_at).toLocaleString("en-IN"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reviews Feed");

    if (format === "csv") {
      const csvContent = XLSX.utils.sheet_to_csv(worksheet);
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="nexbyte_reviews_${Date.now()}.csv"`,
        },
      });
    } else {
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="nexbyte_reviews_${Date.now()}.xlsx"`,
        },
      });
    }
  } catch (err: any) {
    console.error("Failed to generate export file:", err);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
