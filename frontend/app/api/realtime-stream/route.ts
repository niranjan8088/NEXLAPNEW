import { registerClient } from "@/lib/realtimeServer";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();
  let isClosed = false;

  const safeClose = async () => {
    if (isClosed) return;
    isClosed = true;
    try {
      await writer.close();
    } catch {
      // Ignore if stream writer is already closed or locked
    }
  };

  // Setup client message streaming callback
  const sendEvent = async (event: any) => {
    if (isClosed) return;
    try {
      await writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
    } catch {
      safeClose();
    }
  };

  const cleanup = registerClient(sendEvent);

  // Heartbeat interval to prevent intermediary timeouts (15s)
  const heartbeat = setInterval(async () => {
    if (isClosed) {
      clearInterval(heartbeat);
      return;
    }
    try {
      await writer.write(encoder.encode(`: heartbeat\n\n`));
    } catch {
      clearInterval(heartbeat);
      cleanup();
      safeClose();
    }
  }, 15000);

  // Clean up when client disconnects or aborts (e.g. browser navigation or tab close)
  req.signal.addEventListener("abort", () => {
    clearInterval(heartbeat);
    cleanup();
    safeClose();
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
