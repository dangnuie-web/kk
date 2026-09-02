"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SelectableGrid, { GridItem } from "@/app/components/SelectableGrid";
import SearchBar, { FilterOptions } from "@/app/components/SearchBar";

interface PartyPostItem {
  id: number;
  title: string;
  eventDate: string;
  posterImage?: string;
}

const DEFAULT_ITEMS: PartyPostItem[] = [
  { id: 1, title: "랜덤 비빔밥의 날", eventDate: "26.10.04.금" },
  { id: 2, title: "보드게임 올데이 파티", eventDate: "26.10.11.금" },
];

export default function PartyListPage() {
  const params = useParams();
  const userId = (params?.userId as string) || "dang";

  // useState 초기화 함수로 에러 완전 해결
  const [items, setItems] = useState<PartyPostItem[]>(() => {
    if (typeof window === "undefined") return DEFAULT_ITEMS;
    try {
      const saved =
        localStorage.getItem(`party_posts_${userId}`) ||
        localStorage.getItem("party_posts_dang");
      if (saved) {
        const parsed: PartyPostItem[] = JSON.parse(saved);
        return [...parsed, ...DEFAULT_ITEMS];
      }
    } catch (e) {
      console.error("목록 로드 실패", e);
    }
    return DEFAULT_ITEMS;
  });

  const [filter, setFilter] = useState<FilterOptions>({
    keyword: "",
    sortBy: "latest",
  });

  // 검색어 필터링
  const cleanKeyword = filter.keyword.replace(/\s+/g, "").toLowerCase();
  const filteredItems = items.filter((item) => {
    const cleanTitle = item.title.replace(/\s+/g, "").toLowerCase();
    return cleanTitle.includes(cleanKeyword);
  });

  // 그리드 규격 매핑
  const gridItems: GridItem[] = filteredItems.map((item) => ({
    id: item.id,
    title: item.title,
    date: item.eventDate,
    customContent: item.posterImage ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.posterImage}
        alt={item.title}
        className="w-full h-full object-cover rounded-xl"
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-neutral-100 rounded-xl">
        <span className="text-xs font-bold text-neutral-400">
          Poster {item.id}
        </span>
      </div>
    ),
  }));

  const handleDelete = (selectedIds: number[]) => {
    const updated = items.filter((item) => !selectedIds.includes(item.id));
    setItems(updated);
    const userPosts = updated.filter(
      (item) => !DEFAULT_ITEMS.some((d) => d.id === item.id)
    );
    localStorage.setItem(`party_posts_${userId}`, JSON.stringify(userPosts));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <SearchBar onSearch={(options) => setFilter(options)} />

        <Link
          href={`/house/${userId}/party/new`}
          className="bg-[#3D7BF6] hover:bg-blue-600 text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-sm shrink-0 flex items-center justify-center"
        >
          새 파티 등록
        </Link>
      </div>

      {gridItems.length > 0 ? (
        <SelectableGrid
          items={gridItems}
          aspect="aspect-[1/1.414]"
          onDelete={handleDelete}
        />
      ) : (
        <div className="py-20 text-center text-sm font-medium text-neutral-400 bg-white/40 rounded-3xl border border-dashed border-neutral-300">
          &apos;{filter.keyword}&apos; 에 대한 검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}