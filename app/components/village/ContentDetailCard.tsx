"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { VillageContentItem } from "@/app/types/village";

interface Props {
  item: VillageContentItem;
  isBookmarked: boolean;
  onClose: () => void;
  onToggleBookmark: (item: VillageContentItem) => void;
  onAddComment: (contentId: string | number, text: string) => void;
}

export default function ContentDetailCard({
  item,
  isBookmarked,
  onClose,
  onToggleBookmark,
  onAddComment,
}: Props) {
  const router = useRouter();
  const [commentText, setCommentText] = useState("");
  const [isCommentsOpen, setIsCommentsOpen] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(item.id, commentText.trim());
    setCommentText("");
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-black/5 flex flex-col gap-5 w-full max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-150">
      
      {/* 1. 상단 바 (뒤로가기 & 저장) */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-sm font-black transition"
          title="닫기"
        >
          ←
        </button>

        <button
          type="button"
          onClick={() => onToggleBookmark(item)}
          className={`text-xs font-black px-4 py-1.5 rounded-xl transition shadow-sm ${
            isBookmarked
              ? "bg-neutral-900 text-white"
              : "bg-[#3D7BF6] hover:bg-blue-600 text-white"
          }`}
        >
          {isBookmarked ? "저장됨 ✓" : "저장"}
        </button>
      </div>

      {/* 2. 타이틀 & 작성자 & 본문 설명 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-black text-neutral-900 leading-snug">
            {item.title}
          </h2>

          <div
            onClick={() => router.push(`/house/${item.userId}/contents`)}
            className="flex items-center gap-2 cursor-pointer group shrink-0 py-1"
          >
            <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-black">
              {item.userName[0]}
            </div>
            <span className="text-xs font-bold text-neutral-700 group-hover:underline">
              {item.userName}
            </span>
          </div>
        </div>

        <p className="text-xs md:text-sm text-neutral-600 whitespace-pre-line leading-relaxed border-t border-neutral-100 pt-3">
          {item.content}
        </p>
      </div>

      {/* 3. 와이드 본문 이미지 (16:9 비율 유지) */}
      <div className="w-full aspect-[16/9] max-h-[420px] rounded-2xl overflow-hidden shadow-sm bg-neutral-100 border border-neutral-200/80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.coverImage}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 4. 댓글 영역 (스크린샷 토글 & 인풋 바) */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-black w-fit"
        >
          <span>댓글 {item.comments?.length || 0}개</span>
          <span className="text-[10px] text-neutral-400">{isCommentsOpen ? "▲" : "▼"}</span>
        </button>

        {isCommentsOpen && (
          <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
            {item.comments?.map((c) => (
              <div key={c.id} className="flex items-start gap-2 text-xs">
                <div className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                  {c.author[0]}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-black text-neutral-800 shrink-0">{c.author}</span>
                  <span className="text-neutral-600">{c.text}</span>
                </div>
              </div>
            ))}
            {(!item.comments || item.comments.length === 0) && (
              <span className="text-[11px] text-neutral-400 py-1">첫 댓글을 남겨보세요!</span>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
          <input
            type="text"
            placeholder="댓글 입력"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-neutral-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none placeholder:text-neutral-400"
          />
          <button
            type="submit"
            className="text-xs font-black bg-neutral-200 hover:bg-neutral-300 px-4 py-2.5 rounded-xl transition"
          >
            게시
          </button>
        </form>
      </div>

    </div>
  );
}