"use client";
// 이 컴포넌트를 브라우저에서 실행되는 Client Component로 만든다.
// 클릭 이벤트, useState, useRouter 같은 기능을 쓰려면 필요.

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
      <div className="relative w-full max-w-lg aspect-[4/3] bg-[#F4EFE6] rounded-t-[40px] rounded-b-3xl shadow-2xl border-4 border-white/60 p-8 flex flex-col items-center justify-end gap-6 animate-in zoom-in-95 duration-300">
        
        {/* 지붕 느낌을 주는 삼각/경사 형태 상단 쉐입 */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[36px] border-l-transparent border-r-[36px] border-r-transparent border-b-[24px] border-b-[#F4EFE6]" />

        {/* 봉투가 열리는 인트로 영상 (카드를 가득 채움, 지붕 쉐입이 잘리지 않도록 안쪽 래퍼에서만 자름) */}
        <div className="absolute inset-0 rounded-t-[36px] rounded-b-[20px] overflow-hidden">
          <video
            src="/intro-envelope.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="봉투가 열리는 인트로 영상"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 하단 바로가기 액션 버튼 */}
        <button
          type="button"
          onClick={() => router.push("/village")}
          className="relative z-10 mt-2 text-xs font-black px-5 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white transition shadow-md"
        >
          마을 둘러보기 →
        </button>
      </div>

    </div>
  );
}