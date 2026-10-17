import { registerClient } from "@/lib/realtimeServer";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Setup client message streaming callback
  const sendEvent = async (event: any) => {
    try {
      await writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
    } catch {
      // Stream is closed, let registerClient cleanup handle it
    }
  };

  const cleanup = registerClient(sendEvent);

  // Heartbeat heartbeat interval
  const heartbeat = setInterval(async () => {
    try {
      await writer.write(encoder.encode(`: heartbeat\n\n`));
    } catch {
      clearInterval(heartbeat);
      cleanup();
    }
  }, 15000);

  req.signal.addEventListener("abort", () => {
    clearInterval(heartbeat);
    cleanup();
    writer.close();
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
