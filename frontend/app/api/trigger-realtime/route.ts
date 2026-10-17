import { NextResponse } from "next/server";
import { broadcastServerEvent } from "@/lib/realtimeServer";

export async function POST(req: Request) {
  try {
    const { table, action, data } = await req.json();
    
    if (!table || !action) {
      return NextResponse.json({ error: "Missing table or action" }, { status: 400 });
    }

    console.log(`[SERVER] Booking inserted / Realtime event emitted for ${table}`);

    broadcastServerEvent(table, action, data);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Trigger Realtime API Error:", err);
    return NextResponse.json({ error: "Failed to trigger realtime event" }, { status: 500 });
  }
}
