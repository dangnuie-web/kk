"use client";

import React, { useState } from "react";
import NeighborModal from "@/app/components/house/NeighborModal";

interface HouseHeaderProps {
  userId: string;
  myUserId?: string;
  houseName: string;
  followingCount?: number;
  guestCount?: number;
}

export default function HouseHeader({
  userId,
  myUserId = "dang",
  houseName,
  followingCount = 3,
  guestCount = 3,
}: HouseHeaderProps) {
  const isMe = userId === myUserId;
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [modalTab, setModalTab] = useState<"followings" | "followers" | null>(null);

  return (
    <header className="w-full flex flex-col items-center justify-center py-4 sm:py-5 px-6 md:px-10 border-b border-black/5 bg-transparent">
      {/* 중앙: 집 이름 */}
      <h1 className="text-lg md:text-xl font-black text-neutral-900 tracking-tight">
        {houseName}
      </h1>

      {/* 서브텍스트: 구독한 집 & 손님 지표 & [+ 구독] 알약 버튼 */}
      <div className="flex items-center justify-center gap-2 mt-1.5 text-xs font-bold text-neutral-500">
        <button
          type="button"
          onClick={() => setModalTab("followings")}
          className="hover:text-neutral-900 transition cursor-pointer"
        >
          구독한 집 {followingCount}
        </button>
        <span>·</span>
        <button
          type="button"
          onClick={() => setModalTab("followers")}
          className="hover:text-neutral-900 transition cursor-pointer"
        >
          손님 {guestCount}
        </button>

        {!isMe && (
          <button
            type="button"
            onClick={() => setIsSubscribed(!isSubscribed)}
            className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium transition-colors cursor-pointer ml-1 shrink-0 ${
              isSubscribed
                ? "bg-neutral-900 text-white border-neutral-900"
                : "border-neutral-300 hover:bg-neutral-100 text-neutral-800"
            }`}
          >
            {isSubscribed ? "구독 중 ✓" : "+ 구독"}
          </button>
        )}
      </div>

      {/* 구독한 집 / 손님 모달 */}
      <NeighborModal
        isOpen={Boolean(modalTab)}
        initialTab={modalTab || "followings"}
        onClose={() => setModalTab(null)}
        myUserId={myUserId}
      />
    </header>
  );
}