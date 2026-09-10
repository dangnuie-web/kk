"use client";

import React from "react";
import { NavMode } from "./SideNav";

interface SubPanelProps {
  currentMode: NavMode;
  activeCategory: string;
  onSelectCategory: (catId: string) => void;
  studioSubCategory?: string;
  onSelectStudioSub?: (subId: string) => void;
}

const CATEGORIES: Record<
  Exclude<NavMode, "MAIN">,
  { id: string; label: string }[]
> = {
  VILLAGE: [
    { id: "PARTY", label: "파티" },
    { id: "CONTENTS", label: "콘텐츠" },
    { id: "STUDIO", label: "공방" },
  ],
  HOUSE: [
    { id: "PARTY", label: "파티" },
    { id: "CONTENTS", label: "콘텐츠" },
    { id: "GALLERY", label: "갤러리" },
    { id: "POSTBOX", label: "우체통" },
    { id: "STUDIO", label: "공방" },
  ],
  SETTINGS: [
    { id: "PROFILE", label: "프로필" },
    { id: "THEME", label: "테마" },
    { id: "BOOKMARK", label: "저장" },
    { id: "SECURITY", label: "계정 및 보안" },
  ],
};

const STUDIO_SUBS = [
  { id: "INVITATION", label: "초대장" },
  { id: "SEAL", label: "씰" },
  { id: "FRAME", label: "사진 프레임" },
];

export default function SubPanel({
  currentMode,
  activeCategory,
  onSelectCategory,
  studioSubCategory = "INVITATION",
  onSelectStudioSub,
}: SubPanelProps) {
  if (currentMode === "MAIN") return null;

  const list = CATEGORIES[currentMode] || [];

  return (
    <div className="hidden sm:flex w-36 md:w-44 h-screen shrink-0 border-r border-neutral-300/70 bg-[#E8E6DF] sm:pt-28 pb-8 px-3.5 flex-col gap-1.5 z-30 select-none">
      {list.map((item) => {
        const isSelected = activeCategory === item.id;

        return (
          <div key={item.id} className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => onSelectCategory(item.id)}
              className={`w-full text-left px-3.5 py-2 rounded-[3.5px] text-xs md:text-sm transition cursor-pointer ${
                isSelected
                  ? "bg-white/80 text-neutral-900 font-black"
                  : "text-neutral-600 hover:text-black hover:bg-white/40 font-bold"
              }`}
            >
              <span>{item.label}</span>
            </button>

            {/* 공방 하위 서브 메뉴 (선과 점 없이 깔끔한 들여쓰기) */}
            {item.id === "STUDIO" && isSelected && onSelectStudioSub && (
              <div className="flex flex-col gap-0.5 pl-2 pt-0.5">
                {STUDIO_SUBS.map((sub) => {
                  const isSubSelected = studioSubCategory === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStudioSub(sub.id);
                      }}
                      className={`text-left px-3 py-1.5 rounded-[3.5px] text-xs transition cursor-pointer ${
                        isSubSelected
                          ? "bg-black/10 text-neutral-900 font-bold"
                          : "text-neutral-500 hover:text-black font-medium"
                      }`}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
