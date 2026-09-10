"use client";

import React from "react";
import { DraftSlot } from "@/types/house";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  drafts: DraftSlot[];
  onSelectDraft: (draft: DraftSlot) => void;
  onDeleteDraft: (slotId: number) => void;
}

export default function DraftModal({
  isOpen,
  onClose,
  drafts,
  onSelectDraft,
  onDeleteDraft,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl">
        <div className="flex justify-between items-center border-b pb-3 border-neutral-100">
          <h4 className="font-bold text-sm text-neutral-900">
            임시저장 목록 ({drafts.length}/3)
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-black font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {drafts.length === 0 ? (
          <div className="py-8 text-center text-xs font-medium text-neutral-400">
            임시저장된 글이 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {drafts.map((d) => (
              <div
                key={d.slotId}
                onClick={() => onSelectDraft(d)}
                className="p-3 border border-neutral-200 rounded-2xl hover:bg-neutral-50 cursor-pointer flex justify-between items-center transition group"
              >
                <div className="flex flex-col flex-1 min-w-0 pr-3">
                  <span className="font-bold text-xs text-neutral-900 truncate">
                    {d.title || "제목 없음"}
                  </span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">
                    저장 시간: {d.savedAt}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-blue-600 font-bold group-hover:underline">
                    불러오기
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("이 임시저장 글을 삭제하시겠습니까?")) {
                        onDeleteDraft(d.slotId);
                      }
                    }}
                    className="text-xs text-neutral-400 hover:text-red-500 font-medium px-1.5 py-0.5 rounded cursor-pointer transition"
                    title="삭제"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}