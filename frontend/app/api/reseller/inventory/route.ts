import { NextRequest, NextResponse } from "next/server";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { dbHelper } from "@/lib/dbHelper";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(["reseller", "admin"]);
    const resellerId = user.resellerId || user.id;

    const listings = await dbHelper.resellerListings.getByReseller(resellerId);
    const transactions = await dbHelper.inventoryTransactions.listByReseller(resellerId);

    return NextResponse.json({
      success: true,
      listings,
      transactions,
    });
  } catch (err: any) {
    const { status, message } = authErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["reseller", "admin"]);
    const resellerId = user.resellerId || user.id;

    const body = await request.json();
    const { listingId, stockDelta, reason } = body;

    if (!listingId || typeof stockDelta !== "number") {
      return NextResponse.json({ error: "listingId and numeric stockDelta are required." }, { status: 400 });
    }

    const listing = await dbHelper.resellerListings.getById(listingId);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    // Security check: reseller can only modify own listing
    if (user.role === "reseller" && listing.reseller_id !== resellerId && listing.resellerId !== resellerId) {
      return NextResponse.json({ error: "Forbidden: You cannot modify another seller's listing." }, { status: 403 });
    }

    const updated = await dbHelper.resellerListings.adjustStock(listingId, stockDelta, reason || "Seller inventory update");

    return NextResponse.json({
      success: true,
      listing: updated,
    });
  } catch (err: any) {
    const { status, message } = authErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}
