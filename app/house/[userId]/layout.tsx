"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import HouseHeader from "@/app/components/house/HouseHeader";
import { MOCK_USERS } from "@/app/data/mockUsers";

export default function HouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const userId = (params?.userId as string) || "dang";
  const [currentUserId, setCurrentUserId] = useState<string>("dang");

  // 현재 방문한 집의 유저 데이터
  const targetUser = MOCK_USERS.find((u) => u.id === userId);
  const defaultName = targetUser ? targetUser.houseName : `${userId}의 집`;
  const [customHouseName, setCustomHouseName] = useState<string>(defaultName);

  useEffect(() => {
    const syncData = () => {
      try {
        const savedId = localStorage.getItem("current_user_id");
        if (savedId) setCurrentUserId(savedId);

        // 내 집 커스텀 이름 동기화
        const savedName = localStorage.getItem(`house_name_${userId}`);
        if (savedName) {
          if (userId === "dang" && (savedName.includes("콩콩") || savedName.includes("민트") || savedName.includes("오렌지"))) {
            setCustomHouseName(targetUser?.houseName || "당당이네 집");
            localStorage.setItem("house_name_dang", targetUser?.houseName || "당당이네 집");
          } else {
            setCustomHouseName(savedName);
          }
        } else if (targetUser) {
          setCustomHouseName(targetUser.houseName);
        }
      } catch {
        // ignore
      }
    };
    syncData();
    window.addEventListener("storage", syncData);
    window.addEventListener("user_profile_updated", syncData);
    window.addEventListener("auth_state_changed", syncData);
    return () => {
      window.removeEventListener("storage", syncData);
      window.removeEventListener("user_profile_updated", syncData);
      window.removeEventListener("auth_state_changed", syncData);
    };
  }, [userId, targetUser]);

  return (
    <div className="w-full min-h-screen bg-[#FFFDF8] flex flex-col font-sans">
      {/* ⭐️ 모든 집 서브 카테고리(파티, 콘텐츠, 갤러리, 우체통 등) 공통 상단 헤더 */}
      <HouseHeader
        userId={userId}
        myUserId={currentUserId}
        houseName={customHouseName}
        followingCount={targetUser?.subscribedCount ?? 3}
        guestCount={targetUser?.guestCount ?? 3}
      />

      {/* 서브 카테고리별 본문 영역 */}
      <div className="flex-1 w-full min-w-0">
        {children}
      </div>
    </div>
  );
}