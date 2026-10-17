import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbHelper } from "@/lib/dbHelper";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

// ── Gemini Client Initialisation ─────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

function getGeminiModel() {
  if (!GEMINI_API_KEY) return null;
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

// ── Server-Side Verified Session Parser ──────────────────────────────────────
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

// ── Gather Database Context for Gemini Grounding ─────────────────────────────
async function gatherDatabaseContext(
  session: { role: string; id: string; email: string; name: string },
  query: string
) {
  const lowerQuery = query.toLowerCase();
  const contextParts: string[] = [];

  try {
    // Always include a summary of what data is available
    const products = await dbHelper.products.list();
    const orders = await dbHelper.orders.list();
    const bookings = await dbHelper.bookings.list();

    if (session.role === "admin" || session.role === "guest") {
      // Admin gets full platform visibility
      const resellers = await dbHelper.resellers.list();

      contextParts.push(`## Platform Overview (Admin View)`);
      contextParts.push(`- Total Products in Catalog: ${products.length}`);
      contextParts.push(`- Total Orders: ${orders.length}`);
      contextParts.push(`- Total Service Bookings: ${bookings.length}`);
      contextParts.push(`- Total Reseller Partners: ${resellers.length}`);
      contextParts.push(`- Pending Resellers: ${resellers.filter((r: any) => r.status === "pending").length}`);

      // Low stock products
      const lowStock = products.filter((p: any) => (p.stock || 0) < 5);
      if (lowStock.length > 0) {
        contextParts.push(`\n## Low Stock Alert (< 5 units)`);
        lowStock.slice(0, 10).forEach((p: any) => {
          contextParts.push(`- "${p.title}" — ${p.stock || 0} units left — Price: ₹${(p.price || 0).toLocaleString("en-IN")}`);
        });
      }

      // Recent orders
      if (orders.length > 0) {
        const pending = orders.filter((o: any) => o.status === "pending").length;
        const totalRev = orders
          .filter((o: any) => ["delivered", "confirmed"].includes(o.status))
          .reduce((sum: number, o: any) => sum + (o.total || 0), 0);
        contextParts.push(`\n## Orders & Revenue`);
        contextParts.push(`- Pending Fulfillment: ${pending}`);
        contextParts.push(`- Total Confirmed Revenue: ₹${totalRev.toLocaleString("en-IN")}`);
      }

      // Pending reseller applications detail
      if (lowerQuery.includes("reseller") || lowerQuery.includes("partner")) {
        const pendingResellers = resellers.filter((r: any) => r.status === "pending");
        if (pendingResellers.length > 0) {
          contextParts.push(`\n## Pending Reseller Applications`);
          pendingResellers.forEach((r: any) => {
            contextParts.push(`- Business: "${r.business_name || r.owner_name}", Email: ${r.email}, Submitted: ${new Date(r.created_at || Date.now()).toLocaleDateString()}`);
          });
        }
      }

      // Product details if query mentions products
      if (lowerQuery.includes("product") || lowerQuery.includes("laptop") || lowerQuery.includes("stock") || lowerQuery.includes("inventory") || lowerQuery.includes("catalog")) {
        contextParts.push(`\n## Product Catalog (Top 15)`);
        products.slice(0, 15).forEach((p: any) => {
          contextParts.push(`- "${p.title}" | Category: ${p.category || "General"} | Price: ₹${(p.price || 0).toLocaleString("en-IN")} | Stock: ${p.stock || 0} | Condition: ${p.condition || "new"}`);
        });
      }

      // Bookings detail
      if (lowerQuery.includes("booking") || lowerQuery.includes("service") || lowerQuery.includes("repair")) {
        contextParts.push(`\n## Service Bookings`);
        bookings.slice(0, 10).forEach((b: any) => {
          contextParts.push(`- Booking #${b.bookingId || b.id} | Customer: ${b.customer_name || b.customerName} | Service: ${b.service_name || b.productName} | Status: ${b.status} | Date: ${b.booking_date || b.preferredDate}`);
        });
      }

    } else if (session.role === "reseller") {
      // Reseller only sees their own data
      const resellerProducts = products.filter(
        (p: any) => p.seller_id === session.id || p.email === session.email
      );
      const resellerOrders = orders.filter((o: any) => o.seller_id === session.id);
      const lowStock = resellerProducts.filter((p: any) => (p.stock || 0) < 5);

      contextParts.push(`## Reseller Store Overview (${session.name})`);
      contextParts.push(`- Your Listed Products: ${resellerProducts.length}`);
      contextParts.push(`- Your Orders Received: ${resellerOrders.length}`);
      contextParts.push(`- Pending Dispatch: ${resellerOrders.filter((o: any) => o.status === "pending").length}`);

      if (lowStock.length > 0) {
        contextParts.push(`\n## Your Low Stock Products`);
        lowStock.forEach((p: any) => {
          contextParts.push(`- "${p.title}" — ${p.stock || 0} left — Price: ₹${p.price}`);
        });
      }

    } else if (session.role === "user") {
      // Customer only sees their own orders/bookings
      const ownOrders = orders.filter(
        (o: any) =>
          o.user_id === session.id ||
          (o.email && o.email.toLowerCase() === session.email.toLowerCase())
      );
      const ownBookings = bookings.filter(
        (b: any) =>
          b.customer_id === session.id ||
          (b.email && b.email.toLowerCase() === session.email.toLowerCase())
      );

      contextParts.push(`## Customer Account Overview (${session.name})`);
      contextParts.push(`- Your Orders: ${ownOrders.length}`);
      contextParts.push(`- Your Service Bookings: ${ownBookings.length}`);

      if (ownOrders.length > 0) {
        contextParts.push(`\n## Your Orders`);
        ownOrders.forEach((o: any) => {
          contextParts.push(`- Order #${o.order_id || o.id} | Status: ${(o.status || "Pending").toUpperCase()} | Total: ₹${(o.total || 0).toLocaleString("en-IN")}`);
        });
      }

      if (ownBookings.length > 0) {
        contextParts.push(`\n## Your Service Bookings`);
        ownBookings.forEach((b: any) => {
          contextParts.push(`- Booking #${b.bookingId || b.id} | Service: ${b.service_name || b.productName} | Status: ${(b.status || "Scheduled").toUpperCase()} | Date: ${b.preferredDate || b.booking_date}`);
        });
      }

      // Show products if asking about products/laptops
      if (lowerQuery.includes("laptop") || lowerQuery.includes("product") || lowerQuery.includes("buy") || lowerQuery.includes("ssd") || lowerQuery.includes("cctv") || lowerQuery.includes("price")) {
        contextParts.push(`\n## Available Products (Top 8)`);
        products.slice(0, 8).forEach((p: any) => {
          contextParts.push(`- "${p.title}" | Price: ₹${(p.price || 0).toLocaleString("en-IN")} | Stock: ${p.stock || 0} units`);
        });
      }
    }
  } catch (err) {
    contextParts.push("Note: Database context could not be fully loaded. Answer based on available information.");
    console.error("DB context gathering error:", err);
  }

  return contextParts.join("\n");
}

// ── Build System Prompt for Gemini ───────────────────────────────────────────
function buildSystemPrompt(
  session: { role: string; id: string; email: string; name: string },
  dbContext: string,
  customSystemPrompt: string,
  fileContext: string
) {
  const roleName = session.role === "admin" ? "Admin" : session.role === "reseller" ? "Reseller Partner" : session.role === "user" ? "Customer" : "Guest Visitor";

  const accessPolicy =
    session.role === "admin"
      ? "You have FULL access to all platform data — products, orders, bookings, resellers, customers, certificates, training, and analytics."
      : session.role === "reseller"
      ? "You can ONLY access THIS reseller's own products, stock levels, orders, and store analytics. You CANNOT view other resellers or admin-level data."
      : session.role === "user"
      ? "You can ONLY access THIS customer's own orders, bookings, and profile. You CANNOT view other customers' data, admin metrics, or backend information."
      : "You can only provide general information about NexLapTech products and services. No private data access.";

  const securityRules = `
## STRICT SECURITY RULES — NEVER VIOLATE THESE:
1. NEVER reveal database credentials, API keys, passwords, service role keys, or any secrets.
2. NEVER fabricate or hallucinate data — only reference what is provided in the database context below.
3. If a user asks for information outside their role's scope, politely deny access citing security policy.
4. If the database context doesn't contain data to answer, say "I don't have verified data for that" — don't guess.
5. Format all currency in Indian Rupees (₹) with "en-IN" formatting.
6. Use markdown formatting in responses (bold, lists, headings) for readability.
7. Keep responses concise, professional, and actionable.
8. When referencing admin pages, link to /admin/<section>. For customer pages, link to /customer/<section>. For products, /products.
`;

  return `You are **NexLapTech AI Assistant** — the intelligent business assistant for NexLapTech Technologies (also known as NexByte Technologies / NEXLAPTECH), a premium IT hardware, laptop repair, and IT training company based in Karnataka, India.

## Current Session
- **User**: ${session.name} (${session.email || "No email"})
- **Role**: ${roleName}
- **Access Level**: ${accessPolicy}

${securityRules}

${customSystemPrompt ? `## Custom Instructions\n${customSystemPrompt}\n` : ""}

## Live Database Context (Grounded Data)
The following is REAL data from the NexLapTech database. Use ONLY this data for answering data-specific questions:

${dbContext || "No database context available at this time."}

${fileContext ? `## Uploaded File Context\nThe user has attached a file with the following content:\n\`\`\`\n${fileContext.substring(0, 3000)}\n\`\`\`\n` : ""}

## Response Guidelines
- Be helpful, accurate, and professional
- Use markdown formatting (bold, lists, code blocks) for clarity
- Reference specific data points from the database context
- Suggest relevant admin/customer portal links when applicable
- For product queries, include price, stock, and condition info
- For order/booking queries, include status and reference numbers
- Keep responses concise but thorough
`;
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
      lowerQuery.includes("secret key") ||
      lowerQuery.includes("env variable") ||
      lowerQuery.includes("gemini key")
    ) {
      return streamSSEResponse(
        "🛡️ **Security Restriction:** I cannot provide authentication secrets, database credentials, API keys, or environment variables. This is a strict security policy.",
        1.0,
        ["Security Policy"]
      );
    }

    // ── Gather Live DB Context ───────────────────────────────────────────────
    const dbContext = await gatherDatabaseContext(session, lastUserMsg);

    // ── Build Gemini System Prompt ───────────────────────────────────────────
    const fullSystemPrompt = buildSystemPrompt(session, dbContext, systemPrompt, fileContext);

    // ── Call Gemini API ──────────────────────────────────────────────────────
    const geminiModel = getGeminiModel();

    if (!geminiModel) {
      return streamSSEResponse(
        "⚠️ **AI Service Unavailable:** The Gemini API key is not configured. Please contact the administrator to set up the `GEMINI_API_KEY` environment variable.",
        0.3,
        []
      );
    }

    // Build conversation history for Gemini
    const geminiHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = geminiModel.startChat({
      history: [
        { role: "user", parts: [{ text: "System Instructions: " + fullSystemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I am NexLapTech AI Assistant. I will follow all security rules, use only the provided database context for data-specific answers, and respond according to the user's role and access level. I'm ready to help." }] },
        ...geminiHistory,
      ],
      generationConfig: {
        temperature: Math.min(Math.max(temperature, 0), 1),
        maxOutputTokens: 2048,
        topP: 0.95,
        topK: 40,
      },
    });

    // Stream response from Gemini
    const result = await chat.sendMessageStream(lastUserMsg);

    const sources =
      session.role === "admin"
        ? ["NexLapTech Admin DB", "Platform Analytics"]
        : session.role === "reseller"
        ? ["Reseller Store DB", "Partner Pipeline"]
        : session.role === "user"
        ? ["Customer Profile", "NexLapTech Catalog"]
        : ["NexLapTech Public Info"];

    if (webSearch) sources.push("Web Knowledge 2026");

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              const payload = JSON.stringify({
                chunk: text,
                sources,
                confidence: 0.95,
              });
              controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
            }
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (streamErr: any) {
          console.error("Gemini stream error:", streamErr);
          // Send error message as final chunk
          const errorPayload = JSON.stringify({
            chunk: "\n\n⚠️ _Response was interrupted. Please try again._",
            sources: [],
            confidence: 0.3,
          });
          controller.enqueue(encoder.encode(`data: ${errorPayload}\n\n`));
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        }
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
    console.error("AI Gemini Chat Error:", err);
    return NextResponse.json(
      { error: "Something went wrong while generating response. Please try again." },
      { status: 500 }
    );
  }
}

// ── Helper: Stream a simple text response as SSE ─────────────────────────────
function streamSSEResponse(text: string, confidence: number, sources: string[]) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const words = text.split(" ");
      for (let i = 0; i < words.length; i++) {
        const chunk = (i === 0 ? "" : " ") + words[i];
        const payload = JSON.stringify({ chunk, sources, confidence });
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
}
