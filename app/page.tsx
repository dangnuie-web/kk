"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#9BB8F9] flex flex-col items-center justify-center p-6 md:p-12 font-sans select-none">
      
      {/* 1. 상단 소개 텍스트 슬롯 */}
      <div className="flex flex-col items-center text-center gap-2 mb-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
        <span className="text-xs md:text-sm font-medium tracking-wide text-neutral-800 italic">
          Small Brands Fair Seoul 2026
        </span>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900">
          BRANDERS
          <br />
          HOLIDAY
        </h1>
        <p className="text-xs md:text-sm font-bold text-neutral-800 mt-1">
          마켓에 참여할 작은 브랜드를 소개합니다
        </p>
      </div>

      {/* 2. 중앙 집 모양 그래픽 / 배너 슬롯 */}
      <div className="relative w-full max-w-lg aspect-[4/3] bg-[#F4EFE6] rounded-t-[40px] rounded-b-3xl shadow-2xl border-4 border-white/60 p-8 flex flex-col items-center justify-center gap-6 animate-in zoom-in-95 duration-300">
        
        {/* 지붕 느낌을 주는 삼각/경사 형태 상단 쉐입 */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[36px] border-l-transparent border-r-[36px] border-r-transparent border-b-[24px] border-b-[#F4EFE6]" />

        {/* 브랜드 / 컨텐츠 로고 나열 예시 */}
        <div className="flex flex-col items-center gap-4 w-full text-neutral-900 font-black">
          <span className="text-3xl md:text-4xl tracking-tighter">anu</span>
          <span className="text-xl md:text-2xl tracking-tight">SLEEPYGOM</span>
          <span className="text-lg md:text-xl">Factory Normal</span>
          <div className="flex items-center gap-6 mt-1 text-sm md:text-base font-serif italic text-neutral-700">
            <span>Manifold</span>
            <span className="font-sans font-black not-italic text-neutral-900">TélioT</span>
          </div>
        </div>

        {/* 하단 바로가기 액션 버튼 */}
        <button
          type="button"
          onClick={() => router.push("/village")}
          className="mt-2 text-xs font-black px-5 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white transition shadow-md"
        >
          마을 둘러보기 →
        </button>
      </div>

    </div>
  );
}