"use client";

import React from "react";
import { CraftInvitationTemplate, CategorySeal } from "@/types/craft";
import { CustomSection, ScheduleItem, calculateDuration } from "@/app/components/postbox/InvitationCard";

interface Props {
  template: Partial<CraftInvitationTemplate>;
  customSections?: CustomSection[];
  schedules?: ScheduleItem[];
  scheduleGlobalMode?: "time" | "bullet";
  selectedSeal?: CategorySeal | null;
  className?: string;
  isEditorSample?: boolean;
}

export default function InvitationBodyPreview({
  template,
  customSections = [],
  schedules = [],
  scheduleGlobalMode = "bullet",
  selectedSeal,
  className = "",
  isEditorSample = false,
}: Props) {
  const paperBg = template.paperBgColor || "#f3e9e0";
  const fontColor = template.fontColor || "#87451E";
  const fontFamily = template.fontFamily || "Paperlogy";

  // 기본 샘플 섹션 (에디터 전용 미리보기 또는 데이터가 비어있을 때)
  const displaySections =
    customSections.length > 0
      ? customSections
      : isEditorSample
      ? [{ id: 1, title: "항목제목", content: "상세 내용을 적어보세요." }]
      : [];

  const displaySchedules =
    schedules.length > 0
      ? schedules
      : isEditorSample
      ? [
          {
            id: 1,
            startTime: "10:40",
            endTime: "12:40",
            showDuration: true,
            bulletType: "dash" as const,
            content: "상세 내용을 적어보세요.",
          },
          {
            id: 2,
            startTime: "12:40",
            endTime: "16:40",
            showDuration: true,
            bulletType: "dash" as const,
            content: "상세 내용을 적어보세요.",
          },
        ]
      : [];

  // 시간 포맷팅 헬퍼
  const formatTime = (t?: string) => {
    if (!t) return "";
    const [hStr, mStr] = t.split(":");
    const h = parseInt(hStr, 10);
    const period = h < 12 ? "오전" : "오후";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${period} ${String(hour).padStart(2, "0")} : ${mStr || "00"}`;
  };

  return (
    <div
      className={`w-full rounded-2xl overflow-hidden flex flex-col justify-between shadow-md border border-black/5 relative select-none ${className}`}
      style={{
        backgroundColor: paperBg,
        backgroundImage: template.paperBgImage ? `url(${template.paperBgImage})` : undefined,
        backgroundRepeat: template.paperBgImage ? "repeat-y" : undefined,
        backgroundSize: template.paperBgImage ? "100% auto" : undefined,
        fontFamily,
      }}
    >
      {/* 본문 카드 콘텐츠 영역 */}
      <div className="p-6 md:p-8 flex flex-col gap-5 flex-1 min-h-[380px]">
        {/* 1. 소개 항목 카드들 */}
        {displaySections.map((sec, idx) => (
          <div
            key={sec.id || idx}
            className="rounded-2xl p-4 transition shadow-2xs border border-black/5"
            style={{
              backgroundColor: template.cardFrameColor || "rgba(255, 255, 255, 0.75)",
            }}
          >
            <h4 className="text-xs font-black mb-1.5" style={{ color: fontColor }}>
              {sec.title || "항목제목"}
            </h4>
            <p className="text-[11px] whitespace-pre-wrap leading-relaxed opacity-90" style={{ color: fontColor }}>
              {sec.content || "상세 내용을 적어보세요."}
            </p>
          </div>
        ))}

        {/* 2. 식순 카드 */}
        {(displaySchedules.length > 0 || isEditorSample) && (
          <div
            className="rounded-2xl p-4 flex flex-col gap-3 transition shadow-2xs border border-black/5"
            style={{
              backgroundColor: template.cardFrameColor || "rgba(255, 255, 255, 0.75)",
            }}
          >
            <h4
              className="text-xs font-black text-center border-b pb-1.5"
              style={{ color: fontColor, borderColor: `${fontColor}30` }}
            >
              식순
            </h4>

            <div className="flex flex-col gap-2.5">
              {displaySchedules.map((sch, idx) => {
                const dur = calculateDuration(sch.startTime, sch.endTime);

                if (scheduleGlobalMode === "time") {
                  /* 시간설정 모드 (오전 10:40 ~ 오후 12:40 | 행사내용 | 2시간) */
                  return (
                    <div
                      key={sch.id || idx}
                      className="grid grid-cols-[120px_1fr_auto] items-center gap-2 text-[10px]"
                      style={{ color: fontColor }}
                    >
                      <span className="font-semibold opacity-80 whitespace-nowrap">
                        {sch.startTime && sch.endTime
                          ? `${formatTime(sch.startTime)} ~ ${formatTime(sch.endTime)}`
                          : "시간 미정"}
                      </span>
                      <span className="font-bold truncate">{sch.content || "상세 내용을 적어보세요."}</span>
                      <span className="text-[9px] font-black opacity-70 whitespace-nowrap">{dur}</span>
                    </div>
                  );
                }

                /* 불릿 사용 모드 (커스텀 불릿 아이콘 + 내용) */
                return (
                  <div key={sch.id || idx} className="flex items-center gap-2.5 text-[11px]" style={{ color: fontColor }}>
                    {template.customBullet ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={template.customBullet}
                        alt="bullet"
                        className="w-4 h-4 object-contain shrink-0"
                      />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: fontColor }} />
                    )}
                    <span className="font-bold truncate">{sch.content || "상세 내용을 적어보세요."}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {displaySections.length === 0 && displaySchedules.length === 0 && !isEditorSample && (
          <div className="flex-1 flex items-center justify-center text-xs opacity-50 py-12" style={{ color: fontColor }}>
            상세 내용을 입력하면 이곳에 실시간으로 표시됩니다.
          </div>
        )}
      </div>

      {/* 3. 하단 148*50 배너 영역 */}
      <div className="w-full aspect-[148/50] relative overflow-hidden bg-[#E87528] flex items-center justify-between px-6 shrink-0 select-none">
        {template.footerImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={template.footerImage} alt="하단 배너" className="w-full h-full object-fill pointer-events-none" />
        ) : (
          /* 기본 Knock Knock 오렌지 커피 배너 */
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100/30 flex items-center justify-center text-base">
              ☕
            </div>
            <span className="text-white font-black tracking-wider text-xs font-serif italic">
              Knock Knock
            </span>
          </div>
        )}

        {/* 4. 카테고리 씰(우표) 오버레이 (하단 우측 배치) */}
        {selectedSeal && (
          <div className="absolute right-4 bottom-2 z-10 animate-in zoom-in-90 duration-200">
            <div
              className="w-14 h-14 rounded-lg shadow-md border-2 border-white/80 p-1 flex flex-col items-center justify-center text-xl hover:scale-105 transition"
              style={{
                backgroundColor: selectedSeal.color || "#2ea043",
                backgroundImage: selectedSeal.image ? `url(${selectedSeal.image})` : undefined,
                backgroundSize: "cover",
              }}
            >
              <span>{selectedSeal.emoji || "💌"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

