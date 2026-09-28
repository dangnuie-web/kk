"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchBar, { FilterOptions } from "@/app/components/SearchBar";
import PartyDetailCard from "@/app/components/village/PartyDetailCard";
import PartyGrid from "@/app/components/village/PartyGrid";
import ContentDetailCard from "@/app/components/village/ContentDetailCard";
import ContentGrid from "@/app/components/village/ContentGrid";
import { VillagePartyItem, VillageContentItem } from "@/app/types/village";
import { MOCK_USERS } from "@/app/data/mockUsers";

const DEFAULT_VILLAGE_PARTIES: VillagePartyItem[] = [
  {
    id: "mock-party-1",
    userId: "kongkong",
    userName: "콩콩",
    title: "보드게임 올데이 파티",
    eventDate: "26.10.11.금",
    content: "카탄, 루미큐브, 스플렌더까지 밤새 달려봅시다!\n주전부리는 각자 먹을 만큼 챙겨와 주세요.",
    posterImage: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600&auto=format&fit=crop&q=80",
    createdAt: 1729000000000,
    comments: [{ id: 1, author: "초록", text: "저 보드게임 고수인데 참가 가능한가요?" }],
  },
  {
    id: "mock-party-2",
    userId: "haru",
    userName: "하루",
    title: "반려식물 분갈이 & 홈카페",
    eventDate: "26.10.08.화",
    content: "가을맞이 분갈이 흙과 화분을 나눕니다. 따뜻한 드립커피 한잔해요.",
    posterImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    createdAt: 1728500000000,
    comments: [],
  },
  {
    id: "mock-party-3",
    userId: "mint",
    userName: "민트",
    title: "랜덤 비빔밥의 날",
    eventDate: "26.10.04.금",
    content: "각자 재료 하나씩 들고와서 커다란 양푼에 비벼먹어요!",
    posterImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80",
    createdAt: 1728000000000,
    comments: [],
  },
];

const DEFAULT_VILLAGE_CONTENTS: VillageContentItem[] = [
  {
    id: "mock-content-1",
    userId: "haru",
    userName: "하루",
    title: "우리집 여름 메뉴판",
    content: "여름 동안 즐겨 마신 음료와 간단한 브런치 레시피를 공유합니다.",
    coverImage: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=900&auto=format&fit=crop&q=80",
    createdAt: 1728900000000,
    comments: [
      { id: 1, author: "콩콩", text: "레시피 너무 좋아요!" },
      { id: 2, author: "당당", text: "메뉴판 손글씨 너무 귀여워요!" },
    ],
  },
  {
    id: "mock-content-2",
    userId: "kongkong",
    userName: "콩콩",
    title: "나만의 홈카페 레시피 모음",
    content: "원두 블렌딩 비율과 홈메이드 바닐라빈 시럽 만드는 방법 공유합니다.",
    coverImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=80",
    createdAt: 1728600000000,
    comments: [],
  },
];

function VillageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 쿼리 파라미터(?tab=party | ?tab=contents | ?tab=studio)
  const tabParam = searchParams.get("tab")?.toUpperCase() || "PARTY";
  const selectedCategory = ["PARTY", "CONTENTS", "STUDIO"].includes(tabParam)
    ? tabParam
    : "PARTY";

  const subParam = searchParams.get("sub")?.toUpperCase() || "INVITATION";

  // tab=studio로 들어온 경우 즉시 공방 초대장 페이지로 이동
  useEffect(() => {
    if (tabParam === "STUDIO") {
      router.replace("/village/craft/invitation");
    }
  }, [tabParam, router]);

  // 피드 및 상세 데이터 상태
  const [partyList, setPartyList] = useState<VillagePartyItem[]>(DEFAULT_VILLAGE_PARTIES);
  const [activeParty, setActiveParty] = useState<VillagePartyItem | null>(null);

  const [contentList, setContentList] = useState<VillageContentItem[]>(DEFAULT_VILLAGE_CONTENTS);
  const [activeContent, setActiveContent] = useState<VillageContentItem | null>(null);

  // 탭 변경 시 열려있던 상세 카드 닫기
  useEffect(() => {
    setActiveParty(null);
    setActiveContent(null);
  }, [selectedCategory]);

  // 로그인 상태 동기화
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      try {
        setIsLoggedIn(localStorage.getItem("is_logged_in") === "true");
      } catch {
        setIsLoggedIn(false);
      }
    };
    syncAuth();
    window.addEventListener("auth_state_changed", syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener("auth_state_changed", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  // 검색 & 북마크
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

  // 마을 파티 연동 (모든 유저들의 등록 파티 집계 + 기본 목 데이터 결합)
  useEffect(() => {
    const loadParties = () => {
      try {
        const userIds = ["dang", "kongkong", "mint", "haru", "mori"];
        const allParties: VillagePartyItem[] = [];

        userIds.forEach((uId) => {
          const saved = localStorage.getItem(`party_posts_${uId}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            const uInfo = MOCK_USERS.find((mu) => mu.id === uId);
            allParties.push(
              ...parsed.map((item: any) => ({
                id: item.id,
                userId: uId,
                userName: uInfo?.name || item.userName || "익명",
                title: item.title,
                content: item.content || "하우스에서 등록된 파티입니다.",
                eventDate: item.eventDate,
                posterImage: item.posterImage,
                createdAt: item.createdAt || Date.now(),
                comments: item.comments || [],
              }))
            );
          }
        });

        allParties.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        // 사용자 등록 파티 우선 + 기본 목 파티 결합
        const customIds = new Set(allParties.map((p) => String(p.id)));
        const combined = [
          ...allParties,
          ...DEFAULT_VILLAGE_PARTIES.filter((p) => !customIds.has(String(p.id))),
        ];
        combined.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setPartyList(combined);
      } catch {
        setPartyList(DEFAULT_VILLAGE_PARTIES);
      }
    };

    loadParties();
    window.addEventListener("storage", loadParties);
    return () => window.removeEventListener("storage", loadParties);
  }, []);

  // 마을 콘텐츠 연동 (모든 유저들의 등록 콘텐츠 집계 + 기본 목 데이터 결합)
  useEffect(() => {
    const loadContents = () => {
      try {
        const userIds = ["dang", "kongkong", "mint", "haru", "mori"];
        const allContents: VillageContentItem[] = [];

        userIds.forEach((uId) => {
          const saved = localStorage.getItem(`content_posts_${uId}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            const uInfo = MOCK_USERS.find((mu) => mu.id === uId);
            allContents.push(
              ...parsed.map((item: any) => ({
                id: item.id,
                userId: uId,
                userName: uInfo?.name || item.userName || "익명",
                title: item.title,
                content: item.content || "하우스에서 등록된 콘텐츠입니다.",
                coverImage: item.coverImage,
                createdAt: item.createdAt || Date.now(),
                comments: item.comments || [],
              }))
            );
          }
        });

        allContents.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        const customContentIds = new Set(allContents.map((c) => String(c.id)));
        const combinedContents = [
          ...allContents,
          ...DEFAULT_VILLAGE_CONTENTS.filter((c) => !customContentIds.has(String(c.id))),
        ];
        combinedContents.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setContentList(combinedContents);
      } catch {
        setContentList(DEFAULT_VILLAGE_CONTENTS);
      }
    };

    loadContents();
    window.addEventListener("storage", loadContents);
    return () => window.removeEventListener("storage", loadContents);
  }, []);

  const handleToggleBookmark = (id: string | number) => {
    if (!isLoggedIn) {
      window.dispatchEvent(
        new CustomEvent("auth_required", {
          detail: { noticeMessage: "북마크를 저장하려면 로그인이 필요합니다." },
        })
      );
      return;
    }
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
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col font-sans pb-16">
      <div className="w-full px-4 sm:px-6 md:px-10 py-4 sm:pt-28 sm:pb-8 flex flex-col gap-4 sm:gap-6">
        {/* 상단 툴바: 데스크탑 전용 (모바일에서는 MobileHeader가 상단에 노출) */}
        <div className="hidden sm:flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SearchBar onSearch={(options) => setSearchFilter(options)} />
          </div>

          <div className="flex items-center gap-3">
            {/* 로그인 상태: 깔끔하게 북마크 아이콘 버튼만 노출 */}
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => setIsBookmarkOnly(!isBookmarkOnly)}
                className={`p-1.5 transition flex items-center justify-center rounded-lg cursor-pointer ${
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
            ) : (
              /* 비로그인(게스트) 상태: [로그인] 알약 버튼 */
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("auth_required", {
                      detail: { noticeMessage: undefined },
                    })
                  )
                }
                className="bg-black text-white hover:bg-neutral-800 text-xs font-bold px-4 py-1.5 rounded-full transition shadow-xs cursor-pointer"
              >
                로그인
              </button>
            )}
          </div>
        </div>

        {/* 1. 파티 뷰 */}
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
                if (!isLoggedIn) {
                  window.dispatchEvent(
                    new CustomEvent("auth_required", {
                      detail: { noticeMessage: "파티 상세 내용을 확인하려면 로그인이 필요합니다." },
                    })
                  );
                  return;
                }
                setActiveParty(item);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onToggleBookmark={(e, id) => {
                e.stopPropagation();
                handleToggleBookmark(id);
              }}
            />

            {filteredParties.length === 0 && (
              <div className="py-24 text-center text-xs md:text-sm font-medium text-neutral-400">
                {isBookmarkOnly
                  ? "저장된 북마크 파티가 없습니다."
                  : cleanKeyword
                  ? "검색 결과가 없습니다."
                  : "등록된 파티가 없습니다."}
              </div>
            )}
          </div>
        )}

        {/* 2. 콘텐츠 뷰 */}
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
                if (!isLoggedIn) {
                  window.dispatchEvent(
                    new CustomEvent("auth_required", {
                      detail: { noticeMessage: "콘텐츠 상세 내용을 확인하려면 로그인이 필요합니다." },
                    })
                  );
                  return;
                }
                setActiveContent(item);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onToggleBookmark={(e, id) => {
                e.stopPropagation();
                handleToggleBookmark(id);
              }}
            />

            {filteredContents.length === 0 && (
              <div className="py-24 text-center text-xs md:text-sm font-medium text-neutral-400">
                {isBookmarkOnly
                  ? "저장된 북마크 콘텐츠가 없습니다."
                  : cleanKeyword
                  ? "검색 결과가 없습니다."
                  : "등록된 콘텐츠가 없습니다."}
              </div>
            )}
          </div>
        )}

        {/* 3. 공방 뷰 */}
        {selectedCategory === "STUDIO" && (
          <div className="py-24 text-center text-xs md:text-sm font-medium text-neutral-400">
            [공방 - {subParam}] 영역 준비 중입니다.
          </div>
        )}
      </div>
    </div>
  );
}

export default function VillagePage() {
  return (
    <Suspense fallback={<div className="p-10 text-neutral-400">불러오는 중...</div>}>
      <VillageContent />
    </Suspense>
  );
}
