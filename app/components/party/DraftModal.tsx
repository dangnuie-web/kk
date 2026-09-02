"use client";

import React from "react";
import { DraftSlot } from "@/types/house";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  drafts: DraftSlot[];
  onSelectDraft: (draft: DraftSlot) => void;
}

export default function DraftModal({ isOpen, onClose, drafts, onSelectDraft }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl">
        <div className="flex justify-between items-center border-b pb-3">
          <h4 className="font-bold text-sm text-neutral-900">임시저장 목록 (최대 3개)</h4>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-black font-bold">
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {drafts.map((d) => (
            <div
              key={d.slotId}
              onClick={() => onSelectDraft(d)}
              className="p-3 border rounded-xl hover:bg-blue-50/50 hover:border-blue-200 cursor-pointer flex justify-between items-center transition"
            >
              <div className="flex flex-col">
                <span className="font-bold text-xs text-neutral-800 truncate max-w-[180px]">{d.title}</span>
                <span className="text-[10px] text-neutral-400">저장 시간: {d.savedAt}</span>
              </div>
              <span className="text-xs text-blue-600 font-bold">불러오기</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}