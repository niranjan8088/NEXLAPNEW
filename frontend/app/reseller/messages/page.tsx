"use client";

import { MessageSquare } from "lucide-react";

export default function ResellerMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Customer Messages</h1>
        <p className="text-xs text-nex-mist mt-0.5">Respond to customer enquiries about your products.</p>
      </div>
      <div className="text-center py-20 glass-panel rounded-2xl border border-white/5">
        <MessageSquare className="h-10 w-10 text-nex-mist mx-auto mb-3" />
        <p className="text-xs text-white">Messaging system coming soon.</p>
        <p className="text-[10px] text-nex-mist mt-1">Customers can message you from product pages.</p>
      </div>
    </div>
  );
}
