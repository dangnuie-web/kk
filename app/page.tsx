"use client";
// 이 컴포넌트를 브라우저에서 실행되는 Client Component로 만든다.
// 클릭 이벤트, useState, useRouter 같은 기능을 쓰려면 필요.

import React from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#9BB8F9] select-none">
      {/* 봉투가 열리는 인트로 영상 (영역을 꽉 채우고 넘치는 부분은 잘림) */}
      <video
        src="/intro-envelope.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label="봉투가 열리는 인트로 영상"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* 하단 바로가기 액션 버튼 */}
      <button
        type="button"
        onClick={() => router.push("/village")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-xs font-black px-5 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white transition shadow-md"
      >
        마을 둘러보기 →
      </button>
    </div>
  );
}
