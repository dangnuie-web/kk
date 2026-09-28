"use client";

import React, { useState, useRef, useEffect } from "react";
import { NavMode } from "./SideNav";

interface MobileHeaderProps {
  currentMode: NavMode;
  activeCategory: string;
  onSelectCategory: (catId: string) => void;
  studioSubCategory?: string;
  onSelectStudioSub?: (subId: string) => void;
  onGoHome?: () => void;
  isLoggedIn?: boolean;
}

export default function MobileHeader({
  currentMode,
  activeCategory,
  onSelectCategory,
  studioSubCategory = "INVITATION",
  onSelectStudioSub,
  onGoHome,
  isLoggedIn = false,
}: MobileHeaderProps) {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 셀렉터 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(e.target as Node)
      ) {
        setIsSelectorOpen(false);
      }
    };
    if (isSelectorOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSelectorOpen]);

  if (currentMode === "SETTINGS" || currentMode === "MAIN") {
    return null;
  }

  // 현재 선택된 탭 라벨 판별
  const getCurrentLabel = () => {
    if (activeCategory === "PARTY") return "파티";
    if (activeCategory === "CONTENTS") return "콘텐츠";
    if (activeCategory === "GALLERY") return "갤러리";
    if (activeCategory === "POSTBOX") return "우체통";
    if (activeCategory === "STUDIO") {
      if (studioSubCategory === "SEAL") return "공방 · 씰";
      if (studioSubCategory === "FRAME") return "공방 · 사진 프레임";
      return "공방 · 초대장";
    }
    return "파티";
  };

  const handleSelect = (catId: string) => {
    onSelectCategory(catId);
    setIsSelectorOpen(false);
  };

  const handleStudioSelect = (sub: string) => {
    if (onSelectStudioSub) onSelectStudioSub(sub);
    onSelectCategory("STUDIO");
    setIsSelectorOpen(false);
  };

  return (
    <header className="sm:hidden w-full bg-[#FFFDF8] border-b border-neutral-200/80 px-5 pt-3 pb-2.5 flex flex-col gap-2 select-none sticky top-0 z-40">
      {/* 1. 최상단: KK 로고 + 검색 / 북마크 아이콘 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onGoHome}
          className="text-2xl font-black text-neutral-900 tracking-tighter leading-none cursor-pointer"
        >
          KK
        </button>

        <div className="flex items-center gap-3 text-neutral-800">
          {/* 돋보기 검색 아이콘 */}
          <button
            type="button"
            onClick={() => {
              const searchInput = document.querySelector("input[type='text']") as HTMLInputElement;
              if (searchInput) {
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
            className="p-1 text-neutral-800 hover:text-black cursor-pointer transition"
            title="검색"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* 북마크 아이콘 */}
          <button
            type="button"
            onClick={() => {
              const bookmarkBtn = document.querySelector("button[title*='목록만 보기'], button[title*='전체 보기']") as HTMLButtonElement;
              if (bookmarkBtn) {
                bookmarkBtn.click();
              } else if (!isLoggedIn) {
                window.dispatchEvent(
                  new CustomEvent("auth_required", {
                    detail: { noticeMessage: "북마크를 확인하려면 로그인이 필요합니다." },
                  })
                );
              }
            }}
            className="p-1 text-neutral-800 hover:text-black cursor-pointer transition"
            title="북마크"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. 단정한 선택형 미니멀 셀렉터 (현재 선택된 1개 탭만 알약 버튼으로 노출) */}
      <div className="relative inline-block" ref={selectorRef}>
        <button
          type="button"
          onClick={() => setIsSelectorOpen(!isSelectorOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8E6DF] hover:bg-[#DFDBD2] text-xs font-bold text-neutral-900 border border-black/5 transition shadow-2xs active:scale-95 cursor-pointer"
        >
          <span>{getCurrentLabel()}</span>
          <svg
            className={`w-3 h-3 text-neutral-600 transition-transform duration-200 ${
              isSelectorOpen ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* 미니멀 셀렉터 드롭다운 팝오버 */}
        {isSelectorOpen && (
          <div className="absolute left-0 top-full mt-1.5 bg-[#FFFDF8] border border-neutral-200/90 rounded-2xl p-1.5 shadow-xl flex flex-col gap-0.5 min-w-[160px] z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* 파티 */}
            <button
              type="button"
              onClick={() => handleSelect("PARTY")}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition flex items-center justify-between cursor-pointer ${
                activeCategory === "PARTY"
                  ? "bg-[#E8E6DF] text-neutral-900 font-black"
                  : "text-neutral-700 hover:bg-black/5"
              }`}
            >
              <span>파티</span>
              {activeCategory === "PARTY" && <span className="text-[10px]">✓</span>}
            </button>

            {/* 콘텐츠 */}
            <button
              type="button"
              onClick={() => handleSelect("CONTENTS")}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition flex items-center justify-between cursor-pointer ${
                activeCategory === "CONTENTS"
                  ? "bg-[#E8E6DF] text-neutral-900 font-black"
                  : "text-neutral-700 hover:bg-black/5"
              }`}
            >
              <span>콘텐츠</span>
              {activeCategory === "CONTENTS" && <span className="text-[10px]">✓</span>}
            </button>

            {/* 집(HOUSE) 전용: 갤러리 */}
            {currentMode === "HOUSE" && (
              <button
                type="button"
                onClick={() => handleSelect("GALLERY")}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition flex items-center justify-between cursor-pointer ${
                  activeCategory === "GALLERY"
                    ? "bg-[#E8E6DF] text-neutral-900 font-black"
                    : "text-neutral-700 hover:bg-black/5"
                }`}
              >
                <span>갤러리</span>
                {activeCategory === "GALLERY" && <span className="text-[10px]">✓</span>}
              </button>
            )}

            {/* 집(HOUSE) 전용: 우체통 */}
            {currentMode === "HOUSE" && (
              <button
                type="button"
                onClick={() => handleSelect("POSTBOX")}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition flex items-center justify-between cursor-pointer ${
                  activeCategory === "POSTBOX"
                    ? "bg-[#E8E6DF] text-neutral-900 font-black"
                    : "text-neutral-700 hover:bg-black/5"
                }`}
              >
                <span>우체통</span>
                {activeCategory === "POSTBOX" && <span className="text-[10px]">✓</span>}
              </button>
            )}

            {/* 구분선 */}
            <div className="h-px bg-neutral-200/60 my-1" />

            {/* 공방 (서브메뉴 포함) */}
            <div className="flex flex-col gap-0.5">
              <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                공방
              </div>
              <button
                type="button"
                onClick={() => handleStudioSelect("INVITATION")}
                className={`w-full text-left pl-5 pr-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center justify-between cursor-pointer ${
                  activeCategory === "STUDIO" && studioSubCategory === "INVITATION"
                    ? "bg-[#E8E6DF] text-neutral-900 font-black"
                    : "text-neutral-600 hover:bg-black/5"
                }`}
              >
                <span>초대장</span>
                {activeCategory === "STUDIO" && studioSubCategory === "INVITATION" && (
                  <span className="text-[10px]">✓</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleStudioSelect("SEAL")}
                className={`w-full text-left pl-5 pr-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center justify-between cursor-pointer ${
                  activeCategory === "STUDIO" && studioSubCategory === "SEAL"
                    ? "bg-[#E8E6DF] text-neutral-900 font-black"
                    : "text-neutral-600 hover:bg-black/5"
                }`}
              >
                <span>씰</span>
                {activeCategory === "STUDIO" && studioSubCategory === "SEAL" && (
                  <span className="text-[10px]">✓</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleStudioSelect("FRAME")}
                className={`w-full text-left pl-5 pr-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center justify-between cursor-pointer ${
                  activeCategory === "STUDIO" && studioSubCategory === "FRAME"
                    ? "bg-[#E8E6DF] text-neutral-900 font-black"
                    : "text-neutral-600 hover:bg-black/5"
                }`}
              >
                <span>사진 프레임</span>
                {activeCategory === "STUDIO" && studioSubCategory === "FRAME" && (
                  <span className="text-[10px]">✓</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
