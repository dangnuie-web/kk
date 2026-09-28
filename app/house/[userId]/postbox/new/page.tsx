"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import InvitationCoverPreview from "@/app/components/craft/InvitationCoverPreview";
import InvitationBodyPreview from "@/app/components/craft/InvitationBodyPreview";
import { CustomSection, ScheduleItem, calculateDuration } from "@/app/components/postbox/InvitationCard";
import {
  CraftInvitationTemplate,
  DEFAULT_CRAFT_TEMPLATES,
  CategorySeal,
  PRESET_SEALS,
} from "@/types/craft";

function NewInvitationContent() {
  const params = useParams();
  const userId = (params?.userId as string) || "dang";
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateIdParam = searchParams.get("templateId");

  // 1. 상단 탭 (Step 1: 기본 정보 / Step 2: 상세 내용)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // 2. 템플릿 목록 및 선택 상태
  const [allTemplates, setAllTemplates] = useState<CraftInvitationTemplate[]>(DEFAULT_CRAFT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<CraftInvitationTemplate>(DEFAULT_CRAFT_TEMPLATES[0]);

  // Step 1 폼 상태
  const [partyTitle, setPartyTitle] = useState("");
  const [linkedPartyTitle, setLinkedPartyTitle] = useState("");
  const [eventDate, setEventDate] = useState("2026-09-06");
  const [partyStartTime, setPartyStartTime] = useState("10:40");
  const [partyEndTime, setPartyEndTime] = useState("16:40");
  const [location, setLocation] = useState("");

  // Step 2 폼 상태
  const [customSections, setCustomSections] = useState<CustomSection[]>([
    { id: 1, title: "항목제목", content: "상세 내용을 적어보세요." },
  ]);
  const [scheduleGlobalMode, setScheduleGlobalMode] = useState<"time" | "bullet">("bullet");
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    {
      id: 1,
      startTime: "10:40",
      endTime: "12:40",
      showDuration: true,
      bulletType: "dash",
      content: "상세 내용을 적어보세요.",
      linkedContentTitle: "",
    },
    {
      id: 2,
      startTime: "12:40",
      endTime: "16:40",
      showDuration: true,
      bulletType: "dash",
      content: "상세 내용을 적어보세요.",
      linkedContentTitle: "",
    },
  ]);
  const [selectedSeal, setSelectedSeal] = useState<CategorySeal>(PRESET_SEALS[0]);

  // 연동 가능한 파티/콘텐츠 목록
  const [userParties, setUserParties] = useState<Array<{ id: number; title: string }>>([]);
  const [userContents, setUserContents] = useState<Array<{ id: number; title: string }>>([]);

  // 템플릿 및 데이터 로드
  useEffect(() => {
    try {
      // 로컬스토리지에서 공방 커스텀 템플릿 불러오기
      const savedCustom = localStorage.getItem("craft_invitation_templates");
      let list = [...DEFAULT_CRAFT_TEMPLATES];
      if (savedCustom) {
        const parsed: CraftInvitationTemplate[] = JSON.parse(savedCustom);
        list = [...parsed, ...DEFAULT_CRAFT_TEMPLATES];
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount
      setAllTemplates(list);

      // URL 파라미터로 지정된 템플릿이 있으면 선택
      if (templateIdParam) {
        const found = list.find((t) => String(t.id) === String(templateIdParam));
        if (found) setSelectedTemplate(found);
      } else {
        setSelectedTemplate(list[0]);
      }

      // 유저의 파티 목록 로드
      const savedParties = localStorage.getItem(`party_posts_${userId}`);
      if (savedParties) {
        setUserParties(JSON.parse(savedParties));
      }

      // 유저의 콘텐츠 목록 로드
      const savedContents = localStorage.getItem(`contents_${userId}`);
      if (savedContents) {
        setUserContents(JSON.parse(savedContents));
      }
    } catch (e) {
      console.error(e);
    }
  }, [templateIdParam, userId]);

  // ---------------- 시간 유효성 검증 로직 ----------------
  const getMinutes = (timeStr: string) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const startMinutes = getMinutes(partyStartTime);
  const endMinutes = getMinutes(partyEndTime);

  // 종료 시간은 반드시 시작 시간보다 최소 30분 이상 늦어야 함
  const isTimeValid =
    startMinutes !== null && endMinutes !== null && endMinutes - startMinutes >= 30;

  // 시작 시간 변경 시 종료 시간을 "시작 시간 + 1시간"으로 자동 세팅
  const handleStartTimeChange = (val: string) => {
    setPartyStartTime(val);
    if (val) {
      const [hStr, mStr] = val.split(":");
      const h = parseInt(hStr, 10);
      const m = parseInt(mStr || "0", 10);
      const nextH = (h + 1) % 24;
      const autoEnd = `${String(nextH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      setPartyEndTime(autoEnd);
    }
  };

  // ---------------- 소개 항목 핸들러 ----------------
  const handleAddSection = () => {
    if (customSections.length >= 6) return alert("소개 항목은 최대 6개까지 추가 가능합니다.");
    setCustomSections((prev) => [
      ...prev,
      { id: Date.now(), title: "항목제목", content: "상세 내용을 적어보세요." },
    ]);
  };

  const handleRemoveSection = (id: number) => {
    setCustomSections((prev) => prev.filter((s) => s.id !== id));
  };

  // ---------------- 식순 핸들러 ----------------
  const handleAddSchedule = () => {
    if (schedules.length >= 10) return alert("식순은 최대 10개까지 추가 가능합니다.");
    setSchedules((prev) => [
      ...prev,
      {
        id: Date.now(),
        startTime: partyStartTime || "10:00",
        endTime: partyEndTime || "11:00",
        showDuration: true,
        bulletType: "dash",
        content: "상세 내용을 적어보세요.",
        linkedContentTitle: "",
      },
    ]);
  };

  const handleRemoveSchedule = (id: number) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  // 날짜 한국어 포맷 (2026.09.06. 일요일)
  const getFormattedEventDate = (d: string) => {
    if (!d) return "날짜 미정";
    try {
      const dateObj = new Date(d);
      const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
      const yy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");
      return `${yy}.${mm}.${dd}. ${days[dateObj.getDay()]}`;
    } catch {
      return d;
    }
  };

  // [임시저장]
  const handleSaveDraft = () => {
    try {
      const draft = {
        selectedTemplateId: selectedTemplate.id,
        partyTitle,
        linkedPartyTitle,
        eventDate,
        partyStartTime,
        partyEndTime,
        location,
        customSections,
        scheduleGlobalMode,
        schedules,
        selectedSeal,
        savedAt: Date.now(),
      };
      localStorage.setItem(`sent_invitations_draft_${userId}`, JSON.stringify(draft));
      alert("초대장 작성이 임시저장되었습니다.");
    } catch {
      alert("임시저장 중 오류가 발생했습니다.");
    }
  };

  // [등록] 핸들러: 우체통에 저장 후 이동
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!partyTitle.trim()) {
      alert("타이틀을 입력해 주세요.");
      setCurrentStep(1);
      return;
    }

    if (!isTimeValid) {
      alert("종료 시간은 시작 시간보다 최소 30분 이상 늦어야 합니다.");
      setCurrentStep(1);
      return;
    }

    const newMailItem = {
      id: Date.now(),
      partyTitle: partyTitle.trim(),
      linkedPartyTitle,
      eventDate: getFormattedEventDate(eventDate),
      partyStartTime,
      partyEndTime,
      location: location.trim() || "장소 미정",
      bgColor: selectedTemplate.paperBgColor || "#f3e9e0",
      seal: selectedSeal,
      customSections,
      schedules,
      scheduleGlobalMode,
      template: selectedTemplate,
      createdAt: Date.now(),
    };

    try {
      const existing = localStorage.getItem(`sent_invitations_${userId}`);
      const list = existing ? JSON.parse(existing) : [];
      localStorage.setItem(`sent_invitations_${userId}`, JSON.stringify([newMailItem, ...list]));

      alert("새 초대장이 성공적으로 등록되었습니다! 📮");
      router.push(`/house/${userId}/postbox`);
    } catch {
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FFFDF8] flex flex-col font-sans pb-24">
      {/* 1. 상단 바: 제목 + [1. 기본 정보] [2. 상세 내용] 탭 + [저장], [임시저장 1/3], [등록] */}
      <div className="w-full px-6 md:px-12 py-5 border-b border-neutral-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-[#FFFDF8]/90 backdrop-blur-md z-30">
        <div className="flex items-center gap-5">
          <h2 className="text-xl font-black text-neutral-900 tracking-tight whitespace-nowrap">
            새 초대장 만들기
          </h2>

          {/* 상단 탭 전환: 1. 기본 정보 / 2. 상세 내용 */}
          <div className="flex items-center gap-1.5 bg-neutral-200/70 p-1 rounded-full text-xs font-bold select-none">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`px-4 py-1.5 rounded-full transition cursor-pointer ${
                currentStep === 1
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              1. 기본 정보
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`px-4 py-1.5 rounded-full transition cursor-pointer ${
                currentStep === 2
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              2. 상세 내용
            </button>
          </div>
        </div>

        {/* 우측 액션 버튼들 */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="h-9 px-4 rounded-xl border border-neutral-300 hover:border-neutral-500 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition shadow-2xs cursor-pointer flex items-center justify-center whitespace-nowrap"
            >
              저장
            </button>
            <span className="text-[10px] text-neutral-400 font-medium">임시저장 1/3</span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="h-9 text-xs font-bold px-5 rounded-xl transition shadow-xs whitespace-nowrap flex items-center justify-center bg-neutral-900 hover:bg-black text-white cursor-pointer"
            title="초대장 등록하기"
          >
            등록
          </button>
        </div>
      </div>

      {/* 2. 본문 레이아웃: 좌측(실시간 프리뷰) + 우측(폼 영역) */}
      <div className="w-full px-6 md:px-12 py-8 flex flex-col xl:flex-row gap-12 items-start max-w-7xl mx-auto">
        {/* [좌측] 실시간 조립 프리뷰 (고정 캔버스) */}
        <div className="w-full xl:w-[420px] shrink-0 flex flex-col gap-4 sticky top-28">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-500 px-1">
            <span>{currentStep === 1 ? "초대장 커버 실시간 프리뷰" : "초대장 본문 실시간 프리뷰"}</span>
            <span className="text-[11px] font-normal text-neutral-400">입력값이 즉시 반영됩니다</span>
          </div>

          <div className="w-full rounded-2xl p-4 bg-[#E8E2D5]/40 border border-black/10 shadow-lg">
            {currentStep === 1 ? (
              /* Step 1: 초대장 커버 (주전자 등) 실시간 프리뷰 */
              <InvitationCoverPreview
                template={selectedTemplate}
                title={partyTitle}
                date={getFormattedEventDate(eventDate)}
                startTime={partyStartTime}
                endTime={partyEndTime}
                location={location}
                showGuides={true}
              />
            ) : (
              /* Step 2: 초대장 본문 (소개항목, 식순, 씰 오버레이) 실시간 프리뷰 */
              <InvitationBodyPreview
                template={selectedTemplate}
                customSections={customSections}
                schedules={schedules}
                scheduleGlobalMode={scheduleGlobalMode}
                selectedSeal={selectedSeal}
              />
            )}
          </div>
        </div>

        {/* [우측] 스텝별 입력 폼 패널 */}
        <div className="flex-1 w-full flex flex-col gap-8">
          {/* ======================= Step 1 (기본 정보) ======================= */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-7 animate-in fade-in duration-200">
              {/* 1) 초대장 템플릿 선택 그리드 */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-black text-neutral-900">초대장 템플릿 선택</label>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {allTemplates.map((tpl) => {
                    const isSelected = selectedTemplate.id === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setSelectedTemplate(tpl)}
                        className={`aspect-[148/100] rounded-xl flex items-center justify-center p-2 relative transition cursor-pointer ${
                          isSelected
                            ? "ring-2 ring-black bg-black/5 scale-102"
                            : "hover:bg-black/5 opacity-80 hover:opacity-100"
                        }`}
                        title={tpl.title}
                      >
                        {tpl.coverImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={tpl.coverImage}
                            alt={tpl.title}
                            className="w-full h-full object-contain pointer-events-none"
                          />
                        ) : tpl.coverType === "heart" ? (
                          <svg viewBox="0 0 300 200" className="w-full h-full" fill="#FCE5E8">
                            <path d="M150,185 C20,130 10,60 70,30 C120,5 150,55 150,55 C150,55 180,5 230,30 C290,60 280,130 150,185 Z" fill="#FCE5E8" stroke="#F6ADB8" strokeWidth="2" />
                          </svg>
                        ) : tpl.coverType === "book" ? (
                          <div className="w-[85%] h-[80%] bg-[#486b51] rounded-md p-1.5 flex items-center justify-center">
                            <div className="w-full h-full bg-[#FAF7EE] rounded-2xs border border-[#37523e]" />
                          </div>
                        ) : tpl.coverType === "house" ? (
                          <div className="w-[85%] h-[80%] bg-[#faebd7] rounded-lg border border-[#D97D54] relative" />
                        ) : (
                          <div className="w-full h-full bg-[#DEDACF] rounded-lg" />
                        )}
                      </button>
                    );
                  })}

                  {/* 더 많은 템플릿 보기 버튼 (+) */}
                  <button
                    type="button"
                    onClick={() => router.push("/village/craft/invitation")}
                    className="aspect-[148/100] rounded-xl border border-dashed border-neutral-300 hover:border-black bg-neutral-100/70 hover:bg-neutral-200/60 flex flex-col items-center justify-center gap-1 transition cursor-pointer p-2 text-neutral-600 hover:text-black"
                  >
                    <span className="text-xl font-light leading-none">+</span>
                    <span className="text-[10px] font-bold text-center leading-tight">더 많은<br />템플릿 보기</span>
                  </button>
                </div>
              </div>

              {/* 2) 타이틀* */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-black text-neutral-900">타이틀*</label>
                <input
                  type="text"
                  placeholder="타이틀을 입력하세요."
                  value={partyTitle}
                  onChange={(e) => setPartyTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-medium text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-black transition"
                />
              </div>

              {/* 3) 연동할 파티를 선택하세요. */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-black text-neutral-900 flex items-center gap-1.5">
                  <span>연동할 파티</span>
                  <span className="text-xs font-normal text-neutral-400">(선택)</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-neutral-400 pointer-events-none text-sm">🔗</span>
                  <select
                    value={linkedPartyTitle}
                    onChange={(e) => setLinkedPartyTitle(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-medium text-neutral-800 outline-none focus:border-black transition cursor-pointer"
                  >
                    <option value="">연동할 파티를 선택하세요.</option>
                    {userParties.map((p) => (
                      <option key={p.id} value={p.title}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4) 날짜* & 시간(시작*~종료) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 날짜 */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-black text-neutral-900">날짜*</label>
                  <div className="relative flex items-center">
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-medium text-neutral-800 outline-none focus:border-black transition"
                    />
                  </div>
                </div>

                {/* 시간(시작*~종료) */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-black text-neutral-900">시간(시작*~종료)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={partyStartTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-medium text-neutral-800 outline-none focus:border-black transition"
                    />
                    <span className="text-neutral-400 font-bold">~</span>
                    <input
                      type="time"
                      value={partyEndTime}
                      onChange={(e) => setPartyEndTime(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-medium text-neutral-800 outline-none focus:border-black transition"
                    />
                  </div>

                  {/* ⭐️ 시간 유효성 검증 경고 문구 */}
                  {!isTimeValid && (
                    <p className="text-[11px] font-bold text-red-600 mt-1 animate-in fade-in duration-150">
                      ⚠️ 종료 시간은 반드시 시작 시간보다 최소 30분 이상 늦어야 합니다.
                    </p>
                  )}
                </div>
              </div>

              {/* 5) 장소* */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-black text-neutral-900">장소*</label>
                <input
                  type="text"
                  placeholder="장소를 입력해 주세요."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-medium text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-black transition"
                />
              </div>

              {/* 다음 스텝(상세 내용) 이동 버튼 */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-neutral-900 hover:bg-black text-white text-xs font-bold px-6 py-2.5 rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span>다음: 상세 내용 작성</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================= Step 2 (상세 내용) ======================= */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-200">
              {/* 1) 소개 항목 추가/삭제 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-neutral-900">소개 항목</label>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="bg-black hover:bg-neutral-800 text-white text-xs font-bold px-3 py-1.5 rounded-full transition shadow-xs flex items-center gap-1"
                  >
                    <span>+ 항목추가</span>
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {customSections.map((sec) => (
                    <div
                      key={sec.id}
                      className="flex flex-col gap-2 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 relative group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={sec.title}
                          placeholder="항목제목"
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomSections((prev) =>
                              prev.map((s) => (s.id === sec.id ? { ...s, title: val } : s))
                            );
                          }}
                          className="flex-1 bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-800 outline-none focus:border-black transition"
                        />
                        {customSections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(sec.id)}
                            className="text-neutral-400 hover:text-red-600 p-1 text-xs font-bold transition"
                            title="삭제"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <textarea
                        value={sec.content}
                        placeholder="상세 내용을 적어보세요."
                        rows={2}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomSections((prev) =>
                            prev.map((s) => (s.id === sec.id ? { ...s, content: val } : s))
                          );
                        }}
                        className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs text-neutral-800 outline-none focus:border-black transition resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 2) 식순: [시간설정] vs [불릿 사용] 라디오 모드 토글 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-black text-neutral-900">식순</label>

                    {/* 라디오 토글 */}
                    <div className="flex items-center gap-3 text-xs font-bold text-neutral-700">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="scheduleMode"
                          checked={scheduleGlobalMode === "time"}
                          onChange={() => setScheduleGlobalMode("time")}
                          className="accent-black"
                        />
                        <span>시간설정</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="scheduleMode"
                          checked={scheduleGlobalMode === "bullet"}
                          onChange={() => setScheduleGlobalMode("bullet")}
                          className="accent-black"
                        />
                        <span>불릿 사용</span>
                      </label>
                    </div>

                    {/* 불릿 사용 모드 시 커스텀 불릿 라벨 */}
                    {scheduleGlobalMode === "bullet" && (
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-100/70 border border-amber-300 px-2.5 py-1 rounded-md">
                        커스텀 불릿 적용
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSchedule}
                    className="bg-black hover:bg-neutral-800 text-white text-xs font-bold px-3 py-1.5 rounded-full transition shadow-xs flex items-center gap-1"
                  >
                    <span>+ 일정추가</span>
                  </button>
                </div>

                {/* 식순 리스트 폼 */}
                <div className="flex flex-col gap-3">
                  {schedules.map((item) => {
                    const dur = calculateDuration(item.startTime, item.endTime);

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-2.5 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200"
                      >
                        {/* ⭐️ 시간설정 모드인 경우 시작/종료 시간 입력 및 소요시간 표기 */}
                        {scheduleGlobalMode === "time" && (
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={item.startTime}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSchedules((prev) =>
                                    prev.map((s) => (s.id === item.id ? { ...s, startTime: val } : s))
                                  );
                                }}
                                className="px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-medium text-neutral-800 outline-none focus:border-black"
                              />
                              <span className="text-neutral-400 font-bold">~</span>
                              <input
                                type="time"
                                value={item.endTime}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSchedules((prev) =>
                                    prev.map((s) => (s.id === item.id ? { ...s, endTime: val } : s))
                                  );
                                }}
                                className="px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-medium text-neutral-800 outline-none focus:border-black"
                              />
                            </div>

                            {/* 소요시간 자동 계산 라벨 (체크박스 완전 제거됨) */}
                            <div className="flex items-center gap-2">
                              {dur && (
                                <span className="text-xs font-black text-neutral-700 bg-neutral-200/80 px-2.5 py-1 rounded-md">
                                  {dur}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveSchedule(item.id)}
                                className="text-neutral-400 hover:text-red-600 p-1 text-xs font-bold transition"
                                title="일정 삭제"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 행사 내용* 입력 */}
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="행사 내용*"
                            value={item.content}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSchedules((prev) =>
                                prev.map((s) => (s.id === item.id ? { ...s, content: val } : s))
                              );
                            }}
                            className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-black"
                          />

                          {/* 불릿 모드일 때의 삭제 버튼 */}
                          {scheduleGlobalMode === "bullet" && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSchedule(item.id)}
                              className="text-neutral-400 hover:text-red-600 p-1 text-xs font-bold transition"
                              title="일정 삭제"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* 콘텐츠 연결(선택) 드롭다운 */}
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-neutral-400 pointer-events-none text-xs">🔗</span>
                          <select
                            value={item.linkedContentTitle || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSchedules((prev) =>
                                prev.map((s) => (s.id === item.id ? { ...s, linkedContentTitle: val } : s))
                              );
                            }}
                            className="w-full pl-8 pr-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-medium text-neutral-700 outline-none focus:border-black cursor-pointer"
                          >
                            <option value="">콘텐츠 연결(선택)</option>
                            {userContents.map((c) => (
                              <option key={c.id} value={c.title}>
                                {c.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3) 카테고리 씰 선택 */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-black text-neutral-900">카테고리 씰 선택</label>

                <div className="flex items-center gap-3 flex-wrap">
                  {PRESET_SEALS.map((seal) => {
                    const isSelected = selectedSeal.id === seal.id;
                    return (
                      <button
                        key={seal.id}
                        type="button"
                        onClick={() => setSelectedSeal(seal)}
                        className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl transition cursor-pointer p-1 relative shadow-xs ${
                          isSelected
                            ? "ring-2 ring-black scale-105"
                            : "opacity-80 hover:opacity-100 hover:scale-102"
                        }`}
                        style={{
                          backgroundColor: seal.color || "#2ea043",
                        }}
                        title={seal.name}
                      >
                        <span>{seal.emoji || "💌"}</span>
                      </button>
                    );
                  })}

                  {/* 더 많은 씰 보기 (+) */}
                  <button
                    type="button"
                    onClick={() => alert("추가 씰 스토어가 곧 오픈됩니다!")}
                    className="w-16 h-16 rounded-xl border border-dashed border-neutral-300 hover:border-black bg-neutral-100/70 hover:bg-neutral-200/60 flex flex-col items-center justify-center gap-0.5 transition cursor-pointer p-1 text-neutral-600 hover:text-black"
                  >
                    <span className="text-lg font-light leading-none">+</span>
                    <span className="text-[9px] font-bold text-center leading-tight">더 많은<br />씰 보기</span>
                  </button>
                </div>
              </div>

              {/* 이전 / 완료 버튼 그룹 */}
              <div className="pt-6 border-t border-neutral-200/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span>←</span>
                  <span>이전: 기본 정보 수정</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-neutral-900 hover:bg-black text-white text-xs font-bold px-7 py-2.5 rounded-xl transition cursor-pointer shadow-sm flex items-center gap-2"
                >
                  <span>초대장 등록 완료</span>
                  <span>📮</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewInvitationPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400">초대장 에디터 불러오는 중...</div>}>
      <NewInvitationContent />
    </Suspense>
  );
}