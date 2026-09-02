"use client";

import React, { useState, useEffect } from "react";
import SearchBar, { FilterOptions } from "@/app/components/SearchBar";
import PartyDetailCard from "@/app/components/village/PartyDetailCard";
import PartyGrid from "@/app/components/village/PartyGrid";
import ContentDetailCard from "@/app/components/village/ContentDetailCard";
import ContentGrid from "@/app/components/village/ContentGrid";
import { VillagePartyItem, VillageContentItem } from "@/app/types/village";

const MAIN_CATEGORIES = [
  { id: "PARTY", label: "파티" },
  { id: "CONTENTS", label: "콘텐츠" },
  { id: "STUDIO", label: "공방" },
] as const;

// 공방에서 '전체' 제외: 3개 서브메뉴
const STUDIO_SUB_CATEGORIES = [
  { id: "INVITATION", label: "초대장" },
  { id: "SEAL", label: "씰" },
  { id: "FRAME", label: "사진 프레임" },
] as const;

type MainCatType = (typeof MAIN_CATEGORIES)[number]["id"];
type StudioSubType = (typeof STUDIO_SUB_CATEGORIES)[number]["id"];

// 기본 파티 목 데이터
const DEFAULT_VILLAGE_PARTIES: VillagePartyItem[] = [
  {
    id: "mock-1",
    userId: "kongkong",
    userName: "콩콩이",
    title: "보드게임 올데이 파티",
    eventDate: "26.10.11.금",
    content: "카탄, 루미큐브, 스플렌더까지 밤새 달려봅시다!\n주전부리는 각자 먹을 만큼 챙겨와 주세요.",
    posterImage: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600&auto=format&fit=crop&q=80",
    createdAt: 1729000000000,
    comments: [{ id: 1, author: "초록이", text: "저 보드게임 고수인데 참가 가능한가요?" }],
  },
  {
    id: "mock-2",
    userId: "green",
    userName: "초록이",
    title: "반려식물 분갈이 & 홈카페",
    eventDate: "26.10.08.화",
    content: "가을맞이 분갈이 흙과 화분을 나눕니다. 따뜻한 드립커피 한잔해요.",
    posterImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    createdAt: 1728500000000,
    comments: [],
  },
  {
    id: "mock-3",
    userId: "mint",
    userName: "민트",
    title: "랜덤 비빔밥의 날",
    eventDate: "26.10.04.금",
    content: "어쩌구 저쩌구 설명을 적어 봅시다.\n배가 고파요. 점심 시간 어서와.",
    posterImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80",
    createdAt: 1728000000000,
    comments: [
      { id: 1, author: "콩콩이", text: "구름에 그리는 달처럼" },
      { id: 2, author: "콩콩이", text: "구름에 그리는 달처럼" },
    ],
  },
];

// 기본 콘텐츠 목 데이터
const DEFAULT_VILLAGE_CONTENTS: VillageContentItem[] = [
  {
    id: "c-1",
    userId: "green",
    userName: "초록이",
    title: "우리집 여름 메뉴판",
    content: "어쩌구 저쩌구 설명을 적어 봅시다.\n어쩌구 저쩌구, 배가 고파요. 점심 시간 어서와.",
    coverImage: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=900&auto=format&fit=crop&q=80",
    createdAt: 1728900000000,
    comments: [
      { id: 1, author: "콩콩이", text: "구름에 그리는 달처럼" },
      { id: 2, author: "다운", text: "메뉴판 손글씨 너무 귀여워요!" },
    ],
  },
  {
    id: "c-2",
    userId: "kongkong",
    userName: "콩콩이",
    title: "나만의 홈카페 레시피 모음",
    content: "원두 블렌딩 비율과 홈메이드 바닐라빈 시럽 만드는 방법 공유합니다.",
    coverImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=80",
    createdAt: 1728600000000,
    comments: [],
  },
];

export default function VillagePage() {
  const myUserId = "dang";

  // 좌측 카테고리 상태
  const [selectedCategory, setSelectedCategory] = useState<MainCatType>("PARTY");
  const [studioSubCategory, setStudioSubCategory] = useState<StudioSubType>("INVITATION");

  // 피드 및 상세 데이터 상태
  const [partyList, setPartyList] = useState<VillagePartyItem[]>([]);
  const [activeParty, setActiveParty] = useState<VillagePartyItem | null>(null);

  const [contentList, setContentList] = useState<VillageContentItem[]>(DEFAULT_VILLAGE_CONTENTS);
  const [activeContent, setActiveContent] = useState<VillageContentItem | null>(null);

  // 검색 및 북마크
  const [searchFilter, setSearchFilter] = useState<FilterOptions>({ keyword: "" });
  const [isBookmarkOnly, setIsBookmarkOnly] = useState(false);
  const [bookmarks, setBookmarks] = useState<(string | number)[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("village_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 내 하우스 파티 연동
  useEffect(() => {
    try {
      const mySaved =
        localStorage.getItem(`party_posts_${myUserId}`) ||
        localStorage.getItem("party_posts_dang");

      let myParties: VillagePartyItem[] = [];
      if (mySaved) {
        const parsed = JSON.parse(mySaved);
        myParties = parsed.map((item: any) => ({
          id: item.id,
          userId: myUserId,
          userName: "다운",
          title: item.title,
          content: item.content || "하우스에서 등록된 파티입니다.",
          eventDate: item.eventDate,
          posterImage: item.posterImage,
          createdAt: typeof item.id === "number" ? item.id : Date.now(),
          comments: [],
        }));
      }

      const combined = [...myParties, ...DEFAULT_VILLAGE_PARTIES].sort(
        (a, b) => b.createdAt - a.createdAt
      );
      setPartyList(combined);
    } catch (e) {
      console.error(e);
      setPartyList(DEFAULT_VILLAGE_PARTIES);
    }
  }, [myUserId]);

  // ⭐️ 10개 초과 시 "저장 목록을 정리해주세요." 알림 핸들러
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
  };

  const handleAddPartyComment = (partyId: string | number, text: string) => {
    const newComment = { id: Date.now(), author: "다운", text };
    setPartyList((prev) =>
      prev.map((p) => (p.id === partyId ? { ...p, comments: [...(p.comments || []), newComment] } : p))
    );
    if (activeParty && activeParty.id === partyId) {
      setActiveParty((prev) => (prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : null));
    }
  };

  const handleAddContentComment = (contentId: string | number, text: string) => {
    const newComment = { id: Date.now(), author: "다운", text };
    setContentList((prev) =>
      prev.map((c) => (c.id === contentId ? { ...c, comments: [...(c.comments || []), newComment] } : c))
    );
    if (activeContent && activeContent.id === contentId) {
      setActiveContent((prev) => (prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : null));
    }
  };

  const cleanKeyword = (searchFilter.keyword || "").replace(/\s+/g, "").toLowerCase();

  const filteredParties = partyList.filter((item) => {
    if (isBookmarkOnly && !bookmarks.includes(item.id)) return false;
    if (cleanKeyword) {
      return (
        item.title.replace(/\s+/g, "").toLowerCase().includes(cleanKeyword) ||
        item.userName.replace(/\s+/g, "").toLowerCase().includes(cleanKeyword)
      );
    }
    return true;
  });

  const filteredContents = contentList.filter((item) => {
    if (isBookmarkOnly && !bookmarks.includes(item.id)) return false;
    if (cleanKeyword) {
      return (
        item.title.replace(/\s+/g, "").toLowerCase().includes(cleanKeyword) ||
        item.userName.replace(/\s+/g, "").toLowerCase().includes(cleanKeyword)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#D8EBFC] flex flex-col font-sans pb-16">
      <div className="max-w-7xl w-full mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        
        {/* 1. 좌측 카테고리 사이드바 */}
        <aside className="w-full md:w-44 shrink-0 flex md:flex-col gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {MAIN_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div key={cat.id} className="flex flex-col gap-1 w-full shrink-0 md:shrink">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setActiveParty(null);
                    setActiveContent(null);
                  }}
                  className={`text-left text-sm md:text-base font-extrabold px-3.5 py-2 rounded-xl transition ${
                    isSelected
                      ? "bg-[#9BB8F9] text-white shadow-sm"
                      : "text-neutral-600 hover:bg-white/40"
                  }`}
                >
                  {cat.label}
                </button>

                {/* 공방 선택 시: 초대장, 씰, 사진 프레임만 노출 */}
                {cat.id === "STUDIO" && selectedCategory === "STUDIO" && (
                  <div className="hidden md:flex flex-col gap-1 pl-3.5 pt-1 animate-in fade-in duration-150">
                    {STUDIO_SUB_CATEGORIES.map((sub) => {
                      const isSubSelected = studioSubCategory === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setStudioSubCategory(sub.id)}
                          className={`text-left text-xs font-bold py-1.5 px-2.5 rounded-lg transition ${
                            isSubSelected
                              ? "text-neutral-900 bg-white/70 font-black"
                              : "text-neutral-500 hover:text-neutral-800"
                          }`}
                        >
                          · {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </aside>

        {/* 2. 우측 메인 영역 */}
        <main className="flex-1 w-full flex flex-col gap-6 min-w-0">
          
          {/* 상단 툴바: 서치바 + 단색 북마크 아이콘 */}
          <div className="flex items-center gap-2">
            <SearchBar onSearch={(options) => setSearchFilter(options)} />

            <button
              type="button"
              onClick={() => setIsBookmarkOnly(!isBookmarkOnly)}
              className={`p-1.5 transition flex items-center justify-center rounded-lg ${
                isBookmarkOnly
                  ? "text-[#6B5A55] scale-105"
                  : "text-[#6B5A55]/60 hover:text-[#6B5A55]"
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
          </div>

          {/* 파티 카테고리 뷰 */}
          {selectedCategory === "PARTY" && (
            <div className="flex flex-col gap-6">
              {activeParty && (
                <PartyDetailCard
                  party={activeParty}
                  isBookmarked={bookmarks.includes(activeParty.id)}
                  onClose={() => setActiveParty(null)}
                  onToggleBookmark={(p) => handleToggleBookmark(p.id)}
                  onAddComment={handleAddPartyComment}
                />
              )}

              <PartyGrid
                parties={filteredParties}
                bookmarkedIds={bookmarks}
                onSelectParty={(item) => {
                  setActiveParty(item);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onToggleBookmark={(e, id) => {
                  e.stopPropagation(); // 카드 클릭(상세 열기) 방지
                  handleToggleBookmark(id);
                }}
              />

              {filteredParties.length === 0 && (
                <div className="py-20 text-center text-xs font-bold text-neutral-400 bg-white/40 rounded-3xl border border-dashed border-neutral-300">
                  {isBookmarkOnly ? "저장된 북마크 파티가 없습니다." : "검색 결과가 없습니다."}
                </div>
              )}
            </div>
          )}

          {/* 콘텐츠 카테고리 뷰 */}
          {selectedCategory === "CONTENTS" && (
            <div className="flex flex-col gap-6">
              {activeContent && (
                <ContentDetailCard
                  item={activeContent}
                  isBookmarked={bookmarks.includes(activeContent.id)}
                  onClose={() => setActiveContent(null)}
                  onToggleBookmark={(c) => handleToggleBookmark(c.id)}
                  onAddComment={handleAddContentComment}
                />
              )}

              <ContentGrid
                items={filteredContents}
                bookmarkedIds={bookmarks}
                onSelectItem={(item) => {
                  setActiveContent(item);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onToggleBookmark={(e, id) => {
                  e.stopPropagation(); // 카드 클릭(상세 열기) 방지
                  handleToggleBookmark(id);
                }}
              />

              {filteredContents.length === 0 && (
                <div className="py-20 text-center text-xs font-bold text-neutral-400 bg-white/40 rounded-3xl border border-dashed border-neutral-300">
                  {isBookmarkOnly ? "저장된 북마크 콘텐츠가 없습니다." : "검색 결과가 없습니다."}
                </div>
              )}
            </div>
          )}

          {/* 공방 카테고리 뷰 */}
          {selectedCategory === "STUDIO" && (
            <div className="py-20 text-center text-xs font-bold text-neutral-400 bg-white/40 rounded-3xl border border-dashed border-neutral-300">
              [공방 - {studioSubCategory}] 에셋 공유 및 다운로드 준비 중입니다.
            </div>
          )}

        </main>

      </div>
    </div>
  );
}