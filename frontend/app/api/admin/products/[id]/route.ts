import { NextRequest, NextResponse } from "next/server";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { dbHelper } from "@/lib/dbHelper";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin", "reseller"]);
    const { id } = await params;
    const all = await dbHelper.products.list();
    const product = all.find((p: any) => p.id === id || p.sku === id || p.slug === id);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (err) {
    const { status, message } = authErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["admin", "reseller"]);
    const { id } = await params;
    const body = await request.json();

    const all = await dbHelper.products.list();
    const existing = all.find((p: any) => p.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // SKU uniqueness check if SKU changed
    if (body.sku && String(body.sku).trim().toUpperCase() !== (existing.sku || "").toUpperCase()) {
      const cleanSku = String(body.sku).trim().toUpperCase();
      const duplicateSku = all.find(
        (p: any) => p.id !== id && (p.sku || "").toUpperCase() === cleanSku && p.status !== "deleted"
      );
      if (duplicateSku) {
        return NextResponse.json({ error: `SKU "${cleanSku}" is already taken by another product.` }, { status: 400 });
      }
    }

    // Server side price/stock validation
    if (body.price != null) {
      const parsedPrice = Number(body.price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json({ error: "Price must be a valid non-negative number." }, { status: 400 });
      }
    }
    if (body.stock != null) {
      const parsedStock = Number(body.stock);
      if (isNaN(parsedStock) || parsedStock < 0) {
        return NextResponse.json({ error: "Stock quantity must be a non-negative number." }, { status: 400 });
      }
    }

    // Cost price only editable by admin
    if (user.role !== "admin") {
      delete body.costPrice;
    }

    const updated = await dbHelper.products.update(id, body);
    return NextResponse.json({ product: updated });
  } catch (err) {
    const { status, message } = authErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["admin"]);
    const { id } = await params;

    const all = await dbHelper.products.list();
    const existing = all.find((p: any) => p.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Soft delete to preserve historical orders
    const trashed = await dbHelper.products.delete(id);
    return NextResponse.json({ product: trashed, message: "Product moved to Trash/Archived." });
  } catch (err) {
    const { status, message } = authErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}
