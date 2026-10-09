import { NextRequest, NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";
import { buildDynamicCatalogFilters } from "@/lib/filterEngine";

/**
 * GET /api/public/filters — Public API for retrieving category-aware,
 * dynamic filter definitions and live product option counts.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "all";

    const [allProducts, customDefs] = await Promise.all([
      dbHelper.products.list(),
      dbHelper.filterDefinitions.list(category),
    ]);

    const dynamicFilterGroups = buildDynamicCatalogFilters(allProducts, category, customDefs);

    return NextResponse.json({
      success: true,
      category,
      filters: dynamicFilterGroups,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch dynamic catalog filters." }, { status: 500 });
  }
}

/** Security: Block customer mutations */
export async function POST() {
  return NextResponse.json({ error: "Forbidden: Customer role cannot modify filter definitions." }, { status: 403 });
}
