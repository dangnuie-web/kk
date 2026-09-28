"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function InvitationModal({
  isOpen,
  onClose,
  title,
  description,
  children,
}: InvitationModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- portal needs document; only render after mount
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F5] border border-white/80 w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.45)] flex flex-col gap-5 relative animate-in zoom-in-95 duration-200 my-auto max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <h3 className="text-lg font-black text-neutral-900">{title}</h3>
            {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-black font-bold text-sm w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center transition shrink-0"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body
  );
}