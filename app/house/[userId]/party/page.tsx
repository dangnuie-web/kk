"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import SearchBar, { FilterOptions } from "@/app/components/SearchBar";
import SelectableGrid, { GridItem } from "@/app/components/SelectableGrid";
import PartyDetailCard from "@/app/components/village/PartyDetailCard";
import { VillagePartyItem } from "@/app/types/village";

export default function HousePartyPage() {
  const router = useRouter();
  const params = useParams();
  const userId = (params?.userId as string) || "dang";
  const [currentUserId, setCurrentUserId] = useState<string>("dang");
  const isMe = userId === currentUserId;

  const [partyList, setPartyList] = useState<VillagePartyItem[]>([]);
  const [activeParty, setActiveParty] = useState<VillagePartyItem | null>(null);
  const [keyword, setKeyword] = useState("");
  const [bookmarks, setBookmarks] = useState<(string | number)[]>([]);
  const [isBookmarkOnly, setIsBookmarkOnly] = useState(false);

  // 데이터 및 북마크 로드
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("current_user_id");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount
      if (savedUser) setCurrentUserId(savedUser);

      const savedBookmarks = localStorage.getItem("village_bookmarks");
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }

      const key = `party_posts_${userId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed: VillagePartyItem[] = JSON.parse(saved);
        const normalized = parsed.map((item) => ({
          ...item,
          userName: item.userName || "당당",
          content: item.content || "하우스에서 등록된 파티입니다.",
          comments: item.comments || [],
        }));
        setPartyList(normalized);
      } else {
        setPartyList([]);
      }
    } catch {
      setPartyList([]);
    }
  }, [userId]);

  // 북마크 토글 핸들러
  const handleToggleBookmark = (id: string | number) => {
    const isBookmarked = bookmarks.includes(id);
    let next: (string | number)[];

    if (isBookmarked) {
      next = bookmarks.filter((bId) => bId !== id);
    } else {
      if (bookmarks.length >= 10) {
        alert("저장 목록을 정리해주세요.");
        return;
      }
      next = [id, ...bookmarks];
    }
    setBookmarks(next);
    localStorage.setItem("village_bookmarks", JSON.stringify(next));
    window.dispatchEvent(new Event("storage"));
  };

  // 상세 댓글 추가
  const handleAddComment = (partyId: string | number, text: string) => {
    const newComment = { id: Date.now(), author: "방문객", text };
    const updated = partyList.map((p) =>
      p.id === partyId ? { ...p, comments: [...(p.comments || []), newComment] } : p
    );
    setPartyList(updated);
    localStorage.setItem(`party_posts_${userId}`, JSON.stringify(updated));
    if (activeParty && activeParty.id === partyId) {
      setActiveParty({ ...activeParty, comments: [...(activeParty.comments || []), newComment] });
    }
  };

  // 필터링 (키워드 + 남의 집일 때 북마크 모아보기 지원)
  const filteredParties = partyList.filter((p) => {
    if (!isMe && isBookmarkOnly && !bookmarks.includes(p.id)) {
      return false;
    }
    if (!keyword.trim()) return true;
    const k = keyword.trim().toLowerCase();
    return p.title.toLowerCase().includes(k) || p.content.toLowerCase().includes(k);
  });

  const handleDelete = (selectedIds: (number | string)[]) => {
    const updated = partyList.filter((p) => !selectedIds.includes(p.id));
    setPartyList(updated);
    localStorage.setItem(`party_posts_${userId}`, JSON.stringify(updated));
  };

  // SelectableGrid용 아이템 매핑
  const gridItems: GridItem[] = filteredParties.map((p) => ({
    id: p.id,
    title: p.title,
    date: p.eventDate,
    customContent: (
      <div className="relative w-full h-full">
        {p.posterImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.posterImage}
            alt={p.title}
            className="w-full h-full object-cover rounded-sm"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#FAF7F0] rounded-sm">
            <span className="text-3xl mb-1.5">🎉</span>
            <span className="text-xs font-black text-neutral-800 tracking-tight line-clamp-2 px-1">
              {p.title}
            </span>
          </div>
        )}

        {/* ⭐️ 다른 사람 집: 카드 우측 위에 북마크(저장) 버튼 노출 */}
        {!isMe && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleBookmark(p.id);
            }}
            className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/85 hover:bg-white backdrop-blur-sm transition shadow-sm z-10 cursor-pointer ${
              bookmarks.includes(p.id)
                ? "opacity-100 text-[#6B5A55]"
                : "opacity-0 group-hover:opacity-100 text-[#6B5A55]/60 hover:text-[#6B5A55]"
            }`}
            title={bookmarks.includes(p.id) ? "저장 해제" : "저장"}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill={bookmarks.includes(p.id) ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        )}
      </div>
    ),
  }));

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6 font-sans pb-16">
      {/* 툴바: 돋보기 검색창 & (내 집: 새 파티 등록 / 남의 집: 북마크 모아보기 버튼) */}
      <div className="flex items-center justify-between">
        <SearchBar onSearch={(options: FilterOptions) => setKeyword(options.keyword)} />

        {isMe ? (
          <button
            type="button"
            onClick={() => router.push(`/house/${userId}/party/new`)}
            className="text-xs font-black bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            새 파티 등록
          </button>
        ) : (
          /* ⭐️ 다른 사람 집: 돋보기 같은 줄 우측 끝에 북마크 모아보기 버튼 */
          <button
            type="button"
            onClick={() => setIsBookmarkOnly(!isBookmarkOnly)}
            className={`p-2 transition flex items-center justify-center rounded-xl cursor-pointer ${
              isBookmarkOnly
                ? "text-[#6B5A55] bg-black/5 scale-105"
                : "text-[#6B5A55]/60 hover:text-[#6B5A55] hover:bg-black/5"
            }`}
            title={isBookmarkOnly ? "전체 보기" : "저장한 목록만 보기"}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill={isBookmarkOnly ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        )}
      </div>

      {/* 인라인 상세 뷰 */}
      {activeParty && (
        <PartyDetailCard
          party={activeParty}
          isMe={isMe}
          isBookmarked={bookmarks.includes(activeParty.id)}
          onClose={() => setActiveParty(null)}
          onToggleBookmark={() => handleToggleBookmark(activeParty.id)}
          onAddComment={handleAddComment}
          onEdit={() => router.push(`/house/${userId}/party/new?edit=${activeParty.id}`)}
        />
      )}

      {/* 파티 카드 그리드 (내 집: 체크박스 및 삭제 플로팅 바 활성화 / 남의 집: 북마크 카드 뷰) */}
      {gridItems.length > 0 ? (
        <SelectableGrid
          items={gridItems}
          aspect="aspect-[1/1.414]"
          canSelect={isMe}
          onDelete={handleDelete}
          onItemClick={(item) => {
            const found = partyList.find((p) => String(p.id) === String(item.id));
            if (found) {
              setActiveParty(found);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        />
      ) : (
        <div className="py-24 text-center text-xs md:text-sm font-medium text-neutral-400">
          {keyword || isBookmarkOnly ? "검색 결과가 없습니다." : "등록된 파티가 없습니다."}
        </div>
      )}
    </div>
  );
}