"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

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

  const [mounted, setMounted] = useState(false);
  
  // 내 이웃 목록 (내가 추가한 사람)
  const [myFollowings, setMyFollowings] = useState<UserItem[]>([]);
  // 현재 보고 있는 하우스 주인의 이웃/나를 추가한 이웃
  const [displayFollowers] = useState<UserItem[]>(DEFAULT_FOLLOWERS);

  // 1. LocalStorage에서 내 이웃 목록 동기화
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(`following_users_${myUserId}`);
      if (saved) {
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

  // 모달 상태 ('followings': 내가 맺은 이웃 | 'followers': 나를 추가한 이웃)
  const [modalTab, setModalTab] = useState<"followings" | "followers" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const currentList = modalTab === "followings" ? myFollowings : displayFollowers;
  const filteredList = currentList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.houseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveFromList = (targetId: string) => {
    if (modalTab === "followings") {
      const next = myFollowings.filter((u) => u.id !== targetId);
      setMyFollowings(next);
      localStorage.setItem(`following_users_${myUserId}`, JSON.stringify(next));
    }
  };

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
            onClick={() => {
              setSearchQuery("");
              setModalTab("followings");
            }}
            className="hover:text-blue-700 transition flex items-center gap-1 cursor-pointer"
          >
            <span>구독한 집</span>
            <strong className="text-neutral-900 font-black">
              {isOwner ? myFollowings.length : DEFAULT_FOLLOWINGS.length}
            </strong>
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setModalTab("followers");
            }}
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
      {mounted && modalTab &&
        createPortal(
          <div
            onClick={() => setModalTab(null)}
            className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col gap-4 relative bg-[#FEF08A] border border-black/10 animate-in zoom-in-95 duration-150"
            >
              {/* 상단 탭 전환 바 */}
              <div className="flex items-center justify-between border-b border-black/10 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setModalTab("followings");
                    }}
                    className={`text-sm font-black transition pb-0.5 ${
                      modalTab === "followings"
                        ? "text-neutral-900 border-b-2 border-neutral-900"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    구독한 집 ({myFollowings.length})
                  </button>
                  <span className="text-neutral-400 font-bold">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setModalTab("followers");
                    }}
                    className={`text-sm font-black transition pb-0.5 ${
                      modalTab === "followers"
                        ? "text-neutral-900 border-b-2 border-neutral-900"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    손님 ({displayFollowers.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setModalTab(null)}
                  className="text-neutral-500 hover:text-black font-bold text-sm w-6 h-6 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* 검색창 */}
              <input
                type="text"
                placeholder="검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white rounded-xl px-3.5 py-2 text-xs font-bold outline-none shadow-sm placeholder:text-neutral-400 border border-black/5"
              />

              {/* 리스트 */}
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                {filteredList.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between bg-white/70 hover:bg-white p-2.5 rounded-2xl border border-black/5 transition"
                  >
                    <div
                      onClick={() => {
                        setModalTab(null);
                        router.push(`/house/${u.id}/party`);
                      }}
                      className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-sm shrink-0"
                        style={{ backgroundColor: u.avatarBg }}
                      >
                        {u.name[0]}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-neutral-900 truncate">{u.name}</span>
                        <span className="text-[10px] font-bold text-neutral-500 truncate">{u.houseName}</span>
                      </div>
                    </div>

                    {isOwner && modalTab === "followings" && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFromList(u.id)}
                        className="w-6 h-6 bg-blue-400 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center text-xs font-bold transition shrink-0 ml-2 shadow-sm"
                        title="삭제"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {filteredList.length === 0 && (
                  <div className="text-center py-6 text-xs font-bold text-neutral-500">
                    목록이 비어 있습니다.
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}