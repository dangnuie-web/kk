"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { VillagePartyItem } from "@/app/types/village";

interface Props {
  party: VillagePartyItem;
  isBookmarked: boolean;
  onClose: () => void;
  onToggleBookmark: (party: VillagePartyItem) => void;
  onAddComment: (partyId: string | number, text: string) => void;
  isMe?: boolean;
  onEdit?: (party: VillagePartyItem) => void;
}

export default function PartyDetailCard({
  party,
  isBookmarked,
  onClose,
  onToggleBookmark,
  onAddComment,
  isMe = false,
  onEdit,
}: Props) {
  const router = useRouter();
  const [commentText, setCommentText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(party.id, commentText.trim());
    setCommentText("");
  };

  return (
    // 가로 너비를 max-w-3xl(약 768px)로 단정하게 고정하고 중앙 배치
    <div className="bg-white rounded-3xl p-5 md:p-6 shadow-xl border border-black/5 flex flex-col gap-4 w-full max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-150">
      
      {/* 1. 상단 바 (뒤로가기 & 내 글일 때만 [수정] 버튼) */}
      <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-sm font-black transition cursor-pointer"
          title="목록으로 돌아가기"
        >
          ←
        </button>

        {/* 내 집(내 글)일 때만 우측 상단에 [ 수정 ] 버튼 노출 */}
        {isMe && (
          <button
            type="button"
            onClick={() => {
              if (onEdit) {
                onEdit(party);
              } else {
                router.push(`/house/${party.userId}/party/new?edit=${party.id}`);
              }
            }}
            className="text-xs font-black px-4 py-1.5 rounded-sm bg-neutral-900 hover:bg-neutral-800 text-white transition shadow-sm cursor-pointer"
          >
            수정
          </button>
        )}
      </div>

      {/* 2. 본문 2단 구성: 포스터 고정 너비 + 우측 정보창 */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        
        {/* 좌측: 포스터 (1:1.414 고정, 줄어들지 않는 shrink-0) */}
        <div className="w-full sm:w-[290px] md:w-[320px] aspect-[1/1.414] shrink-0 rounded-2xl overflow-hidden shadow-sm bg-neutral-100 border border-neutral-200/80 relative group">
          {party.posterImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={party.posterImage}
              alt={party.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#FFFDF8]">
              <span className="text-3xl mb-1">🚪</span>
              <span className="text-xs font-black text-neutral-700">{party.title}</span>
              <span className="text-[10px] text-neutral-400 mt-1">{party.eventDate}</span>
            </div>
          )}

          {/* 남의 집일 때: 포스터 카드 안쪽 우측 위에 북마크 버튼 노출 */}
          {!isMe && (
            <button
              type="button"
              onClick={() => onToggleBookmark(party)}
              className={`absolute top-3 right-3 p-2 rounded-lg backdrop-blur-md transition shadow-sm cursor-pointer ${
                isBookmarked
                  ? "bg-white text-[#6B5A55] scale-105"
                  : "bg-white/85 hover:bg-white text-[#6B5A55]/70 hover:text-[#6B5A55]"
              }`}
              title={isBookmarked ? "저장 해제" : "저장"}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill={isBookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          )}
        </div>

        {/* 우측: 파티 타이틀, 작성자, 내용, 댓글 */}
        <div className="flex-1 w-full flex flex-col justify-between self-stretch gap-4 min-w-0">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl md:text-2xl font-black text-neutral-900 leading-snug">
              {party.title}
            </h2>

            {/* 작성자 문패 */}
            <div
              onClick={() => router.push(`/house/${party.userId}/party`)}
              className="flex items-center gap-2 cursor-pointer group py-0.5"
            >
              <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-black shrink-0">
                {party.userName[0]}
              </div>
              <span className="text-xs font-bold text-neutral-700 group-hover:underline truncate">
                {party.userName}
              </span>
              <span className="text-[10px] text-neutral-400 shrink-0">· {party.eventDate}</span>
            </div>

            <p className="text-xs text-neutral-600 whitespace-pre-line leading-relaxed mt-1">
              {party.content}
            </p>
          </div>

          <hr className="border-neutral-100" />

          {/* 댓글 목록 & 입력창 */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-neutral-800">
              댓글 {party.comments?.length || 0}개
            </span>

            <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
              {party.comments?.map((c) => (
                <div key={c.id} className="flex items-start gap-2 text-xs">
                  <div className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                    {c.author[0]}
                  </div>
                  <div className="flex items-baseline gap-1.5 leading-snug">
                    <span className="font-black text-neutral-800 shrink-0">{c.author}</span>
                    <span className="text-neutral-600">{c.text}</span>
                  </div>
                </div>
              ))}
              {(!party.comments || party.comments.length === 0) && (
                <span className="text-[11px] text-neutral-400 py-1">첫 댓글을 남겨보세요!</span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="댓글 입력"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-neutral-100 rounded-xl px-3 py-2 text-xs font-bold outline-none"
              />
              <button
                type="submit"
                className="text-xs font-black bg-neutral-200 hover:bg-neutral-300 px-3.5 py-2 rounded-xl transition"
              >
                게시
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}