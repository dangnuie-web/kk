"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import SearchBar, { FilterOptions } from "@/app/components/SearchBar";
import SelectableGrid, { GridItem } from "@/app/components/SelectableGrid";

interface GalleryPost {
  id: number;
  title: string;
  date: string;
  frameType: "3cut" | "4cut";
  frameColor: string;
  photos: string[];
}

const DEFAULT_GALLERY: GalleryPost[] = [];

export default function HouseGalleryPage() {
  const router = useRouter();
  const params = useParams();
  const userId = (params?.userId as string) || "dang";
  const [currentUserId, setCurrentUserId] = useState<string>("dang");
  const isMe = userId === currentUserId;
  const [keyword, setKeyword] = useState("");

  const [items, setItems] = useState<GalleryPost[]>([]);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("current_user_id");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount
      if (savedUser) setCurrentUserId(savedUser);

      const saved = localStorage.getItem(`gallery_${userId}`);
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    }
  }, [userId]);

  const cleanKeyword = keyword.replace(/\s+/g, "").toLowerCase();
  const filtered = items.filter((it) =>
    it.title.replace(/\s+/g, "").toLowerCase().includes(cleanKeyword)
  );

  const handleDelete = (selectedIds: (number | string)[]) => {
    const updated = items.filter((it) => !selectedIds.includes(it.id));
    setItems(updated);
    const userPosts = updated.filter(
      (it) => !DEFAULT_GALLERY.some((d) => d.id === it.id)
    );
    localStorage.setItem(`gallery_${userId}`, JSON.stringify(userPosts));
  };

  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPost | null>(null);

  const handleEdit = (selectedIds: (number | string)[]) => {
    if (selectedIds.length > 0) {
      router.push(`/house/${userId}/gallery/new?edit=${selectedIds[0]}`);
    }
  };

  const gridItems: GridItem[] = filtered.map((item) => ({
    id: item.id,
    title: item.title,
    date: item.date,
    customContent: (
      <div
        className="w-full h-full p-2.5 md:p-3 flex flex-col justify-between rounded-[6px] transition-all shadow-inner overflow-hidden"
        style={{ backgroundColor: item.frameColor || "#BEE3F8" }}
      >
        <div className="flex flex-col gap-1.5 md:gap-2 flex-1 justify-center min-h-0 py-1">
          {Array.from({ length: item.frameType === "4cut" ? 4 : 3 }).map((_, idx) => (
            <div
              key={idx}
              className="w-full aspect-[4/3] bg-white/90 rounded-lg overflow-hidden flex items-center justify-center shrink-0 shadow-xs"
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
        <div className="text-center pt-1.5 border-t border-black/10 shrink-0">
          <span className="text-[10px] md:text-[11px] font-black text-neutral-800 uppercase tracking-wider block truncate">
            {item.title}
          </span>
          <span className="text-[8px] md:text-[9px] text-neutral-600 font-bold block mt-0.5">
            {item.date}
          </span>
        </div>
      </div>
    ),
  }));

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6 font-sans pb-8">
      <div className="flex items-center justify-between">
        <SearchBar onSearch={(options: FilterOptions) => setKeyword(options.keyword)} />

        {isMe && (
          <button
            type="button"
            onClick={() => router.push(`/house/${userId}/gallery/new`)}
            className="text-xs font-black bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            사진 올리기
          </button>
        )}
      </div>

      {gridItems.length > 0 ? (
        <SelectableGrid
          items={gridItems}
          aspect="aspect-[1/3]"
          containerClassName="flex flex-wrap gap-5 items-start"
          wrapperClassName="shrink-0"
          cardStyle={{
            height: "calc(100vh - 210px)",
            width: "calc((100vh - 210px) / 3)",
          }}
          cardClassName="max-h-[calc(100vh-210px)] aspect-[1/3] shrink-0"
          hideCardInfo={true}
          canSelect={isMe}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onItemClick={(item) => {
            const found = items.find((p) => p.id === item.id);
            if (found) setSelectedPhoto(found);
          }}
        />
      ) : (
        <div className="py-24 text-center text-xs md:text-sm font-medium text-neutral-400">
        </div>
      )}

      {/* 사진 크게 보기 상세 모달 */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF7F0] rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full animate-in zoom-in-95 duration-150 relative border border-white/40"
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-xs font-bold text-neutral-600 transition"
              title="닫기"
            >
              ✕
            </button>

            <div
              className="w-[240px] p-3.5 rounded-2xl shadow-md flex flex-col justify-between gap-3 border"
              style={{ backgroundColor: selectedPhoto.frameColor || "#BEE3F8" }}
            >
              <div className="flex flex-col gap-2">
                {Array.from({ length: selectedPhoto.frameType === "4cut" ? 4 : 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-full aspect-[4/3] bg-white rounded-xl overflow-hidden flex items-center justify-center shadow-xs"
                  >
                    {selectedPhoto.photos[idx] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={selectedPhoto.photos[idx]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-neutral-300">PHOTO</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center pt-2 border-t border-black/10">
                <p className="text-xs font-black text-neutral-800 tracking-wider truncate">
                  {selectedPhoto.title}
                </p>
                <span className="text-[10px] text-neutral-500 font-bold block mt-0.5">
                  {selectedPhoto.date}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}