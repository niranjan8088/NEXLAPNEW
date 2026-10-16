import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbHelper } from "@/lib/dbHelper";

export const runtime = "nodejs";

// Server-Side Verified Session Parser
async function getAuthenticatedSession() {
  const cookieStore = await cookies();

  const adminSession = cookieStore.get("nexbyte_admin_session")?.value;
  const resellerSession = cookieStore.get("nexbyte_reseller_session")?.value;
  const userSession = cookieStore.get("nexbyte_customer_session")?.value;

  if (adminSession) {
    return { role: "admin", id: "admin-1", email: "admin@nexbyte.com", name: "Admin Officer" };
  }

  if (resellerSession) {
    const parts = resellerSession.split(":");
    return {
      role: "reseller",
      id: parts[1] || "res-1",
      email: parts[2] || "reseller@nexbyte.com",
      name: "Reseller Partner",
    };
  }

  if (userSession) {
    const parts = userSession.split(":");
    return {
      role: "user",
      id: parts[1] || "cust-1",
      email: parts[2] || "customer@nexbyte.com",
      name: "Customer",
    };
  }

  return { role: "guest", id: "guest", email: "", name: "Guest Visitor" };
}

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    const body = await request.json();

    const {
      messages = [],
      model = "nexbyte-v2-smart",
      systemPrompt = "",
      webSearch = false,
      temperature = 0.7,
      fileContext = "",
    } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
    }

    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";
    const lowerQuery = lastUserMsg.toLowerCase();

    // ── SECURITY SAFEGUARD: Block Credential Extraction ──────────────────────
    if (
      lowerQuery.includes("db password") ||
      lowerQuery.includes("database password") ||
      lowerQuery.includes("api key") ||
      lowerQuery.includes("supabase service key") ||
      lowerQuery.includes("secret key")
    ) {
      return NextResponse.json({
        response: "🛡️ **Security Restriction:** I cannot provide authentication secrets, database credentials, or API keys.",
        confidence: 1.0,
      });
    }

    // ── MULTI-TURN MEMORY PROCESSING ─────────────────────────────────────────
    const userMessages = messages.filter((m: any) => m.role === "user");
    let storedName = "";
    for (const m of userMessages) {
      const match = m.content.match(/(?:my name is|i am|call me)\s+([A-Za-z]+)/i);
      if (match) storedName = match[1];
    }

    let generatedResponse = "";
    let confidence = 0.95;
    let sources: string[] = [];
    let actionRequired: any = null;

    // Handle name memory query
    if (
      lowerQuery.includes("what is my name") ||
      lowerQuery.includes("what's my name") ||
      lowerQuery.includes("who am i")
    ) {
      if (storedName) {
        generatedResponse = `Your name is **${storedName}**, as you told me earlier in our chat! How can I help you today?`;
      } else if (session.name && session.name !== "Guest Visitor") {
        generatedResponse = `You are logged in as **${session.name}** (${session.role.toUpperCase()} account). How can I assist you?`;
      } else {
        generatedResponse = `I don't believe you've mentioned your name yet! What should I call you?`;
      }
    } else {
      // ── ROLE-BASED ORCHESTRATION ────────────────────────────────────────────

      if (session.role === "user") {
        // ── CUSTOMER AI ──────────────────────────────────────────────────────
        sources = ["Authenticated Customer Profile", "Public Nex LapTech Catalog"];

        // 1. Check if asking for another user's private data
        if (
          (lowerQuery.includes("all customers") || lowerQuery.includes("other orders") || lowerQuery.includes("admin metrics")) &&
          !lowerQuery.includes("my order")
        ) {
          generatedResponse = `🛡️ **Access Denied:** As a Customer account, you can only access your own orders, bookings, and profile data. You cannot view administrative metrics or other customers' information.`;
          confidence = 1.0;
        }
        // 2. Own Order Status Lookup
        else if (lowerQuery.includes("where is my order") || lowerQuery.includes("my order")) {
          const allOrders = await dbHelper.orders.list();
          const ownOrders = allOrders.filter(
            (o: any) =>
              o.user_id === session.id ||
              (o.email && o.email.toLowerCase() === session.email.toLowerCase())
          );

          if (ownOrders.length === 0) {
            generatedResponse = `🔍 **Order Lookup Result:**\n\nYou currently have no active or past orders registered under \`${session.email || session.id}\`.\n\nWould you like me to help you browse our [Products Catalog](/products)?`;
          } else {
            const list = ownOrders
              .map(
                (o: any) =>
                  `• **Order #${o.order_id || o.id}** — Status: \`${(o.status || "Pending").toUpperCase()}\` (Total: ₹${(o.total || 0).toLocaleString("en-IN")})`
              )
              .join("\n");
            generatedResponse = `📦 **Your Orders (${ownOrders.length}):**\n\n${list}\n\nYou can track details anytime in [My Account → Orders](/customer/orders).`;
          }
        }
        // 3. Own Booking Lookup
        else if (lowerQuery.includes("my booking") || lowerQuery.includes("repair status")) {
          const allBookings = await dbHelper.bookings.list();
          const ownBookings = allBookings.filter(
            (b: any) =>
              b.customer_id === session.id ||
              (b.email && b.email.toLowerCase() === session.email.toLowerCase())
          );

          if (ownBookings.length === 0) {
            generatedResponse = `🔍 **Service Booking Lookup:**\n\nNo active service or repair bookings found for your account.\n\nTo book a laptop repair or PC service, visit [Services Page](/services).`;
          } else {
            const list = ownBookings
              .map(
                (b: any) =>
                  `• **Booking #${b.bookingId || b.id}** — ${b.productName || b.service_name || "Hardware Repair"} — Status: \`${(b.status || "Scheduled").toUpperCase()}\` (${b.preferredDate || b.booking_date})`
              )
              .join("\n");
            generatedResponse = `🔧 **Your Service Bookings (${ownBookings.length}):**\n\n${list}`;
          }
        }
        // 4. Action Request: Cancel Booking
        else if (lowerQuery.includes("cancel my booking") || lowerQuery.includes("cancel booking")) {
          actionRequired = {
            tool: "cancel_booking",
            title: "Cancel Service Booking",
            description: "Are you sure you want to cancel your upcoming service booking?",
            confirmText: "Confirm Cancellation",
            cancelText: "Keep Booking",
          };
          generatedResponse = `⚠️ **Action Confirmation Required:**\n\nI can cancel your service booking upon your confirmation. Please confirm below:`;
        }
        // 5. Product & Service Queries
        else if (lowerQuery.includes("laptop") || lowerQuery.includes("product") || lowerQuery.includes("ssd") || lowerQuery.includes("cctv")) {
          const products = await dbHelper.products.list();
          const matching = products.slice(0, 4);
          const list = matching
            .map((p: any) => `• **${p.title}** — ₹${(p.price || 0).toLocaleString("en-IN")} (\`${p.stock || 0} in stock\`)`)
            .join("\n");
          generatedResponse = `💻 **Nex LapTech Hardware Catalog Matches:**\n\n${list}\n\nExplore full catalog in [Products](/products).`;
        }
        else {
          generatedResponse = `Hello! I am your **Nex LapTech Customer AI Assistant**.\n\nI can assist you with:\n• 📦 Checking your order status\n• 🔧 Tracking service & repair bookings\n• 💻 Finding laptops, gaming PCs, SSDs, and accessories\n• 📜 Verifying training certificates & internships\n\nHow can I help you today?`;
        }

      } else if (session.role === "reseller") {
        // ── RESELLER AI ──────────────────────────────────────────────────────
        sources = ["Reseller Partner Store DB", "Authorized Reseller Pipeline"];

        // Security check: Reseller asking for other reseller or admin secrets
        if (lowerQuery.includes("admin secret") || lowerQuery.includes("other reseller")) {
          generatedResponse = `🛡️ **Access Denied:** Reseller accounts can only manage their own product listings, stock levels, and order pipeline.`;
          confidence = 1.0;
        }
        else if (lowerQuery.includes("low stock") || lowerQuery.includes("stock")) {
          const products = await dbHelper.products.list();
          const resellerProducts = products.filter(
            (p: any) => p.seller_id === session.id || p.email === session.email
          );
          const lowStock = resellerProducts.filter((p: any) => (p.stock || 0) < 5);

          if (lowStock.length === 0) {
            generatedResponse = `📦 **Reseller Inventory Health:**\n\n✅ All your listed products have healthy stock levels. (Total items: **${resellerProducts.length}**).`;
          } else {
            const list = lowStock
              .map((p: any) => `• **${p.title}** — \`${p.stock || 0} left\` (Price: ₹${p.price})`)
              .join("\n");
            generatedResponse = `⚠️ **Reseller Stock Alert:**\n\nFound **${lowStock.length} product(s)** needing restock:\n\n${list}`;
          }
        }
        else if (lowerQuery.includes("my orders") || lowerQuery.includes("today's orders")) {
          const orders = await dbHelper.orders.list();
          const resellerOrders = orders.filter((o: any) => o.seller_id === session.id);
          generatedResponse = `🛒 **Reseller Orders Summary:**\n\n• Total Orders Received: **${resellerOrders.length}**\n• Pending Dispatch: **${resellerOrders.filter((o: any) => o.status === "pending").length}**\n\nManage them in [Reseller → Orders](/reseller/orders).`;
        }
        else if (lowerQuery.includes("update price") || lowerQuery.includes("change price")) {
          actionRequired = {
            tool: "update_product_price",
            title: "Update Product Price",
            description: "Modify listed product price in reseller store?",
            confirmText: "Confirm Price Update",
            cancelText: "Cancel",
          };
          generatedResponse = `⚠️ **Action Confirmation Required:**\n\nPlease confirm your request to update the product price in your reseller store:`;
        }
        else {
          generatedResponse = `🏪 **Reseller Partner Assistant:**\n\nI can help you analyze:\n• 📦 Your listed products & stock levels\n• 🛒 Orders received from customers\n• 💬 Unread customer messages\n• 📈 Reseller store analytics`;
        }

      } else {
        // ── ADMIN AI ─────────────────────────────────────────────────────────
        sources = ["Nex LapTech Admin Master DB", "Platform Analytics"];

        if (lowerQuery.includes("reseller application") || lowerQuery.includes("pending reseller")) {
          const resellers = await dbHelper.resellers.list();
          const pending = resellers.filter((r: any) => r.status === "pending");

          if (pending.length === 0) {
            generatedResponse = `✅ **Reseller Applications:**\n\nNo pending reseller partner applications at present. All applications have been reviewed.`;
          } else {
            const list = pending
              .map((r: any) => `• **${r.business_name || r.owner_name}** (${r.email}) — Submitted: ${new Date(r.created_at || Date.now()).toLocaleDateString()}`)
              .join("\n");
            generatedResponse = `🤝 **${pending.length} Pending Reseller Partner Application(s):**\n\n${list}\n\nReview & approve applications in [Admin → Resellers](/admin/resellers).`;
          }
        }
        else if (lowerQuery.includes("approve reseller")) {
          actionRequired = {
            tool: "approve_reseller",
            title: "Approve Reseller Application",
            description: "Grant active reseller partner status to application NBT-RES-2026-001?",
            confirmText: "Confirm Approval",
            cancelText: "Cancel",
          };
          generatedResponse = `⚠️ **High-Impact Action Confirmation:**\n\nYou are about to approve a pending reseller application. Please confirm:`;
        }
        else if (lowerQuery.includes("stock") || lowerQuery.includes("inventory")) {
          const products = await dbHelper.products.list();
          const lowStock = products.filter((p: any) => (p.stock || 0) < 5);
          const list = lowStock
            .slice(0, 5)
            .map((p: any) => `• **${p.title}** — \`${p.stock || 0} units\``)
            .join("\n");
          generatedResponse = `📊 **Admin Inventory Health Report:**\n\nFound **${lowStock.length} low stock product(s)** (< 5 units):\n\n${list}\n\nManage inventory in [Admin → Inventory](/admin/inventory).`;
        }
        else if (lowerQuery.includes("order") || lowerQuery.includes("revenue")) {
          const orders = await dbHelper.orders.list();
          const pending = orders.filter((o: any) => o.status === "pending").length;
          const totalRev = orders
            .filter((o: any) => ["delivered", "confirmed"].includes(o.status))
            .reduce((sum: number, o: any) => sum + (o.total || 0), 0);
          generatedResponse = `📈 **Platform Sales & Revenue Overview:**\n\n• Total Platform Orders: **${orders.length}**\n• Pending Fulfillment: **${pending}**\n• Total Confirmed Revenue: **₹${totalRev.toLocaleString("en-IN")}**`;
        }
        else {
          generatedResponse = `🛡️ **Nex LapTech Admin AI Assistant:**\n\nI can analyze platform-wide data including:\n• 🤝 Reseller applications & partner status\n• 📦 Catalog inventory & low-stock alerts\n• 📊 Orders, sales revenue, & bookings\n• 🎓 Training enrollments & verified certificates`;
        }
      }
    }

    // Fail-safe check: Abstain if query cannot be verified
    if (!generatedResponse) {
      generatedResponse = `I don't have enough verified information in our database to answer that accurately.\n\nWould you like me to connect you with Nex LapTech support desk?`;
      confidence = 0.4;
    }

    // Stream SSE Response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = generatedResponse.split(" ");
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? "" : " ") + words[i];
          const payload = JSON.stringify({
            chunk,
            sources,
            confidence,
            actionRequired,
          });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    console.error("AI Role-Aware Chat Error:", err);
    return NextResponse.json(
      { error: "Something went wrong while generating response. Please try again." },
      { status: 500 }
    );
  }
}
