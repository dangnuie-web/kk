"use client";

import React from "react";
import { NavMode } from "./SideNav";

interface MobileBottomNavProps {
  currentMode: NavMode;
  onSelectMode: (mode: NavMode) => void;
  isLoggedIn?: boolean;
  onOpenLoginModal?: () => void;
}

export default function MobileBottomNav({
  currentMode,
  onSelectMode,
  isLoggedIn = false,
  onOpenLoginModal,
}: MobileBottomNavProps) {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#FFFDF8] border-t border-neutral-200/80 flex items-center justify-around px-6 z-40 select-none shadow-sm">
      {/* 1. 마을 버튼 */}
      <button
        type="button"
        onClick={() => onSelectMode("VILLAGE")}
        className={`flex items-center justify-center p-2.5 rounded-[12px] transition cursor-pointer ${
          currentMode === "VILLAGE"
            ? "bg-[#E8E6DF] text-neutral-900"
            : "text-neutral-800 hover:text-black"
        }`}
        aria-label="마을"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/village.png"
          alt="마을"
          className="w-6 h-6 object-contain"
        />
      </button>

      {/* 2. 집 버튼 */}
      <button
        type="button"
        onClick={() => onSelectMode("HOUSE")}
        className={`flex items-center justify-center p-2.5 rounded-[12px] transition cursor-pointer ${
          currentMode === "HOUSE"
            ? "bg-[#E8E6DF] text-neutral-900"
            : "text-neutral-800 hover:text-black"
        }`}
        aria-label="집"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/home.png"
          alt="집"
          className="w-6 h-6 object-contain"
        />
      </button>

      {/* 3. 설정 / 로그인 버튼 */}
      <button
        type="button"
        onClick={() => {
          if (!isLoggedIn && onOpenLoginModal) {
            onOpenLoginModal();
          } else {
            onSelectMode("SETTINGS");
          }
        }}
        className={`flex items-center justify-center p-2.5 rounded-[12px] transition cursor-pointer ${
          currentMode === "SETTINGS"
            ? "bg-[#E8E6DF] text-neutral-900"
            : "text-neutral-800 hover:text-black"
        }`}
        aria-label={isLoggedIn ? "설정" : "로그인"}
      >
        {isLoggedIn ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/icons/settings.png"
            alt="설정"
            className="w-6 h-6 object-contain"
          />
        ) : (
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        )}
      </button>
    </nav>
  );
}
