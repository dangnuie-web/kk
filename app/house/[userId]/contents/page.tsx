"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import SearchBar, { FilterOptions } from "@/app/components/SearchBar";

interface HouseContentItem {
  id: string | number;
  title: string;
  date: string;
  coverImage?: string;
}

export default function HouseContentsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = (params?.userId as string) || "dang";
  const [currentUserId, setCurrentUserId] = useState<string>("dang");
  const isMe = userId === currentUserId;

  const [contentList, setContentList] = useState<HouseContentItem[]>([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("current_user_id");
      if (savedUser) setCurrentUserId(savedUser);

      const saved = localStorage.getItem(`content_posts_${userId}`);
      if (saved) {
        setContentList(JSON.parse(saved));
      } else {
        setContentList([]);
      }
    } catch {
      setContentList([]);
    }
  }, [userId]);

  const filteredContents = contentList.filter((item) => {
    if (!keyword.trim()) return true;
    return item.title.toLowerCase().includes(keyword.trim().toLowerCase());
  });

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6 font-sans pb-16">
      {/* 툴바: 돋보기 검색창 & 검정 등록 버튼 */}
      <div className="flex items-center justify-between">
        <SearchBar onSearch={(options: FilterOptions) => setKeyword(options.keyword)} />

        {isMe && (
          <button
            type="button"
            onClick={() => router.push(`/house/${userId}/contents/new`)}
            className="text-xs font-black bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            새 콘텐츠 등록
          </button>
        )}
      </div>

      {/* 1:1 정사각형 반응형 그리드 (2열 모바일 -> 3열 -> 5열) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
        {filteredContents.map((item) => (
          <div key={item.id} className="flex flex-col gap-2 cursor-pointer group">
            <div className="w-full aspect-square bg-[#F4F1EA] rounded-[6px] border border-black/5 flex items-center justify-center text-xs font-bold text-neutral-400 group-hover:scale-[1.02] transition duration-200">
              {item.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover rounded-[6px]" />
              ) : (
                <span>Post {item.id}</span>
              )}
            </div>
            <div className="px-0.5">
              <span className="text-[11px] font-medium text-neutral-400 block">{item.date}</span>
              <p className="text-xs md:text-sm font-black text-neutral-900 truncate group-hover:text-blue-600 transition">
                {item.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredContents.length === 0 && (
        <div className="py-24 text-center text-xs md:text-sm font-medium text-neutral-400">
          {keyword ? "검색 결과가 없습니다." : "등록된 콘텐츠가 없습니다."}
        </div>
      )}
    </div>
  );
}