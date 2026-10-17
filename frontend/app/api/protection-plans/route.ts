import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

export async function GET() {
  try {
    const plans = await dbHelper.protectionPlans.list();
    return NextResponse.json({ plans: plans.filter((plan: any) => plan.isActive) });
  } catch (error) {
    console.error("Failed to load protection plans:", error);
    return NextResponse.json({ error: "Failed to load protection plans." }, { status: 500 });
  }
}
