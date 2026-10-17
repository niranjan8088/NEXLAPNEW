// Node.js server-side broadcast helper for SSE streams

// We store client callbacks on a global reference so it survives Next.js dev server hot reloads
const globalRef = globalThis as any;
if (!globalRef.__nexbyteClients) {
  globalRef.__nexbyteClients = new Set<(event: any) => void>();
}

export const clients = globalRef.__nexbyteClients as Set<(event: any) => void>;

export function registerClient(callback: (event: any) => void) {
  clients.add(callback);
  return () => {
    clients.delete(callback);
  };
}

export function broadcastServerEvent(table: string, action: string, data: any) {
  const event = {
    table,
    eventType: action === "delete" ? "DELETE" : action === "update" ? "UPDATE" : "INSERT",
    new: data || {},
    old: {},
  };
  
  console.log(`[SERVER] SSE client count: ${clients.size}`);
  console.log(`[SERVER] SSE event sent:`, event.eventType, event.table);

  clients.forEach((callback) => {
    try {
      callback(event);
    } catch (e) {
      console.error("SSE Broadcast Callback Error:", e);
    }
  });
}

// Bind to globalThis so dbHelper can execute it dynamically
if (typeof globalThis !== "undefined") {
  globalRef.__nexbyteBroadcast = broadcastServerEvent;
}
