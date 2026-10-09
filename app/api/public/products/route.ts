import { NextRequest, NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";
import { evaluateProductFilters } from "@/lib/filterEngine";
import { FilterQueryState } from "@/lib/types/ecommerce";

/**
 * GET /api/public/products — Public customer endpoint for e-commerce catalog.
 * Supports dynamic category-aware filtering: processor, RAM, SSD, screen size, GPU, OS,
 * price range, brand, ratings, GST invoice availability, and text search.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parseMultiParam = (paramName: string): string[] | undefined => {
      const val = searchParams.get(paramName);
      if (!val || val === "all") return undefined;
      return val.split(",").map((s) => s.trim()).filter(Boolean);
    };

    const filterQuery: FilterQueryState = {
      category: searchParams.get("category") || undefined,
      brand: parseMultiParam("brand"),
      processorBrand: parseMultiParam("processorBrand"),
      processor: parseMultiParam("processor"),
      processorGen: parseMultiParam("processorGen"),
      ramCapacity: parseMultiParam("ram") || parseMultiParam("ramCapacity"),
      ramType: parseMultiParam("ramType"),
      ssdCapacity: parseMultiParam("ssd") || parseMultiParam("ssdCapacity"),
      storageType: parseMultiParam("storageType"),
      screenSize: parseMultiParam("screen") || parseMultiParam("screenSize"),
      graphics: parseMultiParam("gpu") || parseMultiParam("graphics"),
      dedicatedGraphicsMemory: parseMultiParam("dedicatedGraphicsMemory"),
      operatingSystem: parseMultiParam("os") || parseMultiParam("operatingSystem"),
      touchScreen: searchParams.get("touchScreen") ? searchParams.get("touchScreen") === "true" : undefined,
      priceMin: searchParams.get("priceMin") ? Number(searchParams.get("priceMin")) : undefined,
      priceMax: searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : undefined,
      ratingMin: searchParams.get("rating") ? Number(searchParams.get("rating")) : undefined,
      discountMin: searchParams.get("discount") ? Number(searchParams.get("discount")) : undefined,
      offersOnly: searchParams.get("offersOnly") === "true",
      gstInvoiceOnly: searchParams.get("gstInvoice") === "true",
      newArrivalsOnly: searchParams.get("newArrival") === "true",
      inStockOnly: searchParams.get("inStock") === "true",
      search: searchParams.get("search") || undefined,
    };

    const featuredOnly = searchParams.get("featured") === "true";
    const sortBy = searchParams.get("sortBy") || "recommended";

    const allProducts = await dbHelper.products.list();

    // Evaluate matching products using category-aware filter engine
    let publicProducts = allProducts.filter((p: any) => {
      if (featuredOnly && !p.featured) return false;
      return evaluateProductFilters(p, filterQuery);
    });

    // Apply Sorting
    if (sortBy === "price_low") {
      publicProducts.sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price_high") {
      publicProducts.sort((a: any, b: any) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "discount") {
      publicProducts.sort((a: any, b: any) => (b.discount || 0) - (a.discount || 0));
    } else if (sortBy === "newest") {
      publicProducts.sort(
        (a: any, b: any) =>
          new Date(b.createdAt || b.created_at || 0).getTime() -
          new Date(a.createdAt || a.created_at || 0).getTime()
      );
    } else if (sortBy === "rating") {
      publicProducts.sort((a: any, b: any) => Number(b.rating || 0) - Number(a.rating || 0));
    }

    // SECURITY SANITIZATION: Exclude costPrice, supplier details, internal notes from customer view
    const sanitizedProducts = publicProducts.map((p: any) => {
      const { costPrice, supplierPrice, internalNotes, supplier_id, ...customerSafeProduct } = p;

      const stockQty = Number(customerSafeProduct.stock ?? 10);
      const lowThreshold = Number(customerSafeProduct.lowStockThreshold ?? 5);
      let stockStatus = "In Stock";
      if (stockQty <= 0) {
        stockStatus = "Out of Stock";
      } else if (stockQty <= lowThreshold) {
        stockStatus = `Only ${stockQty} left`;
      }

      return {
        ...customerSafeProduct,
        stockStatus,
        inStock: stockQty > 0,
      };
    });

    return NextResponse.json({
      success: true,
      total: sanitizedProducts.length,
      products: sanitizedProducts,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch public products." }, { status: 500 });
  }
}

/** Security Enforcement — Customers cannot modify product catalog */
export async function POST() {
  return NextResponse.json({ error: "Forbidden: Customer role cannot create products." }, { status: 403 });
}

export async function PUT() {
  return NextResponse.json({ error: "Forbidden: Customer role cannot update products." }, { status: 403 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Forbidden: Customer role cannot delete products." }, { status: 403 });
}
