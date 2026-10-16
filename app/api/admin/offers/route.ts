import { NextResponse } from "next/server";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { dbHelper } from "@/lib/dbHelper";

export async function GET(request: Request) {
  try {
    const admin = await requireRole(["admin"]);

    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("search") || "").toLowerCase().trim();
    const status = searchParams.get("status") || "all";

    const offers = await dbHelper.offers.list();

    const filtered = offers.filter((o: any) => {
      const code = (o.offerCode || o.offer_code || "").toLowerCase();
      const name = (o.offerName || o.offer_name || "").toLowerCase();
      const matchesSearch = !query || code.includes(query) || name.includes(query);

      const oStatus = o.status || "ACTIVE";
      const todayStr = new Date().toISOString().split("T")[0];
      const expiry = o.expiryDate || o.expiry_date || "2099-12-31";

      const isExpired = todayStr > expiry;
      let matchesStatus = true;

      if (status === "active") {
        matchesStatus = oStatus === "ACTIVE" && !isExpired;
      } else if (status === "inactive") {
        matchesStatus = oStatus === "INACTIVE";
      } else if (status === "expired") {
        matchesStatus = isExpired;
      }

      return matchesSearch && matchesStatus;
    });

    return NextResponse.json({ offers: filtered });
  } catch (err) {
    const { status, message } = authErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireRole(["admin"]);

    const body = await request.json();
    const {
      offerName,
      offerCode,
      description,
      discountType,
      discountValue,
      eligibleProducts,
      minimumPurchase,
      maximumDiscount,
      startDate,
      expiryDate,
      usageLimit,
      perCustomerLimit,
      status
    } = body;

    if (!offerName || !String(offerName).trim()) {
      return NextResponse.json({ error: "Offer Name is required." }, { status: 400 });
    }

    if (!offerCode || !String(offerCode).trim()) {
      return NextResponse.json({ error: "Offer Code is required." }, { status: 400 });
    }

    const normalizedDiscountType = discountType || "percentage";
    const normalizedDiscountValue = Number(discountValue);
    if (!Number.isFinite(normalizedDiscountValue) || normalizedDiscountValue <= 0) {
      return NextResponse.json({ error: "Discount Value must be greater than zero." }, { status: 400 });
    }
    if (normalizedDiscountType !== "percentage" && normalizedDiscountType !== "fixed") {
      return NextResponse.json({ error: "Discount Type must be percentage or fixed." }, { status: 400 });
    }
    if (normalizedDiscountType === "percentage" && normalizedDiscountValue > 100) {
      return NextResponse.json({ error: "Percentage discounts cannot exceed 100%." }, { status: 400 });
    }
    const maximumDiscountValue = Number(maximumDiscount);
    if (maximumDiscount != null && maximumDiscount !== "" && (!Number.isFinite(maximumDiscountValue) || maximumDiscountValue < 0)) {
      return NextResponse.json({ error: "Maximum discount must be a non-negative amount." }, { status: 400 });
    }
    if (startDate && expiryDate && String(expiryDate) < String(startDate)) {
      return NextResponse.json({ error: "Expiry date cannot be earlier than the start date." }, { status: 400 });
    }

    const createdOffer = await dbHelper.offers.create({
      offerName,
      offerCode,
      description,
      discountType: normalizedDiscountType,
      discountValue: normalizedDiscountValue,
      eligibleProducts: Array.isArray(eligibleProducts) ? eligibleProducts : ["all"],
      minimumPurchase: Number(minimumPurchase) || 0,
      maximumDiscount: maximumDiscountValue || 0,
      startDate: startDate || new Date().toISOString().split("T")[0],
      expiryDate: expiryDate || "2026-12-31",
      usageLimit: Number(usageLimit) || 100,
      perCustomerLimit: Number(perCustomerLimit) || 1,
      status: status || "ACTIVE"
    });

    return NextResponse.json({ offer: createdOffer }, { status: 201 });
  } catch (err: any) {
    if (err.name === "AuthError") {
      const { status, message } = authErrorResponse(err);
      return NextResponse.json({ error: message }, { status });
    }
    return NextResponse.json({ error: err.message || "Failed to create offer." }, { status: 400 });
  }
}
