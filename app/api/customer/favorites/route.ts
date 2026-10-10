import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";
import { getServerSession } from "@/lib/auth";

export async function GET() {
  try {
    const authUser = await getServerSession();
    if (!authUser || authUser.role !== "user") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const favs = await dbHelper.favorites.getByUser(authUser.id);
    const allProducts = await dbHelper.products.list();

    const favoriteProducts = favs
      .map((f: any) => allProducts.find((p: any) => p.id === f.product_id))
      .filter(Boolean);

    return NextResponse.json({ favorites: favoriteProducts });
  } catch (err: any) {
    console.error("GET Customer Favorites Error:", err);
    return NextResponse.json({ error: "Failed to fetch favorites." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getServerSession();
    if (!authUser || authUser.role !== "user") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    const result = await dbHelper.favorites.toggle(authUser.id, productId);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("POST Customer Favorites Error:", err);
    return NextResponse.json({ error: "Failed to update favorites." }, { status: 500 });
  }
}
