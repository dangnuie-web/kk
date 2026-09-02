"use client";

import React, { useState } from "react";
import Link from "next/link";

const HOUSE_CATEGORIES = ["PARTY", "CONTENTS", "GALLERY", "POSTBOX"];

export default function HousePage() {
  const [selectedCategory, setSelectedCategory] = useState("PARTY");
  const items = [1, 2]; // 시안의 더미 포스터 2개

  return (
    <div className="min-h-screen bg-[#D8EBFC] flex flex-col font-sans">
     

      {/* 2. 본문 영역 */}
      <div className="max-w-7xl w-full mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row gap-6 md:gap-10">
        {/* 좌측 사이드바: 프로필 카드 + 카테고리 메뉴 */}
        <aside className="w-full md:w-56 shrink-0 flex flex-col gap-5">
          {/* 집주인 프로필 배너 */}
          <div className="bg-[#FFFDF5] rounded-2xl p-4 shadow-sm border border-neutral-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-extrabold text-neutral-900 text-sm md:text-base">
                Dang&apos;s house
              </span>
              <span className="text-[11px] font-medium text-neutral-500 mt-1">
                Follow 3 &nbsp; Followers 3
              </span>
            </div>
            <button className="w-7 h-7 bg-[#9BB8F9] hover:bg-blue-400 text-white rounded-lg flex items-center justify-center font-bold text-sm transition">
              +
            </button>
          </div>

          {/* 하우스 서브 카테고리 */}
          <div className="grid grid-cols-2 md:flex md:flex-col gap-2">
            {HOUSE_CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`text-center md:text-left text-sm md:text-base font-extrabold px-3 py-2.5 rounded-lg transition ${
                    isSelected
                      ? "bg-[#9BB8F9] text-white shadow-sm"
                      : "text-neutral-600 hover:bg-white/40 bg-white/20 md:bg-transparent"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </aside>

        {/* 우측 메인 목록 */}
        <main className="flex-1 flex flex-col gap-6">
          {/* 상단 툴바: 검색 + 새 파티 등록 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-neutral-700 text-lg">
              <button className="hover:text-blue-600">🔍</button>
            </div>
            <button className="bg-[#3D7BF6] hover:bg-blue-600 text-white text-xs md:text-sm font-bold px-4 py-2 rounded-xl transition shadow-sm">
              새 파티 등록
            </button>
          </div>

          {/* 카드 그리드: 모바일 1열 -> 태블릿 3열 -> PC 5열 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {items.map((item) => (
              <div key={item} className="flex flex-col gap-1.5 cursor-pointer group">
                {/* 썸네일 포스터 */}
                <div className="w-full aspect-[1/1.414] bg-neutral-200 rounded-xl overflow-hidden shadow-sm flex items-center justify-center text-neutral-400 group-hover:opacity-90 transition">
                  <span className="text-xs">Post {item}</span>
                </div>
                {/* 날짜 */}
                <span className="text-[10px] text-neutral-500 px-0.5">26.10.04.금</span>
                {/* 제목 */}
                <p className="text-sm font-semibold text-neutral-900 leading-snug px-0.5 truncate">
                  랜덤 비빔밥의 날
                </p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}