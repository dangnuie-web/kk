"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SelectableGrid, { GridItem } from "@/app/components/SelectableGrid";
import SearchBar, { FilterOptions } from "@/app/components/SearchBar";

interface GalleryPost {
  id: number;
  title: string;
  date: string;
  frameType: "3cut" | "4cut";
  frameColor: string;
  photos: string[];
}

const DEFAULT_GALLERY: GalleryPost[] = [
  {
    id: 1,
    title: "13th years with BTS",
    date: "26.08.31.월",
    frameType: "3cut",
    frameColor: "#BEE3F8",
    photos: [],
  },
  {
    id: 2,
    title: "여름밤 한강 피크닉 네컷",
    date: "26.08.28.금",
    frameType: "4cut",
    frameColor: "#FED7D7",
    photos: [],
  },
];

export default function HouseGalleryPage() {
  const params = useParams();
  const userId = (params?.userId as string) || "dang";

  const [items, setItems] = useState<GalleryPost[]>(() => {
    if (typeof window === "undefined") return DEFAULT_GALLERY;
    try {
      const saved = localStorage.getItem(`gallery_${userId}`);
      return saved ? [...JSON.parse(saved), ...DEFAULT_GALLERY] : DEFAULT_GALLERY;
    } catch {
      return DEFAULT_GALLERY;
    }
  });

  const [keyword, setKeyword] = useState("");

  // 검색어 필터링
  const cleanKeyword = keyword.replace(/\s+/g, "").toLowerCase();
  const filtered = items.filter((it) =>
    it.title.replace(/\s+/g, "").toLowerCase().includes(cleanKeyword)
  );

  // 세로 긴 네컷/세컷 스트립 카드 렌더링 매핑
  const gridItems: GridItem[] = filtered.map((item) => ({
    id: item.id,
    title: item.title,
    date: item.date,
    customContent: (
      <div
        className="w-full h-full p-2.5 flex flex-col justify-between rounded-xl transition-all shadow-inner"
        style={{ backgroundColor: item.frameColor || "#E2E8F0" }}
      >
        <div className="flex flex-col gap-1.5 flex-1 justify-center">
          {Array.from({ length: item.frameType === "4cut" ? 4 : 3 }).map((_, idx) => (
            <div
              key={idx}
              className="w-full flex-1 bg-white/90 rounded-md border border-black/5 overflow-hidden flex items-center justify-center min-h-[48px]"
            >
              {item.photos[idx] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.photos[idx]} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-neutral-300">PHOTO</span>
              )}
            </div>
          ))}
        </div>
        <div className="text-center pt-1">
          <span className="text-[9px] font-black text-neutral-700 uppercase tracking-widest">
            {item.title}
          </span>
        </div>
      </div>
    ),
  }));

  const handleDelete = (selectedIds: number[]) => {
    const updated = items.filter((it) => !selectedIds.includes(it.id));
    setItems(updated);
    const userPosts = updated.filter(
      (it) => !DEFAULT_GALLERY.some((d) => d.id === it.id)
    );
    localStorage.setItem(`gallery_${userId}`, JSON.stringify(userPosts));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 상단 툴바: SearchBar + 사진 등록 버튼 */}
      <div className="flex items-center justify-between gap-4">
        <SearchBar onSearch={(options: FilterOptions) => setKeyword(options.keyword)} />

        <Link
          href={`/house/${userId}/gallery/new`}
          className="bg-[#3D7BF6] hover:bg-blue-600 text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-sm shrink-0 flex items-center justify-center"
        >
          사진 등록
        </Link>
      </div>

      {/* 세로 긴 네컷/세컷 스트립 전용 비율 그리드 */}
      {gridItems.length > 0 ? (
        <SelectableGrid
          items={gridItems}
          aspect="aspect-[1/2.6]"
          gridCols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          onDelete={handleDelete}
        />
      ) : (
        <div className="py-20 text-center text-sm font-medium text-neutral-400 bg-white/40 rounded-3xl border border-dashed border-neutral-300">
          &apos;{keyword}&apos; 에 대한 검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}