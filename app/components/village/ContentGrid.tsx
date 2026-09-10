"use client";

import React from "react";
import { VillageContentItem } from "@/app/types/village";

interface Props {
  items: VillageContentItem[];
  bookmarkedIds: (string | number)[];
  onSelectItem: (item: VillageContentItem) => void;
  onToggleBookmark: (e: React.MouseEvent, id: string | number) => void;
}

export default function ContentGrid({
  items,
  bookmarkedIds,
  onSelectItem,
  onToggleBookmark,
}: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 min-[1750px]:grid-cols-7 min-[2000px]:grid-cols-8 gap-3 sm:gap-4 md:gap-5">
      {items.map((item) => {
        const isBookmarked = bookmarkedIds.includes(item.id);

        return (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="flex flex-col gap-2 cursor-pointer group"
          >
            {/* 가로 와이드 썸네일 */}
            <div className="w-full aspect-square bg-neutral-200 rounded-[6px] overflow-hidden shadow-sm border border-black/5 group-hover:scale-[1.02] transition duration-200 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.coverImage}
                alt={item.title}
                className="w-full h-full object-cover"
              />

              {/* 북마크 아이콘 버튼 */}
              <button
                type="button"
                onClick={(e) => onToggleBookmark(e, item.id)}
                className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/85 hover:bg-white backdrop-blur-sm transition shadow-sm ${
                  isBookmarked
                    ? "opacity-100 text-[#6B5A55]"
                    : "opacity-0 group-hover:opacity-100 text-[#6B5A55]/60 hover:text-[#6B5A55]"
                }`}
                title={isBookmarked ? "저장 해제" : "저장"}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill={isBookmarked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            </div>

            {/* 작성자 문패 */}
            <div className="flex items-center gap-1.5 px-0.5">
              <div className="w-5 h-5 rounded-full bg-neutral-300 flex items-center justify-center text-[10px] font-black shrink-0">
                {item.userName?.[0] || "당"}
              </div>
              <span className="text-xs font-bold text-neutral-600 truncate">
                {item.userName || "익명"}
              </span>
            </div>

            {/* 제목 */}
            <p className="text-xs md:text-sm font-black text-neutral-900 leading-tight px-0.5 truncate group-hover:text-blue-600 transition">
              {item.title}
            </p>
          </div>
        );
      })}
    </div>
  );
}
