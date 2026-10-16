import { NextResponse } from "next/server";
import { authErrorResponse, requireRole } from "@/lib/auth";
import { dbHelper } from "@/lib/dbHelper";

function validatePlan(body: any) {
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const duration = String(body.duration || "").trim();
  const price = Number(body.price);
  const sortOrder = body.sortOrder == null || body.sortOrder === "" ? 0 : Number(body.sortOrder);
  const accent = body.accent;

  if (!title) return { error: "Plan name is required." };
  if (!description) return { error: "Plan description is required." };
  if (!duration) return { error: "Plan duration is required." };
  if (!Number.isFinite(price) || price < 0) return { error: "Plan price must be a non-negative amount." };
  if (!Number.isFinite(sortOrder) || sortOrder < 0) return { error: "Display order must be a non-negative number." };
  if (accent !== "purple" && accent !== "blue") return { error: "Select a valid plan color." };

  return {
    plan: {
      title,
      description,
      duration,
      price,
      sortOrder,
      accent,
      isActive: body.isActive !== false,
    },
  };
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["admin"]);
    const { id } = await params;
    const validated = validatePlan(await request.json());
    if (!validated.plan) return NextResponse.json({ error: validated.error }, { status: 400 });
    return NextResponse.json({ plan: await dbHelper.protectionPlans.update(id, validated.plan) });
  } catch (error: any) {
    if (error.name === "AuthError") {
      const { status, message } = authErrorResponse(error);
      return NextResponse.json({ error: message }, { status });
    }
    const status = error.message === "Protection plan not found." ? 404 : 500;
    console.error("Failed to update protection plan:", error);
    return NextResponse.json({ error: error.message || "Failed to update protection plan." }, { status });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["admin"]);
    const { id } = await params;
    await dbHelper.protectionPlans.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const { status, message } = authErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
