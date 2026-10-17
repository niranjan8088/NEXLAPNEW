"use client";

import { useState } from "react";
import { Tag, Copy, Check, X, ArrowRight } from "lucide-react";
import { formatRupees } from "@/lib/billingUtils";

interface OfferBadgeModalProps {
  offer: {
    id: string;
    code: string;
    name: string;
    description?: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    expiryDate?: string;
    minimumPurchase?: number;
    maximumDiscount?: number;
  };
  onApply?: (code: string) => void;
}

export default function OfferBadgeModal({ offer, onApply }: OfferBadgeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(offer.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onApply) {
      onApply(offer.code);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Product Card Offer Badge Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 font-bold text-[10px] hover:brightness-125 transition-all shadow-sm"
      >
        <Tag className="h-3 w-3 animate-pulse" />
        <span>
          {offer.discountType === "percentage"
            ? `${offer.discountValue}% OFF`
            : `${formatRupees(offer.discountValue)} OFF`}
        </span>
      </button>

      {/* Interactive Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative glass-panel bg-nex-ink border border-amber-500/30 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-amber-400" />
                <h3 className="font-display text-sm font-bold text-white">Promotional Offer</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-nex-mist hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Offer details */}
            <div className="space-y-3 text-xs">
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-4 rounded-xl border border-amber-500/20 text-center space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                  Special Discount
                </span>
                <div className="font-display text-2xl font-bold text-white">
                  {offer.discountType === "percentage"
                    ? `${offer.discountValue}% OFF`
                    : `${formatRupees(offer.discountValue)} OFF`}
                </div>
                <div className="text-xs font-semibold text-white/90">{offer.name}</div>
              </div>

              <div className="space-y-2 text-[11px] text-nex-mist">
                {offer.description && <p>{offer.description}</p>}
                
                {offer.expiryDate && (
                  <div className="flex justify-between border-b border-white/5 pb-1.5">
                    <span>Valid Until:</span>
                    <strong className="text-white">{offer.expiryDate}</strong>
                  </div>
                )}

                {offer.minimumPurchase ? (
                  <div className="flex justify-between border-b border-white/5 pb-1.5">
                    <span>Min. Order Value:</span>
                    <strong className="text-white">{formatRupees(offer.minimumPurchase)}</strong>
                  </div>
                ) : null}

                {offer.maximumDiscount ? (
                  <div className="flex justify-between border-b border-white/5 pb-1.5">
                    <span>Max Discount Cap:</span>
                    <strong className="text-white">{formatRupees(offer.maximumDiscount)}</strong>
                  </div>
                ) : null}
              </div>

              {/* Code Box */}
              <div className="flex items-center justify-between bg-nex-black p-2.5 rounded-xl border border-white/10 font-mono text-xs">
                <span className="font-bold text-amber-400 tracking-widest pl-2">{offer.code}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-sans text-xs flex items-center gap-1.5 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleApply}
                className="w-full btn-primary !py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-glow-blue"
              >
                <span>Apply Offer Code</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
