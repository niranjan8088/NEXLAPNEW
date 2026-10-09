import { NextRequest, NextResponse } from "next/server";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { dbHelper } from "@/lib/dbHelper";

/** GET /api/admin/products — Returns full product list for admin with costPrice */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin", "reseller"]);
    const products = await dbHelper.products.list();
    return NextResponse.json({ products });
  } catch (err) {
    const { status, message } = authErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}

/** POST /api/admin/products — Create a new product with full attributes */
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["admin", "reseller"]);
    const body = await request.json();

    const {
      sku,
      title,
      description,
      shortDescription,
      category,
      subcategoryId,
      brand,
      price,
      compareAtPrice,
      costPrice,
      stock,
      lowStockThreshold,
      images,
      specs,
      compatibility,
      warrantyEnabled,
      warrantyDuration,
      warrantyText,
      returnEnabled,
      returnWindowDays,
      returnPolicyText,
      deliveryEnabled,
      deliveryEstimate,
      deliveryMinDays,
      deliveryMaxDays,
      offersEnabled,
      activeOfferId,
      featured,
      latest,
      condition,
    } = body;

    // Title and Category are strictly required
    if (!title || !String(title).trim()) {
      return NextResponse.json({ error: "Product title is required." }, { status: 400 });
    }
    if (!category || !String(category).trim()) {
      return NextResponse.json({ error: "Product category is required." }, { status: 400 });
    }

    // Server-side validation for price and stock
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: "Price must be a valid non-negative number." }, { status: 400 });
    }

    const parsedStock = stock !== undefined ? Number(stock) : 10;
    if (isNaN(parsedStock) || parsedStock < 0) {
      return NextResponse.json({ error: "Stock quantity must be a non-negative number." }, { status: 400 });
    }

    // SKU uniqueness check if provided
    const cleanSku = sku ? String(sku).trim().toUpperCase() : `SKU-${Date.now()}`;
    const allProducts = await dbHelper.products.list();
    const existingSku = allProducts.find((p: any) => (p.sku || "").toUpperCase() === cleanSku && p.status !== "deleted");
    if (existingSku) {
      return NextResponse.json({ error: `SKU "${cleanSku}" already exists. SKU must be unique.` }, { status: 400 });
    }

    // Delivery validation min <= max
    if (deliveryMinDays != null && deliveryMaxDays != null) {
      if (Number(deliveryMinDays) > Number(deliveryMaxDays)) {
        return NextResponse.json({ error: "Minimum delivery days cannot exceed maximum delivery days." }, { status: 400 });
      }
    }

    // Normalize images
    const normalizedImages = Array.isArray(images) ? images : [];
    const primaryImage = normalizedImages.find((img: any) => img.is_primary)?.url || normalizedImages[0]?.url || "/images/poster-products.png";

    const payload = {
      sku: cleanSku,
      slug: cleanSku.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: String(title).trim(),
      description: String(description || "").trim(),
      shortDescription: String(shortDescription || "").trim(),
      category: String(category).trim(),
      subcategoryId: subcategoryId ? String(subcategoryId).trim() : undefined,
      brand: brand ? String(brand).trim() : undefined,

      price: parsedPrice,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      costPrice: user.role === "admin" && costPrice != null ? Number(costPrice) : undefined,

      stock: parsedStock,
      lowStockThreshold: lowStockThreshold != null ? Number(lowStockThreshold) : 5,

      image: primaryImage,
      images: normalizedImages,

      specs: specs || {},
      compatibility: compatibility || {},

      warrantyEnabled: warrantyEnabled !== undefined ? Boolean(warrantyEnabled) : true,
      warrantyDuration: warrantyDuration || "1 Year",
      warranty: warrantyText || warrantyDuration || "1 Year Brand Warranty",

      returnEnabled: returnEnabled !== undefined ? Boolean(returnEnabled) : true,
      returnWindowDays: returnWindowDays != null ? Number(returnWindowDays) : 7,
      returnPolicyText: returnPolicyText || "7-Day Replacement Guarantee",

      deliveryEnabled: deliveryEnabled !== undefined ? Boolean(deliveryEnabled) : false,
      deliveryEstimate: deliveryEstimate || "3–5 business days",
      deliveryMinDays: deliveryMinDays != null ? Number(deliveryMinDays) : 3,
      deliveryMaxDays: deliveryMaxDays != null ? Number(deliveryMaxDays) : 5,

      offersEnabled: Boolean(offersEnabled),
      activeOfferId: activeOfferId || undefined,

      featured: Boolean(featured),
      latest: Boolean(latest),
      condition: condition || "new",

      seller_id: user.role === "reseller" ? user.resellerId || user.id : undefined,
      seller_type: user.role === "admin" ? "admin" : "reseller",
      created_by: user.id,
      approval_status: user.role === "admin" ? "approved" : "pending",
      status: user.role === "admin" ? "show" : "pending",
    };

    const newProduct = await dbHelper.products.create(payload);
    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (err) {
    const { status, message } = authErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}
