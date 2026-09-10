"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

export interface UserItem {
  id: string;
  name: string;
  houseName: string;
  avatarBg?: string;
}

const DEFAULT_FOLLOWINGS: UserItem[] = [
  { id: "dang", name: "당당이", houseName: "Dang’s house", avatarBg: "#D1D5DB" },
  { id: "kongkong", name: "콩콩이", houseName: "Kong Kong Zip", avatarBg: "#D1D5DB" },
  { id: "green", name: "초록이", houseName: "Green Forest", avatarBg: "#D1D5DB" },
  { id: "mint", name: "민트", houseName: "Mint Paradise", avatarBg: "#D1D5DB" },
];

const DEFAULT_FOLLOWERS: UserItem[] = [
  { id: "orange", name: "오렌지", houseName: "Orange House", avatarBg: "#D1D5DB" },
  { id: "berry", name: "베리", houseName: "Berry Sweet", avatarBg: "#D1D5DB" },
  { id: "kongkong", name: "콩콩이", houseName: "Kong Kong Zip", avatarBg: "#D1D5DB" },
];

interface NeighborModalProps {
  isOpen: boolean;
  initialTab?: "followings" | "followers";
  onClose: () => void;
  myUserId?: string;
}

export default function NeighborModal({
  isOpen,
  initialTab = "followings",
  onClose,
  myUserId = "dang",
}: NeighborModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"followings" | "followers">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [followings, setFollowings] = useState<UserItem[]>([]);
  const [followers] = useState<UserItem[]>(DEFAULT_FOLLOWERS);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(`following_users_${myUserId}`);
      if (saved) {
        setFollowings(JSON.parse(saved));
      } else {
        setFollowings(DEFAULT_FOLLOWINGS);
        localStorage.setItem(`following_users_${myUserId}`, JSON.stringify(DEFAULT_FOLLOWINGS));
      }
    } catch {
      setFollowings(DEFAULT_FOLLOWINGS);
    }
  }, [myUserId]);

  useEffect(() => {
    setActiveTab(initialTab);
    setSearchQuery("");
  }, [initialTab, isOpen]);

  if (!mounted || !isOpen) return null;

  const currentList = activeTab === "followings" ? followings : followers;
  const filteredList = currentList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.houseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemove = (id: string) => {
    if (activeTab === "followings") {
      const next = followings.filter((u) => u.id !== id);
      setFollowings(next);
      localStorage.setItem(`following_users_${myUserId}`, JSON.stringify(next));
    }
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[340px] h-[520px] rounded-[32px] p-6 shadow-2xl flex flex-col gap-4 relative bg-[#F4EFE6] border border-black/5 animate-in zoom-in-95 duration-150"
      >
        {/* 상단 헤더: 탭 & 닫기 버튼 */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setActiveTab("followings")}
              className={`text-sm font-black transition ${
                activeTab === "followings"
                  ? "text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              구독한 집
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("followers")}
              className={`text-sm font-black transition ${
                activeTab === "followers"
                  ? "text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              손님
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-neutral-800 hover:text-black font-black text-lg transition"
            title="닫기"
          >
            ✕
          </button>
        </div>

        {/* 검색창 (둥근 흰색 pill) */}
        <div className="w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-xl px-4 py-2.5 text-xs font-bold text-neutral-800 outline-none shadow-sm placeholder:text-neutral-400"
          />
        </div>

        {/* 리스트 영역 */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 mt-1">
          {filteredList.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between py-1 transition"
            >
              {/* 프로필 정보 */}
              <div
                onClick={() => {
                  onClose();
                  router.push(`/house/${u.id}/party`);
                }}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              >
                <div className="w-11 h-11 rounded-full bg-[#D1D5DB] shrink-0 flex items-center justify-center text-xs font-bold text-neutral-600 shadow-inner" />
                <span className="text-sm font-black text-neutral-900 truncate">
                  {u.houseName || u.name}
                </span>
              </div>

              {/* 우측 연파란색 X 버튼 (구독 취소/삭제) */}
              {activeTab === "followings" && (
                <button
                  type="button"
                  onClick={() => handleRemove(u.id)}
                  className="w-8 h-8 rounded-xl bg-[#98B8FF] hover:bg-[#82A6FA] flex items-center justify-center text-white transition shadow-sm shrink-0 ml-2"
                  title="구독 취소"
                >
                  <svg
                    className="w-4 h-4 stroke-white stroke-[2.5]"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {filteredList.length === 0 && (
            <div className="h-full flex items-center justify-center text-xs font-bold text-neutral-400">
              목록이 비어 있습니다.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

