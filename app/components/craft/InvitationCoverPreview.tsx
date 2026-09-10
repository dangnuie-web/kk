"use client";

import React from "react";
import { CraftInvitationTemplate } from "@/types/craft";

interface Props {
  template: Partial<CraftInvitationTemplate>;
  title?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  scale?: number;
  className?: string;
  showGuides?: boolean;
}

export default function InvitationCoverPreview({
  template,
  title,
  date,
  startTime,
  endTime,
  location,
  className = "",
  showGuides = true,
}: Props) {
  const fontColor = template.fontColor || "#87451E";
  const fontFamily = template.fontFamily || "Paperlogy";

  const displayTitle = title || "타이틀을 입력하세요.";
  const displayDate = date || "2026.09.06. 일요일";
  const displayTime =
    startTime && endTime
      ? `${startTime} ~ ${endTime}`
      : startTime
      ? `${startTime} 시작`
      : "오전 10 : 40 ~ 오후 16 : 40";
  const displayLocation = location || "장소를 입력해 주세요.";

  // 시간 포맷 (오전/오후 변환 헬퍼)
  const formatTimeDisplay = (t: string) => {
    if (!t) return "";
    const [hStr, mStr] = t.split(":");
    const h = parseInt(hStr, 10);
    const period = h < 12 ? "오전" : "오후";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${period} ${String(hour).padStart(2, "0")} : ${mStr || "00"}`;
  };

  const formattedTimeStr =
    startTime && endTime
      ? `${formatTimeDisplay(startTime)} ~ ${formatTimeDisplay(endTime)}`
      : displayTime;

  return (
    <div
      className={`w-full aspect-[148/100] relative flex items-center justify-center select-none overflow-hidden ${className}`}
      style={{ fontFamily }}
    >
      {/* 1. 주전자 템플릿 커버 (/icons/pot.png) 또는 기본 이미지 */}
      {template.coverImage ? (
        <div className="w-full h-full relative flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={template.coverImage}
            alt="초대장 커버"
            className="w-full h-full object-contain pointer-events-none drop-shadow-xs"
          />

          {/* 주전자 내부 가이드 텍스트 및 라인 (실시간 바인딩) */}
          {showGuides && (
            <div className="absolute inset-0 flex flex-col justify-center items-center px-12 pb-3 pointer-events-none">
              <div className="w-[62%] flex flex-col gap-2 pt-8 text-[11px] font-bold" style={{ color: fontColor }}>
                {/* Title 필드 */}
                <div className="flex items-center gap-2 border-b border-current pb-0.5">
                  <span className="text-[9px] font-extrabold opacity-70 w-8 shrink-0">Title</span>
                  <span className="truncate text-[11px] font-black">{displayTitle}</span>
                </div>

                {/* Date 필드 */}
                <div className="flex items-center gap-2 border-b border-current pb-0.5">
                  <span className="text-[9px] font-extrabold opacity-70 w-8 shrink-0">Date</span>
                  <span className="truncate text-[10px]">{displayDate}</span>
                </div>

                {/* Time 필드 */}
                <div className="flex items-center gap-2 border-b border-current pb-0.5">
                  <span className="text-[9px] font-extrabold opacity-70 w-8 shrink-0">Time</span>
                  <span className="truncate text-[10px]">{formattedTimeStr}</span>
                </div>

                {/* Location 필드 */}
                <div className="flex items-center gap-2 border-b border-current pb-0.5">
                  <span className="text-[9px] font-extrabold opacity-70 w-8 shrink-0">Location</span>
                  <span className="truncate text-[10px]">{displayLocation}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : template.coverType === "heart" ? (
        /* 2. 큐피드 하트 템플릿 커버 */
        <div className="w-full h-full relative flex items-center justify-center">
          <svg viewBox="0 0 300 200" className="w-full h-full drop-shadow-xs" fill="#fcefed">
            <path d="M150,185 C20,130 10,60 70,30 C120,5 150,55 150,55 C150,55 180,5 230,30 C290,60 280,130 150,185 Z" fill="#FCE5E8" stroke="#F6ADB8" strokeWidth="2" />
          </svg>
          {showGuides && (
            <div className="absolute inset-0 flex flex-col justify-center items-center px-12 pt-4 pointer-events-none">
              <div className="text-xl mb-1">🧸</div>
              <div className="w-[55%] flex flex-col gap-1.5 text-[10px] font-bold" style={{ color: fontColor }}>
                <div className="flex items-center justify-between border-b border-current pb-0.5">
                  <span className="text-[8px] opacity-70">Title</span>
                  <span className="truncate font-black">{displayTitle}</span>
                </div>
                <div className="flex items-center justify-between border-b border-current pb-0.5">
                  <span className="text-[8px] opacity-70">Date</span>
                  <span className="truncate">{displayDate}</span>
                </div>
                <div className="flex items-center justify-between border-b border-current pb-0.5">
                  <span className="text-[8px] opacity-70">Time</span>
                  <span className="truncate">{formattedTimeStr}</span>
                </div>
                <div className="flex items-center justify-between border-b border-current pb-0.5">
                  <span className="text-[8px] opacity-70">Location</span>
                  <span className="truncate">{displayLocation}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : template.coverType === "book" ? (
        /* 3. 독서 책 템플릿 커버 */
        <div className="w-full h-full relative flex items-center justify-center">
          <div className="w-[88%] h-[80%] bg-[#486b51] rounded-lg p-2.5 shadow-md flex items-center justify-center relative">
            <div className="w-full h-full bg-[#FAF7EE] rounded-sm p-3 flex flex-col justify-between border border-[#37523e]">
              <div className="absolute top-0 right-1/2 w-3 h-10 bg-teal-600 rounded-b shadow-xs -translate-y-1" />
              {showGuides && (
                <div className="flex flex-col gap-1 text-[10px] font-bold mt-2" style={{ color: fontColor }}>
                  <div className="border-b border-current/40 pb-0.5 flex justify-between">
                    <span className="opacity-70 text-[8px]">Title</span>
                    <span className="font-black truncate">{displayTitle}</span>
                  </div>
                  <div className="border-b border-current/40 pb-0.5 flex justify-between">
                    <span className="opacity-70 text-[8px]">Date</span>
                    <span className="truncate">{displayDate}</span>
                  </div>
                  <div className="border-b border-current/40 pb-0.5 flex justify-between">
                    <span className="opacity-70 text-[8px]">Time</span>
                    <span className="truncate">{formattedTimeStr}</span>
                  </div>
                  <div className="border-b border-current/40 pb-0.5 flex justify-between">
                    <span className="opacity-70 text-[8px]">Location</span>
                    <span className="truncate">{displayLocation}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : template.coverType === "house" ? (
        /* 4. 우리집 템플릿 커버 */
        <div className="w-full h-full relative flex items-center justify-center">
          <div className="w-[85%] h-[82%] bg-[#faebd7] rounded-xl border-2 border-[#D97D54] relative shadow-md p-4 flex flex-col justify-end">
            <div className="absolute -top-3 left-6 w-5 h-7 bg-[#B24C3B] rounded-t-sm" />
            <div className="absolute -top-4 inset-x-0 h-4 bg-[#E0634E] rounded-t-xl" />
            <div className="absolute top-3 right-4 w-6 h-6 rounded-full bg-cyan-200 border-2 border-white flex items-center justify-center text-[10px]">🪟</div>
            {showGuides && (
              <div className="flex flex-col gap-1 text-[10px] font-bold" style={{ color: fontColor }}>
                <div className="border-b border-current/30 pb-0.5 flex justify-between">
                  <span className="opacity-70 text-[8px]">Title</span>
                  <span className="font-black truncate">{displayTitle}</span>
                </div>
                <div className="border-b border-current/30 pb-0.5 flex justify-between">
                  <span className="opacity-70 text-[8px]">Date</span>
                  <span className="truncate">{displayDate}</span>
                </div>
                <div className="border-b border-current/30 pb-0.5 flex justify-between">
                  <span className="opacity-70 text-[8px]">Time</span>
                  <span className="truncate">{formattedTimeStr}</span>
                </div>
                <div className="border-b border-current/30 pb-0.5 flex justify-between">
                  <span className="opacity-70 text-[8px]">Location</span>
                  <span className="truncate">{displayLocation}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 5. 기본 커스텀/단색 커버 */
        <div className="w-full h-full bg-[#E8E2D5] rounded-2xl flex flex-col items-center justify-center p-6 border border-black/10">
          <div className="w-12 h-12 rounded-full bg-white/70 flex items-center justify-center text-xl shadow-xs mb-2">
            ✉️
          </div>
          {showGuides && (
            <div className="w-full flex flex-col gap-1 text-[10px] font-bold text-center" style={{ color: fontColor }}>
              <span className="text-sm font-black truncate">{displayTitle}</span>
              <span className="text-[10px] opacity-80">{displayDate}</span>
              <span className="text-[9px] opacity-80">{formattedTimeStr}</span>
              <span className="text-[9px] opacity-80 truncate">{displayLocation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

