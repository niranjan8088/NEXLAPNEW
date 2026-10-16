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

export async function GET() {
  try {
    await requireRole(["admin"]);
    return NextResponse.json({ plans: await dbHelper.protectionPlans.list() });
  } catch (error) {
    const { status, message } = authErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["admin"]);
    const body = await request.json();
    const validated = validatePlan(body);
    if (!validated.plan) return NextResponse.json({ error: validated.error }, { status: 400 });
    return NextResponse.json({ plan: await dbHelper.protectionPlans.create(validated.plan) }, { status: 201 });
  } catch (error: any) {
    if (error.name === "AuthError") {
      const { status, message } = authErrorResponse(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to create protection plan:", error);
    return NextResponse.json({ error: error.message || "Failed to create protection plan." }, { status: 500 });
  }
}
