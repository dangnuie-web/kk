"use client";

import React, { useState, useRef, useEffect } from "react";

export type NavMode = "MAIN" | "VILLAGE" | "HOUSE" | "SETTINGS";

interface SideNavProps {
  currentMode: NavMode;
  onSelectMode: (mode: NavMode) => void;
  isLoggedIn?: boolean;
  userName?: string;
  onOpenLoginModal?: () => void;
}

export default function SideNav({
  currentMode,
  onSelectMode,
  isLoggedIn = false,
  userName = "당당",
  onOpenLoginModal,
}: SideNavProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 팝오버 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <aside className="hidden sm:flex w-16 md:w-20 h-screen shrink-0 border-r border-neutral-300/70 bg-[#E8E6DF] flex-col justify-between items-center py-6 select-none z-40 relative">
      
      {/* 1. 상단: 세로형 KK 로고 */}
      <button
        type="button"
        onClick={() => onSelectMode("MAIN")}
        className="flex flex-col items-center leading-none text-2xl md:text-3xl font-black tracking-tighter text-neutral-900 hover:opacity-75 transition cursor-pointer"
        title="홈으로 가기"
      >
        <span>K</span>
        <span>K</span>
      </button>

      {/* 2. 중앙: 마을 / 집 아이콘 네비게이션 (데스크톱 기준선 sm:top-28 가로 일직선 정렬) */}
      <div className="flex flex-col gap-6 items-center absolute sm:top-28 left-0 right-0">
        
        {/* 마을(Village) 아이콘 버튼 */}
        <div className="relative group flex items-center justify-center">
          <button
            type="button"
            onClick={() => onSelectMode("VILLAGE")}
            className={`w-11 h-11 rounded-[5px] flex items-center justify-center transition cursor-pointer ${
              currentMode === "VILLAGE"
                ? "bg-white/80 text-neutral-900"
                : "text-neutral-700 hover:bg-white/40"
            }`}
            aria-label="마을"
          >
            {/* 사용자 등록 마을 아이콘 (/icons/village.png) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/village.png"
              alt="마을"
              className="w-6 h-6 object-contain"
            />
          </button>
          
          {/* 호버 툴팁: 마을 */}
          <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 text-xs font-bold bg-neutral-900 text-white rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
            마을
          </span>
        </div>

        {/* 집(House) 아이콘 버튼 */}
        <div className="relative group flex items-center justify-center">
          <button
            type="button"
            onClick={() => onSelectMode("HOUSE")}
            className={`w-11 h-11 rounded-[5px] flex items-center justify-center transition cursor-pointer ${
              currentMode === "HOUSE"
                ? "bg-white/80 text-neutral-900"
                : "text-neutral-700 hover:bg-white/40"
            }`}
            aria-label="집"
          >
            {/* 사용자 등록 단독 집 아이콘 (/icons/home.png) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/home.png"
              alt="집"
              className="w-6 h-6 object-contain"
            />
          </button>

          {/* 호버 툴팁: 집 */}
          <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 text-xs font-bold bg-neutral-900 text-white rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
            집
          </span>
        </div>

      </div>

      {/* 3. 하단: 설정/자물쇠 아이콘 및 로그인/프로필 문구 */}
      <div ref={popoverRef} className="relative flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            if (!isLoggedIn && onOpenLoginModal) {
              onOpenLoginModal();
            } else {
              onSelectMode("SETTINGS");
            }
          }}
          className={`w-11 h-11 rounded-[5px] flex items-center justify-center transition cursor-pointer ${
            currentMode === "SETTINGS"
              ? "text-neutral-900 bg-white/70"
              : "text-neutral-700 hover:text-black hover:bg-white/40"
          }`}
          title={isLoggedIn ? "설정" : "로그인"}
        >
          {isLoggedIn ? (
            /* 로그인 상태: 사용자 등록 톱니바퀴 (/icons/settings.png) */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/icons/settings.png"
              alt="설정"
              className="w-6 h-6 object-contain"
            />
          ) : (
            /* 비로그인 상태: 뚜렷하고 선명한 자물쇠 아이콘 */
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2.5" ry="2.5" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </button>

        {/* 로그인 텍스트 또는 사용자 닉네임 (클릭 시 로그아웃 팝오버) */}
        {isLoggedIn ? (
          <>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="text-[11px] font-bold text-neutral-700 hover:text-black hover:bg-white/60 px-2 py-0.5 rounded-lg transition truncate max-w-[64px] text-center cursor-pointer"
              title="계정 메뉴"
            >
              {userName}
            </button>

            {/* 미니멀 드롭다운 팝오버 */}
            {isUserMenuOpen && (
              <div className="absolute left-full ml-3 bottom-0 z-50 bg-[#FFFDF8] border border-neutral-200/90 rounded-2xl p-1.5 shadow-xl flex flex-col gap-1 min-w-[124px] animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[11px] font-bold text-neutral-500 border-b border-neutral-100">
                  {userName} 님
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    if (onOpenLoginModal) onOpenLoginModal();
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:text-black hover:bg-black/5 rounded-xl transition cursor-pointer"
                >
                  계정 전환
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    window.dispatchEvent(new Event("session_expired"));
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                >
                  로그아웃
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={onOpenLoginModal}
            className="text-[11px] font-bold text-neutral-600 hover:text-black transition cursor-pointer"
          >
            로그인
          </button>
        )}
      </div>

    </aside>
  );
}
