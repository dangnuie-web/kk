"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import InvitationCard, { CustomSection, ScheduleItem, SealInfo } from "@/app/components/postbox/InvitationCard";
import InvitationModal from "@/app/components/postbox/InvitationModal";

const PAPER_TEMPLATES = [
  { id: "kraft", name: "크라프트", color: "#C8AD8D" },
  { id: "white_clean", name: "화이트", color: "#F7FAFC" },
  { id: "sky_blue", name: "스카이", color: "#EBF8FF" },
  { id: "pink_cute", name: "핑크", color: "#FFF5F5" },
];

const BASIC_SEALS: SealInfo[] = [
  { name: "토스트 씰", emoji: "🍞", color: "#DD6B20" },
  { name: "하트 씰", emoji: "❤️", color: "#E53E3E" },
  { name: "스타 씰", emoji: "⭐", color: "#D69E2E" },
  { name: "클로버 씰", emoji: "🍀", color: "#38A169" },
];

export default function NewInvitationPage() {
  const params = useParams();
  const userId = (params?.userId as string) || "dang";
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [step, setStep] = useState<1 | 2>(1);

  const [selectedPaper, setSelectedPaper] = useState(PAPER_TEMPLATES[0]);
  const [selectedSeal, setSelectedSeal] = useState<SealInfo>(BASIC_SEALS[0]);
  const [partyTitle, setPartyTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [partyStartTime, setPartyStartTime] = useState("");
  const [partyEndTime, setPartyEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [scheduleGlobalMode, setScheduleGlobalMode] = useState<"time" | "bullet">("time");
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    if (!editId) return;
    try {
      const saved = localStorage.getItem(`sent_invitations_${userId}`);
      if (saved) {
        const list = JSON.parse(saved);
        const target = list.find((item: any) => String(item.id) === String(editId));
        if (target) {
          setSelectedPaper(PAPER_TEMPLATES.find((p) => p.color === target.bgColor) || PAPER_TEMPLATES[0]);
          setSelectedSeal(BASIC_SEALS.find((s) => s.emoji === target.seal?.emoji) || BASIC_SEALS[0]);
          setPartyTitle(target.partyTitle || "");
          setEventDate(target.eventDate || "");
          setPartyStartTime(target.partyStartTime || "");
          setPartyEndTime(target.partyEndTime || "");
          setLocation(target.location || "");
          setCustomSections(target.customSections || []);
          setScheduleGlobalMode(target.scheduleGlobalMode || "time");
          setSchedules(target.schedules || []);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [editId, userId]);

  const [userContents] = useState<Array<{ id: number; title: string }>>(() => {
    if (typeof window === "undefined") return [{ id: 1, title: "홈파티 요리 레시피" }];
    try {
      const saved = localStorage.getItem(`contents_${userId}`);
      return saved ? JSON.parse(saved) : [{ id: 1, title: "홈파티 요리 레시피" }];
    } catch {
      return [{ id: 1, title: "홈파티 요리 레시피" }];
    }
  });

  const [userParties] = useState<Array<{ id: number; title: string }>>(() => {
    if (typeof window === "undefined") return [{ id: 1, title: "랜덤 비빔밥의 날" }];
    try {
      const saved = localStorage.getItem(`party_posts_${userId}`);
      return saved ? JSON.parse(saved) : [{ id: 1, title: "랜덤 비빔밥의 날" }];
    } catch {
      return [{ id: 1, title: "랜덤 비빔밥의 날" }];
    }
  });

  const handleAddSection = () => {
    if (customSections.length >= 5) return alert("소개 항목은 최대 5개까지만 가능합니다.");
    setCustomSections((prev) => [...prev, { id: Date.now(), title: "", content: "" }]);
  };

  const handleAddSchedule = () => {
    if (schedules.length >= 10) return alert("식순은 최대 10개까지만 가능합니다.");
    setSchedules((prev) => [
      ...prev,
      { id: Date.now(), startTime: "", endTime: "", showDuration: true, bulletType: "dash", content: "" },
    ]);
  };

  const handleScheduleEndTimeChange = (id: number, val: string) => {
    const target = schedules.find((s) => s.id === id);
    if (val && (!target?.startTime || !target.startTime.trim())) {
      alert("시작 시간을 먼저 입력해 주세요.");
      return;
    }
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, endTime: val } : s)));
  };

  const handleSaveAndOpenPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyTitle.trim()) return alert("연동할 파티를 선택해 주세요.");
    if (!eventDate.trim()) return alert("날짜를 입력해 주세요.");
    if (!partyStartTime.trim()) return alert("시작 시간을 입력해 주세요.");
    if (!location.trim()) return alert("장소를 입력해 주세요.");

    for (let i = 0; i < schedules.length; i++) {
      if (!schedules[i].content.trim()) return alert(`식순 ${i + 1}번째 항목의 행사 내용을 입력해 주세요.`);
      if (scheduleGlobalMode === "time" && !schedules[i].startTime.trim()) {
        return alert(`식순 ${i + 1}번째 항목의 시작 시간을 입력해 주세요.`);
      }
    }

    try {
      const storageKey = `sent_invitations_${userId}`;
      const prev = localStorage.getItem(storageKey);
      let parsed = prev ? JSON.parse(prev) : [];
      const currentId = editId ? Number(editId) : Date.now();
      const payload = {
        id: currentId,
        partyTitle,
        eventDate,
        partyStartTime,
        partyEndTime,
        location,
        bgColor: selectedPaper.color,
        seal: selectedSeal,
        customSections,
        scheduleGlobalMode,
        schedules,
      };

      if (editId) {
        parsed = parsed.map((item: any) => (item.id === currentId ? payload : item));
      } else {
        parsed = [payload, ...parsed];
      }

      localStorage.setItem(storageKey, JSON.stringify(parsed));
      setShowPreviewModal(true);
    } catch {
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/house/${userId}/postbox` : "";

  return (
    <div className="bg-white/95 rounded-3xl p-6 md:p-10 shadow-sm border border-neutral-200/60 max-w-6xl mx-auto w-full min-h-[680px] flex flex-col justify-between overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-8 items-start flex-1 w-full">
        <div className="w-full lg:w-[420px] flex justify-center shrink-0">
          <InvitationCard
            partyTitle={partyTitle}
            eventDate={eventDate}
            partyStartTime={partyStartTime}
            partyEndTime={partyEndTime}
            location={location}
            bgColor={selectedPaper.color}
            seal={selectedSeal}
            customSections={customSections}
            schedules={schedules}
            scheduleGlobalMode={scheduleGlobalMode}
            minHeight="min-h-[560px]"
            onLinkClick={(title) => alert(`🔗 '${title}' 콘텐츠로 이동합니다!`)}
          />
        </div>

        <div className="flex-1 w-full min-w-0 flex flex-col justify-between gap-6">
          {step === 1 && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-2xl font-black text-neutral-900">디자인 선택</h2>
                <p className="text-xs text-neutral-500 mt-1">편지지 템플릿과 씰을 선택하세요.</p>
              </div>

              {/* ⭐️ 프레임 템플릿 + 저장한 템플릿 가져오기 버튼 ⭐️ */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-black text-neutral-700">프레임 템플릿</span>
                <div className="flex items-center gap-3">
                  {PAPER_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setSelectedPaper(tmpl)}
                      className={`w-14 h-14 rounded-xl border-2 transition-all flex items-center justify-center ${
                        selectedPaper.id === tmpl.id ? "border-blue-600 shadow-md scale-105" : "border-neutral-200"
                      }`}
                      style={{ backgroundColor: tmpl.color }}
                    >
                      <span className="text-[10px] font-bold text-black/60 truncate px-1">{tmpl.name}</span>
                    </button>
                  ))}
                  
                  {/* 저장한 템플릿 가져오기 (+) 버튼 */}
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => alert("저장한 템플릿 목록을 불러옵니다. (준비 중)")}
                      className="w-14 h-14 bg-neutral-200/80 hover:bg-neutral-300 rounded-xl flex items-center justify-center text-neutral-600 font-bold text-xl transition"
                    >
                      +
                    </button>
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-md z-10">
                      저장한 템플릿 가져오기
                    </span>
                  </div>
                </div>
              </div>

              {/* ⭐️ Basic 씰 + 저장한 씰 가져오기 버튼 ⭐️ */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-black text-neutral-700">Basic 씰</span>
                <div className="flex items-center gap-3">
                  {BASIC_SEALS.map((seal) => (
                    <button
                      key={seal.name}
                      type="button"
                      onClick={() => setSelectedSeal(seal)}
                      className={`w-14 h-14 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${
                        selectedSeal.name === seal.name ? "border-blue-600 shadow-md scale-105" : "border-neutral-200"
                      }`}
                      style={{ backgroundColor: seal.color }}
                    >
                      <span className="text-base">{seal.emoji}</span>
                      <span className="text-[8px] font-bold text-white truncate px-1">{seal.name}</span>
                    </button>
                  ))}

                  {/* 저장한 씰 가져오기 (+) 버튼 */}
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => alert("저장한 씰 목록을 불러옵니다. (준비 중)")}
                      className="w-14 h-14 bg-neutral-200/80 hover:bg-neutral-300 rounded-xl flex items-center justify-center text-neutral-600 font-bold text-xl transition"
                    >
                      +
                    </button>
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-md z-10">
                      저장한 씰 가져오기
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-neutral-100">
                <button type="button" onClick={() => setStep(2)} className="bg-black text-white text-xs md:text-sm font-bold px-8 py-3 rounded-xl transition shadow-md">
                  다음 ➔
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSaveAndOpenPreview} className="flex flex-col gap-5 overflow-y-auto max-h-[580px] pr-1">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <h2 className="text-2xl font-black text-neutral-900">내용 입력</h2>
                <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-blue-600 hover:underline">
                  ← 디자인 다시 선택
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-neutral-800">연동할 파티 *</label>
                <select
                  value={partyTitle}
                  onChange={(e) => setPartyTitle(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  required
                >
                  <option value="">파티를 선택하세요</option>
                  {userParties.map((p) => (
                    <option key={p.id} value={p.title}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-neutral-600">날짜 *</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-neutral-600">시간 (시작* ~ 종료 선택)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="time"
                      value={partyStartTime}
                      onChange={(e) => setPartyStartTime(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-2 py-1.5 text-xs outline-none font-bold"
                      required
                    />
                    <span className="text-neutral-400 font-bold">~</span>
                    <input
                      type="time"
                      value={partyEndTime}
                      onChange={(e) => setPartyEndTime(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-2 py-1.5 text-xs outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-neutral-600">장소 *</label>
                <input
                  type="text"
                  placeholder="예: 서울시 동작구 상도로 우리집 거실"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-neutral-800">초대장 소개 항목 ({customSections.length}/5)</span>
                  <button type="button" onClick={handleAddSection} className="text-xs font-bold text-blue-600 hover:underline">
                    + 항목 추가
                  </button>
                </div>
                {customSections.map((sec, idx) => (
                  <div key={sec.id} className="bg-neutral-100/70 p-3 rounded-2xl flex flex-col gap-2 relative">
                    <button
                      type="button"
                      onClick={() => setCustomSections((prev) => prev.filter((s) => s.id !== sec.id))}
                      className="absolute top-2.5 right-2.5 text-xs text-neutral-400 hover:text-black"
                    >
                      ✕
                    </button>
                    <input
                      type="text"
                      placeholder={`항목 제목 ${idx + 1}`}
                      value={sec.title}
                      onChange={(e) => setCustomSections((prev) => prev.map((s) => s.id === sec.id ? { ...s, title: e.target.value } : s))}
                      className="bg-white rounded-lg px-3 py-1.5 text-xs font-bold outline-none"
                    />
                    <textarea
                      placeholder="상세 내용을 적어보세요"
                      value={sec.content}
                      onChange={(e) => setCustomSections((prev) => prev.map((s) => s.id === sec.id ? { ...s, content: e.target.value } : s))}
                      rows={2}
                      className="bg-white rounded-lg p-2 text-xs outline-none resize-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2.5 pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-neutral-800">식순 설정 ({schedules.length}/10)</span>
                    <div className="flex items-center gap-3 bg-neutral-100 px-2.5 py-1 rounded-lg text-xs font-bold text-neutral-700">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="global_schedule_mode"
                          checked={scheduleGlobalMode === "time"}
                          onChange={() => setScheduleGlobalMode("time")}
                        />
                        시간 표시
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="global_schedule_mode"
                          checked={scheduleGlobalMode === "bullet"}
                          onChange={() => setScheduleGlobalMode("bullet")}
                        />
                        볼릿 표시
                      </label>
                    </div>
                  </div>
                  <button type="button" onClick={handleAddSchedule} className="text-xs font-bold text-blue-600 hover:underline">
                    + 일정 추가
                  </button>
                </div>

                {schedules.map((sch) => (
                  <div key={sch.id} className="bg-neutral-200/80 rounded-2xl p-3 flex flex-col gap-2 relative">
                    <button
                      type="button"
                      onClick={() => setSchedules((prev) => prev.filter((s) => s.id !== sch.id))}
                      className="absolute top-2 right-2 text-xs text-neutral-400 hover:text-black font-bold"
                    >
                      ✕
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center pr-6">
                      {scheduleGlobalMode === "time" ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <input
                            type="time"
                            value={sch.startTime}
                            onChange={(e) => setSchedules((prev) => prev.map((s) => s.id === sch.id ? { ...s, startTime: e.target.value } : s))}
                            className="bg-white rounded-lg px-2 py-1 font-bold outline-none"
                            required
                          />
                          <input
                            type="time"
                            value={sch.endTime}
                            onChange={(e) => handleScheduleEndTimeChange(sch.id, e.target.value)}
                            className="bg-white rounded-lg px-2 py-1 font-bold outline-none"
                          />
                          <label className="flex items-center gap-1 text-[11px] font-bold text-neutral-700 cursor-pointer whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={sch.showDuration}
                              onChange={(e) => setSchedules((prev) => prev.map((s) => s.id === sch.id ? { ...s, showDuration: e.target.checked } : s))}
                            />
                            소요시간
                          </label>
                        </div>
                      ) : (
                        <select
                          value={sch.bulletType}
                          onChange={(e) => setSchedules((prev) => prev.map((s) => s.id === sch.id ? { ...s, bulletType: e.target.value as any } : s))}
                          className="bg-white rounded-lg px-2 py-1.5 text-xs font-bold outline-none"
                        >
                          <option value="dash">대시 (-)</option>
                          <option value="dot">점 (•)</option>
                          <option value="circle">원형 (○)</option>
                        </select>
                      )}

                      <input
                        type="text"
                        placeholder="행사 내용 *"
                        value={sch.content}
                        onChange={(e) => setSchedules((prev) => prev.map((s) => s.id === sch.id ? { ...s, content: e.target.value } : s))}
                        className="w-full bg-white rounded-lg px-3 py-1.5 text-xs font-bold outline-none"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <select
                        value={sch.linkedContentTitle || ""}
                        onChange={(e) => setSchedules((prev) => prev.map((s) => s.id === sch.id ? { ...s, linkedContentTitle: e.target.value } : s))}
                        className="w-full sm:w-1/2 bg-white rounded-lg px-3 py-1.5 text-[11px] font-bold text-blue-600 outline-none"
                      >
                        <option value="">🔗 콘텐츠 연결 (선택)</option>
                        {userContents.map((c) => (
                          <option key={c.id} value={c.title}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-100 mt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert("초대장 임시저장 완료 (0/3)")}
                    className="border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-bold px-4 py-2.5 rounded-xl transition"
                  >
                    저장 (0/3)
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("불러올 저장 내역이 없습니다.")}
                    className="text-blue-600 hover:underline text-xs font-bold px-1"
                  >
                    불러오기
                  </button>
                </div>

                <button
                  type="submit"
                  className="bg-black hover:bg-neutral-800 text-white text-xs font-bold px-8 py-2.5 rounded-xl transition shadow-md"
                >
                  완료
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <InvitationModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="💌 초대장이 완성되었습니다!"
        description="만든 초대장에 자동 저장되었으며, 바로 링크/QR을 공유할 수 있습니다."
      >
        <InvitationCard
          partyTitle={partyTitle}
          eventDate={eventDate}
          partyStartTime={partyStartTime}
          partyEndTime={partyEndTime}
          location={location}
          bgColor={selectedPaper.color}
          seal={selectedSeal}
          customSections={customSections}
          schedules={schedules}
          scheduleGlobalMode={scheduleGlobalMode}
          minHeight="min-h-[400px]"
        />

        <div className="flex items-center gap-4 bg-neutral-100/80 p-3 rounded-2xl border border-neutral-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(shareUrl)}`}
            alt="QR Code"
            className="w-16 h-16 rounded-xl bg-white p-1 shrink-0"
          />
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <span className="text-xs font-bold text-neutral-700">모바일 초대장 링크</span>
            <span className="text-[11px] font-mono text-neutral-500 truncate">{shareUrl}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                alert("초대장 링크가 클립보드에 복사되었습니다! 📋");
              }}
              className="self-start text-xs font-bold text-blue-600 hover:underline"
            >
              📋 링크 복사하기
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreviewModal(false)}
            className="w-1/3 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-bold py-3 rounded-xl transition text-xs"
          >
            ✏️ 계속 수정
          </button>
          <button
            type="button"
            onClick={() => router.push(`/house/${userId}/postbox`)}
            className="flex-1 bg-black hover:bg-neutral-800 text-white font-bold py-3 rounded-xl transition shadow-lg text-xs md:text-sm"
          >
            만든 초대장으로 이동 📬
          </button>
        </div>
      </InvitationModal>
    </div>
  );
}