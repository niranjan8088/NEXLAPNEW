import { NextRequest, NextResponse } from "next/server";
import { getServerSession, requireRole, authErrorResponse } from "@/lib/auth";

/** GET /api/reseller/products — returns only this reseller's products */
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(["reseller", "admin"]);
    const { dbHelper } = await import("@/lib/dbHelper");

    let products = await dbHelper.products.list();

    // Resellers can only see their own products
    if (user.role === "reseller") {
      products = products.filter(
        (p: any) => p.seller_id === user.resellerId || p.created_by === user.id
      );
    }

    return NextResponse.json({ products });
  } catch (err) {
    const { status, message } = authErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}

/** POST /api/reseller/products — create a product owned by this reseller */
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["reseller", "admin"]);
    const { dbHelper } = await import("@/lib/dbHelper");

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { title, category, description, price, discount, stock, warranty, condition, images, specs } = body;

    // Check seller account approval status
    if (user.role === "reseller") {
      const seller = await dbHelper.resellers.getById(user.resellerId || user.id);
      if (seller && (seller.status === "pending" || seller.status === "rejected" || seller.status === "suspended")) {
        return NextResponse.json(
          { error: `Seller account status is '${seller.status}'. Only approved resellers can list products.` },
          { status: 403 }
        );
      }
    }

    // Server-side validation — never trust price/stock from browser
    if (!title?.trim() || !category?.trim()) {
      return NextResponse.json({ error: "Title and category are required." }, { status: 400 });
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0 || parsedPrice > 10_000_000) {
      return NextResponse.json({ error: "Invalid price value." }, { status: 400 });
    }

    const parsedDiscount = Number(discount) || 0;
    if (parsedDiscount < 0 || parsedDiscount > 100) {
      return NextResponse.json({ error: "Discount must be between 0 and 100." }, { status: 400 });
    }

    const parsedStock = Number(stock) || 0;
    if (parsedStock < 0 || parsedStock > 100_000) {
      return NextResponse.json({ error: "Invalid stock quantity." }, { status: 400 });
    }

    // Selling price calculation (server-side)
    const sellingPrice = Math.round(parsedPrice * (1 - parsedDiscount / 100));

    const primaryImage = Array.isArray(images) ? (images.find((i: any) => i.is_primary)?.url || images[0]?.url || "") : "";

    const payload = {
      title: title.trim(),
      description: description?.trim() || "",
      category,
      price: parsedPrice,
      discount: parsedDiscount,
      selling_price: sellingPrice,
      stock: parsedStock,
      warranty: warranty?.trim() || "",
      condition: condition || "new",
      image: primaryImage,
      images: Array.isArray(images) ? images : [],
      specs: specs || {},
      // Ownership — always set server-side, NEVER from browser
      seller_id: user.resellerId || user.id,
      seller_type: user.role === "admin" ? "admin" : "reseller",
      created_by: user.id,
      // Reseller products require admin approval; admin products are immediately active
      approval_status: user.role === "admin" ? "approved" : "pending",
      status: user.role === "admin" ? "show" : "pending",
      featured: false,
      latest: false,
    };

    const product = await dbHelper.products.create(payload);

    // Notify admin of new reseller product
    if (user.role === "reseller") {
      await dbHelper.notifications.create({
        title: "New Reseller Product Submitted",
        message: `${title} by reseller ${user.email} is awaiting approval.`,
        type: "product_approval",
        status: "unread",
      });
    }

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err) {
    const { status, message } = authErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}
