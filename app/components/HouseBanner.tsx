"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NeighborModal from "@/app/components/house/NeighborModal";


interface UserItem {
  id: string;
  name: string;
  houseName: string;
  avatarBg: string;
}

// 기본 Mock 데이터
const DEFAULT_FOLLOWINGS: UserItem[] = [
  { id: "kongkong", name: "콩콩이", houseName: "Kong Kong Zip", avatarBg: "#FDE047" },
  { id: "green", name: "초록이", houseName: "Green Forest", avatarBg: "#86EFAC" },
  { id: "mint", name: "민트", houseName: "Mint Paradise", avatarBg: "#6EE7B7" },
];

const DEFAULT_FOLLOWERS: UserItem[] = [
  { id: "orange", name: "오렌지", houseName: "Orange House", avatarBg: "#FDBA74" },
  { id: "berry", name: "베리", houseName: "Berry Sweet", avatarBg: "#F472B6" },
  { id: "kongkong", name: "콩콩이", houseName: "Kong Kong Zip", avatarBg: "#FDE047" },
];

export default function HouseBanner({ userId }: { userId: string }) {
  const router = useRouter();
  const myUserId = "dang";
  const isOwner = userId === myUserId;

  // 내 이웃 목록 (내가 추가한 사람)
  const [myFollowings, setMyFollowings] = useState<UserItem[]>([]);
  // 현재 보고 있는 하우스 주인의 이웃/나를 추가한 이웃
  const [displayFollowers] = useState<UserItem[]>(DEFAULT_FOLLOWERS);

  // 1. LocalStorage에서 내 이웃 목록 동기화
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`following_users_${myUserId}`);
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount
        setMyFollowings(JSON.parse(saved));
      } else {
        setMyFollowings(DEFAULT_FOLLOWINGS);
        localStorage.setItem(`following_users_${myUserId}`, JSON.stringify(DEFAULT_FOLLOWINGS));
      }
    } catch (e) {
      console.error(e);
    }
  }, [myUserId]);

  // 2. 현재 방문한 집을 내가 이미 이웃 추가했는지 확인
  const isAlreadyFollowing = myFollowings.some((u) => u.id === userId);

  // 3. 이웃 맺기 / 이웃 취소 토글 함수
  const handleToggleFollow = () => {
    let nextList: UserItem[];
    if (isAlreadyFollowing) {
      // 이웃 삭제
      nextList = myFollowings.filter((u) => u.id !== userId);
    } else {
      // 새 이웃 추가
      const newUser: UserItem = {
        id: userId,
        name: `${userId}님`,
        houseName: `${userId}’s zip`,
        avatarBg: "#FDE047",
      };
      nextList = [...myFollowings, newUser];
    }

    setMyFollowings(nextList);
    localStorage.setItem(`following_users_${myUserId}`, JSON.stringify(nextList));
  };

  // 모달 상태 ('followings': 구독한 집 | 'followers': 손님)
  const [modalTab, setModalTab] = useState<"followings" | "followers" | null>(null);

  const houseTitle = isOwner ? "Dang’s house" : `${userId}’s zip`;

  return (
    <div className="w-full rounded-2xl p-4 shadow-sm border border-black/5 flex items-center justify-between bg-[#FEF08A]">
      {/* 좌측: 타이틀 & 이웃 통계 */}
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-black text-neutral-900 tracking-tight">
          {houseTitle}
        </h2>
        <div className="flex items-center gap-2.5 text-[11px] font-bold text-neutral-700">
          <button
            type="button"
            onClick={() => setModalTab("followings")}
            className="hover:text-blue-700 transition flex items-center gap-1 cursor-pointer"
          >
            <span>구독한 집</span>
            <strong className="text-neutral-900 font-black">
              {isOwner ? myFollowings.length : DEFAULT_FOLLOWINGS.length}
            </strong>
          </button>
          <button
            type="button"
            onClick={() => setModalTab("followers")}
            className="hover:text-blue-700 transition flex items-center gap-1 cursor-pointer"
          >
            <span>손님</span>
            <strong className="text-neutral-900 font-black">{displayFollowers.length}</strong>
          </button>
        </div>
      </div>

      {/* 우측 버튼 영역 */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isOwner ? (
          <button
            type="button"
            onClick={() => alert("프로필 / 하우스 설정 모달")}
            className="w-7 h-7 rounded-lg bg-black/5 hover:bg-black/10 flex items-center justify-center text-xs text-neutral-700 transition"
            title="하우스 설정"
          >
            ⚙️
          </button>
        ) : (
          <>
            {/* 1. 이웃 맺기 / 이웃 중 버튼 (왼쪽) */}
            <button
              type="button"
              onClick={handleToggleFollow}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition shadow-sm ${
                isAlreadyFollowing
                  ? "bg-neutral-900 text-white hover:bg-black"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              title={isAlreadyFollowing ? "구독 중 (클릭 시 취소)" : "구독하기"}
            >
              {isAlreadyFollowing ? "✓" : "+"}
            </button>

            {/* 2. 우리집 가기 버튼 (오른쪽) */}
            <button
              type="button"
              onClick={() => router.push(`/house/${myUserId}/party`)}
              className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white text-neutral-800 flex items-center justify-center text-xs transition shadow-sm"
              title="내 하우스로 가기"
            >
              🏠
            </button>
          </>
        )}
      </div>

      {/* 이웃 목록 모달 */}
      <NeighborModal
        isOpen={Boolean(modalTab)}
        initialTab={modalTab || "followings"}
        onClose={() => setModalTab(null)}
        myUserId={myUserId}
      />
    </div>
  );
}