"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SelectableGrid, { GridItem } from "@/app/components/SelectableGrid";
import SearchBar, { FilterOptions } from "@/app/components/SearchBar";

const DEFAULT_ITEMS: GridItem[] = [
  { id: 1, date: "26.10.04.금", title: "홈파티 요리 레시피" },
  { id: 2, date: "26.10.11.금", title: "감성 인테리어 소품 추천" },
];

export default function HouseContentsPage() {
  const params = useParams();
  const userId = (params?.userId as string) || "dang";

  const [keyword, setKeyword] = useState("");

  // 검색어 필터링 (공백 무시 매칭)
  const cleanKeyword = keyword.replace(/\s+/g, "").toLowerCase();
  const filteredItems = DEFAULT_ITEMS.filter((item) => {
    const cleanTitle = item.title.replace(/\s+/g, "").toLowerCase();
    return cleanTitle.includes(cleanKeyword);
  });

  return (
    <div className="flex flex-col gap-6">
      {/* 상단 툴바: SearchBar + 새 콘텐츠 등록 버튼 */}
      <div className="flex items-center justify-between gap-4">
        <SearchBar onSearch={(options: FilterOptions) => setKeyword(options.keyword)} />

        <Link
          href={`/house/${userId}/contents/new`}
          className="bg-[#3D7BF6] hover:bg-blue-600 text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-sm shrink-0 flex items-center justify-center"
        >
          새 콘텐츠 등록
        </Link>
      </div>

      {/* 정방형(aspect-square) 반응형 그리드 */}
      {filteredItems.length > 0 ? (
        <SelectableGrid items={filteredItems} aspect="aspect-square" />
      ) : (
        <div className="py-20 text-center text-sm font-medium text-neutral-400 bg-white/40 rounded-3xl border border-dashed border-neutral-300">
          &apos;{keyword}&apos; 에 대한 검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}