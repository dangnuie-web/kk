"use client";

import React from "react";

export interface CustomSection {
  id: number;
  title: string;
  content: string;
}

export interface ScheduleItem {
  id: number;
  startTime: string;
  endTime: string;
  showDuration: boolean;
  bulletType: "dash" | "dot" | "circle";
  content: string;
  linkedContentTitle?: string;
}

export interface SealInfo {
  emoji: string;
  color: string;
  name: string;
}

export interface InvitationCardProps {
  partyTitle?: string;
  eventDate?: string;
  partyStartTime?: string;
  partyEndTime?: string;
  location?: string;
  bgColor?: string;
  seal?: SealInfo;
  customSections?: CustomSection[];
  schedules?: ScheduleItem[];
  scheduleGlobalMode?: "time" | "bullet";
  minHeight?: string;
  onLinkClick?: (title: string) => void;
}

export function calculateDuration(start?: string, end?: string): string {
  if (!start || !end) return "";
  const [h1, m1] = start.split(":").map(Number);
  const [h2, m2] = end.split(":").map(Number);
  const diff = h2 * 60 + m2 - (h1 * 60 + m1);
  if (diff <= 0) return "";
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return hours > 0 ? `${hours}시간 ${mins > 0 ? `${mins}분` : ""}` : `${mins}분`;
}

export default function InvitationCard({
  partyTitle = "파티를 선택해 주세요",
  eventDate = "날짜 미정",
  partyStartTime,
  partyEndTime,
  location = "장소 미정",
  bgColor = "#C8AD8D",
  seal = { emoji: "💌", color: "#DD6B20", name: "기본 씰" },
  customSections = [],
  schedules = [],
  scheduleGlobalMode = "time",
  minHeight = "min-h-[560px]",
  onLinkClick,
}: InvitationCardProps) {
  return (
    <div
      className={`w-full ${minHeight} rounded-3xl p-6 md:p-7 shadow-xl flex flex-col justify-between transition-all duration-300 relative border border-black/10`}
      style={{ backgroundColor: bgColor }}
    >
      {/* 헤더 */}
      <div className="border-b-2 border-black/15 pb-4 flex flex-col gap-1.5">
        <h3 className="text-2xl font-black text-neutral-900 leading-tight">
          {partyTitle || "파티를 선택해 주세요"}
        </h3>
        <div className="flex flex-col gap-0.5 text-xs font-bold text-neutral-700 mt-1">
          <span>📅 {eventDate || "날짜 미정"}</span>
          <span>
            ⏰ {partyStartTime ? (partyEndTime ? `${partyStartTime} ~ ${partyEndTime}` : `${partyStartTime} 시작`) : "시간 미정"}
          </span>
          <span>📍 {location || "장소 미정"}</span>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1 py-4 flex flex-col gap-3.5 overflow-y-auto max-h-[340px] text-xs">
        {customSections.map((sec, idx) => (
          <div key={sec.id} className="bg-white/60 p-3 rounded-xl border border-black/5">
            <span className="font-bold text-neutral-900 block text-sm">{sec.title || `항목 ${idx + 1}`}</span>
            <p className="text-neutral-700 mt-1 whitespace-pre-wrap">{sec.content || "내용"}</p>
          </div>
        ))}

        {schedules.length > 0 && (
          <div className="bg-white/50 p-4 rounded-xl border border-black/5 flex flex-col gap-2">
            <span className="font-black text-neutral-800 text-xs text-center border-b border-black/10 pb-1">식순</span>
            {schedules.map((sch) => {
              const duration = calculateDuration(sch.startTime, sch.endTime);
              const hasLink = Boolean(sch.linkedContentTitle);

              return (
                <div
                  key={sch.id}
                  onClick={() => {
                    if (hasLink && onLinkClick) onLinkClick(sch.linkedContentTitle!);
                  }}
                  className={`grid grid-cols-[110px_1fr_45px] items-center py-1 border-b border-black/5 last:border-0 transition-colors ${
                    hasLink ? "cursor-pointer hover:bg-black/5 rounded px-1" : ""
                  }`}
                >
                  <div className="font-mono text-[11px] font-bold text-neutral-800 truncate">
                    {scheduleGlobalMode === "time" ? (
                      sch.startTime ? `${sch.startTime}${sch.endTime ? ` ~ ${sch.endTime}` : ""}` : "--:--"
                    ) : (
                      <span className="text-sm">
                        {sch.bulletType === "dash" ? "-" : sch.bulletType === "dot" ? "•" : "○"}
                      </span>
                    )}
                  </div>

                  <div className={`text-xs font-bold text-neutral-900 px-1 truncate ${hasLink ? "text-blue-700 underline" : ""}`}>
                    {sch.content || "행사 내용"}
                  </div>

                  <div className="text-right text-[10px] text-neutral-500 font-semibold">
                    {scheduleGlobalMode === "time" && sch.showDuration && duration ? duration : ""}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 씰 */}
      <div className="flex justify-between items-end pt-3 border-t border-black/10">
        <span className="text-[10px] font-mono text-black/40 uppercase">Knock Knock Mail</span>
        <div
          className="w-14 h-14 rounded-full shadow-lg border-2 border-white flex items-center justify-center"
          style={{ backgroundColor: seal.color || "#DD6B20" }}
        >
          <span className="text-2xl">{seal.emoji || "💌"}</span>
        </div>
      </div>
    </div>
  );
}