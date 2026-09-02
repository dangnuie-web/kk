"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const myUserId = "dang"; // 로그인된 내 아이디

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 바깥 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 드롭다운 메뉴 컴포넌트
  const ProfileDropdown = () => (
    <div className="absolute right-0 mt-2 w-48 bg-[#3D7BF6] text-white rounded-2xl p-2 shadow-xl border border-blue-400 animate-in fade-in zoom-in-95 duration-150 z-50">
      <div className="px-3 py-2 border-b border-white/20">
        <span className="font-black text-sm block">당니</span>
        <span className="text-[10px] text-white/70">@{myUserId}</span>
      </div>

      <div className="py-1 flex flex-col gap-0.5 text-xs font-bold">
        <Link
          href={`/house/${myUserId}/party`}
          onClick={() => setIsMenuOpen(false)}
          className="px-3 py-2 hover:bg-white/10 rounded-xl transition flex items-center gap-2"
        >
          🏠 내 하우스 바로가기
        </Link>
        <Link
          href={`/house/${myUserId}/postbox`}
          onClick={() => setIsMenuOpen(false)}
          className="px-3 py-2 hover:bg-white/10 rounded-xl transition flex items-center gap-2"
        >
          📬 내 우체통 보관함
        </Link>
        <button
          onClick={() => {
            alert("계정 설정 모달 (준비 중)");
            setIsMenuOpen(false);
          }}
          className="px-3 py-2 hover:bg-white/10 rounded-xl transition text-left flex items-center gap-2"
        >
          ⚙️ 설정
        </button>
      </div>

      <div className="pt-1 border-t border-white/20">
        <button
          onClick={() => {
            alert("모의 로그아웃 되었습니다.");
            setIsMenuOpen(false);
          }}
          className="w-full text-left px-3 py-1.5 hover:bg-white/10 rounded-xl text-[11px] font-bold text-white/80 transition"
        >
          로그아웃
        </button>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-[#F4EFEA] border-b border-neutral-200/80 px-4 md:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* PC: 좌측 묶음 (로고 + 대 카테고리) / 모바일: 상단 로고줄 */}
      <div className="flex items-center justify-between md:justify-start md:gap-8 w-full md:w-auto">
        {/* 로고 영역 */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight">
            Knock Knock
          </span>
        </Link>

        {/* 📱 모바일 우측 프로필 아이콘 + 드롭다운 */}
        <div className="relative md:hidden" ref={isMenuOpen ? menuRef : null}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="w-8 h-8 rounded-full bg-neutral-300 hover:ring-2 hover:ring-blue-400 transition-all flex items-center justify-center text-xs font-bold text-neutral-700 overflow-hidden cursor-pointer"
          >
            당
          </button>
          {isMenuOpen && <ProfileDropdown />}
        </div>

        {/* 💻 PC 화면용 대 카테고리 (로고 바로 옆) */}
        <nav className="hidden md:flex items-center gap-6 text-base md:text-lg font-bold">
          <Link
            href="/village"
            className={`transition ${
              pathname.startsWith("/village")
                ? "text-neutral-900 border-b-2 border-neutral-900 pb-0.5"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            마을
          </Link>
          <Link
            href={`/house/${myUserId}/party`}
            className={`transition ${
              pathname.startsWith("/house")
                ? "text-neutral-900 border-b-2 border-neutral-900 pb-0.5"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            집
          </Link>
        </nav>
      </div>

      {/* 📱 모바일 화면용 대 카테고리 (로고 아래 2번째 줄) */}
      <nav className="flex md:hidden items-center gap-6 text-base font-bold">
        <Link
          href="/village"
          className={`transition ${
            pathname.startsWith("/village")
              ? "text-neutral-900 border-b-2 border-neutral-900 pb-0.5"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          Village
        </Link>
        <Link
          href={`/house/${myUserId}/party`}
          className={`transition ${
            pathname.startsWith("/house")
              ? "text-neutral-900 border-b-2 border-neutral-900 pb-0.5"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          House
        </Link>
      </nav>

      {/* 💻 PC 우측 프로필 아이콘 + 드롭다운 */}
      <div className="hidden md:block relative" ref={isMenuOpen ? menuRef : null}>
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="w-9 h-9 rounded-full bg-neutral-300 hover:ring-2 hover:ring-blue-400 transition-all flex items-center justify-center text-sm font-bold text-neutral-700 overflow-hidden cursor-pointer"
        >
          당
        </button>
        {isMenuOpen && <ProfileDropdown />}
      </div>
    </header>
  );
}