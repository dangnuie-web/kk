"use client";

import React, { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

// 오늘 날짜 포맷 (26.08.31.월 형태)
const getFormattedToday = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${yy}.${mm}.${dd}.${days[now.getDay()]}`;
};

// 그리드 아이템 타입
interface GridCardItem {
  id: number;
  name: string;
  description: string;
  image?: string;
}

// 리스트 아이템 타입
interface ListItem {
  id: number;
  text: string;
}

// 퀴즈 아이템 타입
interface QuizItem {
  id: number;
  type: "multiple" | "subjective";
  question: string;
  options: string[]; // 객관식용 보기들
  answer?: string; // 주관식 정답
}

export default function NewContentsPage() {
  const params = useParams();
  const userId = (params?.userId as string) || "dang";
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardFileInputRef = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // 1. 기본 헤더 정보 상태
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // 2. 본문 기본 상태 (게시글형 베이스)
  const [postBody, setPostBody] = useState("");
  const [postImage, setPostImage] = useState<string | null>(null);

  // 3. 요소 추가 토글 상태 (동시 존재 가능)
  const [hasGridSection, setHasGridSection] = useState(false);
  const [hasListSection, setHasListSection] = useState(false);
  const [hasQuizSection, setHasQuizSection] = useState(false);

  // (1) 그리드 카드 목록
  const [gridCards, setGridCards] = useState<GridCardItem[]>([
    { id: 1, name: "", description: "" },
    { id: 2, name: "", description: "" },
  ]);

  // (2) 리스트 항목 목록
  const [listItems, setListItems] = useState<ListItem[]>([
    { id: 1, text: "" },
    { id: 2, text: "" },
  ]);

  // (3) 퀴즈 항목 목록
  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);

  // 임시저장 상태
  const [activeDraftSlotId, setActiveDraftSlotId] = useState<number | null>(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [drafts, setDrafts] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(`contents_drafts_${userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ---------------- 임시저장 핸들러 ----------------
  const handleSaveDraft = () => {
    if (!title.trim() && !description.trim() && !postBody.trim()) {
      alert("저장할 내용이 없습니다.");
      return;
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 이미 활성화된 임시저장 슬롯이 있는 경우 -> 덮어쓰기
    if (activeDraftSlotId !== null && drafts.some((d) => d.slotId === activeDraftSlotId)) {
      const updated = drafts.map((d) =>
        d.slotId === activeDraftSlotId
          ? {
              ...d,
              title: title || "제목 없음",
              description,
              postBody,
              postImage,
              hasGridSection,
              hasListSection,
              hasQuizSection,
              gridCards,
              listItems,
              quizItems,
              savedAt: nowTime,
            }
          : d
      );
      setDrafts(updated);
      localStorage.setItem(`contents_drafts_${userId}`, JSON.stringify(updated));
      alert("임시저장이 최신 버전으로 갱신되었습니다.");
      return;
    }

    // 새 슬롯 저장 (최대 3개)
    if (drafts.length >= 3) {
      alert("저장 목록이 꽉 찼습니다.");
      setShowDraftModal(true);
      return;
    }

    const existingSlotIds = drafts.map((d) => d.slotId);
    let newSlotId = 1;
    for (let i = 1; i <= 3; i++) {
      if (!existingSlotIds.includes(i)) {
        newSlotId = i;
        break;
      }
    }

    const newDraft = {
      slotId: newSlotId,
      savedAt: nowTime,
      title: title || "제목 없음",
      description,
      postBody,
      postImage,
      hasGridSection,
      hasListSection,
      hasQuizSection,
      gridCards,
      listItems,
      quizItems,
    };

    const updated = [...drafts, newDraft];
    setDrafts(updated);
    setActiveDraftSlotId(newSlotId);
    localStorage.setItem(`contents_drafts_${userId}`, JSON.stringify(updated));
    alert(`임시저장 완료 (${updated.length}/3)`);
  };

  const handleLoadDraft = (draft: any) => {
    setTitle(draft.title === "제목 없음" ? "" : draft.title);
    setDescription(draft.description || "");
    setPostBody(draft.postBody || "");
    setPostImage(draft.postImage || null);
    setHasGridSection(Boolean(draft.hasGridSection));
    setHasListSection(Boolean(draft.hasListSection));
    setHasQuizSection(Boolean(draft.hasQuizSection));
    if (draft.gridCards) setGridCards(draft.gridCards);
    if (draft.listItems) setListItems(draft.listItems);
    if (draft.quizItems) setQuizItems(draft.quizItems);
    setActiveDraftSlotId(draft.slotId);
    setShowDraftModal(false);
  };

  const handleDeleteDraft = (slotId: number) => {
    const updated = drafts.filter((d) => d.slotId !== slotId);
    setDrafts(updated);
    localStorage.setItem(`contents_drafts_${userId}`, JSON.stringify(updated));
    if (activeDraftSlotId === slotId) {
      setActiveDraftSlotId(null);
    }
  };

  // ---------------- [그리드] 카드 핸들러 (한 줄에 최대 3개, 최대 10줄 = 총 30개) ----------------
  const handleAddGridCard = () => {
    if (gridCards.length >= 30) {
      alert("그리드 카드는 최대 10줄(30개)까지 추가할 수 있습니다.");
      return;
    }
    setGridCards((prev) => [
      ...prev,
      { id: Date.now(), name: "", description: "" },
    ]);
  };

  const handleRemoveGridCard = (id: number) => {
    const updated = gridCards.filter((c) => c.id !== id);
    setGridCards(updated);
    if (updated.length === 0) {
      setHasGridSection(false);
    }
  };

  const handleGridImageUpload = (id: number, file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setGridCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, image: result } : c))
      );
    };
  };

  // ---------------- [리스트] 항목 핸들러 ----------------
  const handleAddListItem = () => {
    setListItems((prev) => [...prev, { id: Date.now(), text: "" }]);
  };

  const handleRemoveListItem = (id: number) => {
    const updated = listItems.filter((item) => item.id !== id);
    setListItems(updated);
    if (updated.length === 0) {
      setHasListSection(false);
    }
  };

  // ---------------- [퀴즈] 항목 핸들러 ----------------
  const handleAddQuiz = (type: "multiple" | "subjective") => {
    setQuizItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        type,
        question: "",
        options: type === "multiple" ? ["", ""] : [],
        answer: "",
      },
    ]);
  };

  const handleRemoveQuiz = (id: number) => {
    const updated = quizItems.filter((q) => q.id !== id);
    setQuizItems(updated);
  };

  const handleAddQuizOption = (quizId: number) => {
    setQuizItems((prev) =>
      prev.map((q) =>
        q.id === quizId && q.options.length < 5
          ? { ...q, options: [...q.options, ""] }
          : q
      )
    );
  };

  // ---------------- 최종 등록 제출 ----------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("제목을 입력해 주세요.");
      return;
    }

    try {
      const coverImage =
        gridCards.find((c) => c.image)?.image || postImage || undefined;

      const newContent = {
        id: Date.now(),
        userId,
        title,
        description,
        type: "post",
        createdAt: getFormattedToday(),
        date: getFormattedToday(),
        coverImage,
        hasGrid: hasGridSection && gridCards.length > 0,
        hasList: hasListSection && listItems.length > 0,
        hasQuiz: hasQuizSection && quizItems.length > 0,
        data: {
          post: { postImage, postBody },
          gridCards: hasGridSection ? gridCards : [],
          listItems: hasListSection ? listItems : [],
          quizItems: hasQuizSection ? quizItems : [],
        },
      };

      // 목록 뷰 동기화
      const key1 = `contents_${userId}`;
      const key2 = `content_posts_${userId}`;
      const prev1 = localStorage.getItem(key1);
      const parsed1 = prev1 ? JSON.parse(prev1) : [];
      localStorage.setItem(key1, JSON.stringify([newContent, ...parsed1]));

      const prev2 = localStorage.getItem(key2);
      const parsed2 = prev2 ? JSON.parse(prev2) : [];
      localStorage.setItem(key2, JSON.stringify([newContent, ...parsed2]));

      if (activeDraftSlotId !== null) {
        handleDeleteDraft(activeDraftSlotId);
      }

      alert("콘텐츠가 성공적으로 등록되었습니다!");
      router.push(`/house/${userId}/contents`);
    } catch (err) {
      console.error(err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="w-full px-6 md:px-12 py-6 flex flex-col gap-6 font-sans pb-24">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1 w-full">
        
        {/* 1. 상단 바: 작성일자 & 제목 & 설명 / 우측 임시저장 & 등록 버튼 */}
        <div className="flex items-end justify-between gap-4 border-b border-neutral-200/60 pb-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-xs text-neutral-500 font-normal">
              작성일자 : {getFormattedToday()}
            </span>
            <input
              type="text"
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-light text-neutral-900 placeholder:text-neutral-400 outline-none bg-transparent"
            />
            <input
              type="text"
              placeholder="간단한 소개나 설명을 적어보세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs md:text-sm text-neutral-600 placeholder:text-neutral-400 outline-none bg-transparent mt-1"
            />
          </div>

          <div className="flex items-start gap-3 shrink-0">
            {/* 임시저장 컨트롤 */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="h-9 px-4 rounded-xl border border-neutral-300 hover:border-neutral-500 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition shadow-2xs cursor-pointer flex items-center justify-center whitespace-nowrap"
              >
                저장
              </button>
              <button
                type="button"
                onClick={() => setShowDraftModal(true)}
                className="text-[11px] text-neutral-500 hover:text-neutral-900 font-medium cursor-pointer transition underline-offset-2 hover:underline whitespace-nowrap"
                title="임시저장 목록 보기"
              >
                임시저장 {drafts.length}/3
              </button>
            </div>

            {/* 글 등록 버튼 */}
            <button
              type="submit"
              className="h-9 bg-neutral-900 hover:bg-black text-white text-xs font-bold px-5 rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap flex items-center justify-center"
            >
              등록
            </button>
          </div>
        </div>

        {/* 2. 에디터 툴바 (아이콘 기반 요소 추가 & 서식 도구, 반응형 자동 줄바꿈) */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-neutral-200/60 pb-3 text-xs text-neutral-700 select-none">
          {/* ⭐️ 요소 추가 아이콘 그룹: 그리드, 리스트, 퀴즈 */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 그리드 아이콘 버튼 */}
            <button
              type="button"
              onClick={() => setHasGridSection((prev) => !prev)}
              className={`p-1.5 rounded-lg transition cursor-pointer flex items-center justify-center ${
                hasGridSection ? "bg-neutral-900 text-white" : "hover:bg-black/5 text-neutral-800"
              }`}
              title={hasGridSection ? "그리드 카드 숨기기" : "그리드 카드 추가"}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/grid.png"
                alt="그리드"
                className={`w-4 h-4 object-contain ${hasGridSection ? "invert" : ""}`}
              />
            </button>

            {/* 리스트 아이콘 버튼 */}
            <button
              type="button"
              onClick={() => setHasListSection((prev) => !prev)}
              className={`p-1.5 rounded-lg transition cursor-pointer flex items-center justify-center ${
                hasListSection ? "bg-neutral-900 text-white" : "hover:bg-black/5 text-neutral-800"
              }`}
              title={hasListSection ? "리스트 항목 숨기기" : "리스트 항목 추가"}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/list.png"
                alt="리스트"
                className={`w-4 h-4 object-contain ${hasListSection ? "invert" : ""}`}
              />
            </button>

            {/* 퀴즈 아이콘 버튼 */}
            <button
              type="button"
              onClick={() => setHasQuizSection((prev) => !prev)}
              className={`p-1.5 rounded-lg transition cursor-pointer flex items-center justify-center ${
                hasQuizSection ? "bg-neutral-900 text-white" : "hover:bg-black/5 text-neutral-800"
              }`}
              title={hasQuizSection ? "퀴즈 항목 숨기기" : "퀴즈 추가"}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/quiz.png"
                alt="퀴즈"
                className={`w-4 h-4 object-contain ${hasQuizSection ? "invert" : ""}`}
              />
            </button>
          </div>

          {/* 구분선 */}
          <div className="h-4 w-px bg-neutral-300/80 shrink-0" />

          {/* 미디어 첨부 아이콘: 사진, 비디오, 링크 */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg hover:bg-black/5 transition cursor-pointer text-neutral-800 flex items-center justify-center"
              title="대표 사진 업로드"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/image.png" alt="사진" className="w-4 h-4 object-contain" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => setPostImage(ev.target?.result as string);
                  reader.readAsDataURL(file);
                }
              }}
            />

            <button
              type="button"
              onClick={() => alert("비디오 첨부 기능은 준비 중입니다.")}
              className="p-1.5 rounded-lg hover:bg-black/5 transition cursor-pointer text-neutral-800 flex items-center justify-center"
              title="비디오 첨부"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/vidio.png" alt="동영상" className="w-4 h-4 object-contain" />
            </button>

            <button
              type="button"
              onClick={() => {
                const url = prompt("첨부할 링크 URL을 입력해 주세요:");
                if (url) {
                  setPostBody((prev) => (prev ? `${prev}\n${url}` : url));
                }
              }}
              className="p-1.5 rounded-lg hover:bg-black/5 transition cursor-pointer text-neutral-800 flex items-center justify-center"
              title="링크 첨부"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/link.png" alt="링크" className="w-4 h-4 object-contain" />
            </button>
          </div>

          {/* 구분선 */}
          <div className="h-4 w-px bg-neutral-300/80 shrink-0" />

          {/* 텍스트 서식 툴 */}
          <div className="flex items-center gap-3.5 shrink-0">
            <button type="button" className="flex items-center gap-1 hover:text-black font-medium">
              <span>나눔고딕</span>
              <span className="text-[10px] text-neutral-400">⌵</span>
            </button>
            <button type="button" className="flex items-center gap-1 hover:text-black font-medium">
              <span>15</span>
              <span className="text-[10px] text-neutral-400">⌵</span>
            </button>
            <button type="button" className="font-black text-sm px-1 hover:text-black">
              B
            </button>
            <button type="button" className="flex items-baseline font-bold px-1 hover:text-black">
              <span>T</span>
              <span className="w-1.5 h-1.5 bg-black inline-block ml-0.5" />
            </button>
            <button type="button" className="border border-neutral-400 rounded px-1 text-[11px] font-bold hover:border-black">
              T
            </button>
          </div>
        </div>

        {/* ---------------- 3. 동적 추가 요소 캔버스 ---------------- */}
        <div className="flex flex-col gap-8 w-full">
          
          {/* (1) 대표 사진 미리보기 (사진 아이콘으로 등록했을 때) */}
          {postImage && (
            <div className="relative max-w-lg rounded-xl overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={postImage} alt="본문 대표 이미지" className="w-full h-auto object-cover rounded-xl" />
              <button
                type="button"
                onClick={() => setPostImage(null)}
                className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white text-xs px-2.5 py-1 rounded-md transition cursor-pointer"
              >
                삭제
              </button>
            </div>
          )}

          {/* (2) ⭐️ 그리드 카드 섹션 (한 줄에 최대 3개, 가운데 정렬, 최대 10줄/30개) */}
          {hasGridSection && (
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 pt-1 select-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 items-start">
                {gridCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="w-full flex flex-col gap-2"
                  >
                    {/* 사진 업로드 박스 (연회색 bg-[#EFEFEF], rounded-lg) */}
                    <div className="w-full aspect-[4/3] bg-[#EFEFEF] rounded-lg relative overflow-hidden flex flex-col items-center justify-center group shadow-2xs">
                      {card.image ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={card.image}
                            alt={card.name || "카드 이미지"}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setGridCards((prev) =>
                                prev.map((c) => (c.id === card.id ? { ...c, image: undefined } : c))
                              )
                            }
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-black text-white text-xs flex items-center justify-center transition cursor-pointer"
                            title="사진 지우기"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => cardFileInputRef.current[card.id]?.click()}
                            className="text-xs font-medium text-neutral-600 hover:text-black transition cursor-pointer py-2 px-3 rounded-md"
                          >
                            + 사진 업로드
                          </button>
                          {/* 카드 우측 상단 삭제 버튼 */}
                          <button
                            type="button"
                            onClick={() => handleRemoveGridCard(card.id)}
                            className="absolute top-2.5 right-2.5 text-neutral-400 hover:text-neutral-800 text-sm font-bold p-1 cursor-pointer transition"
                            title="카드 삭제"
                          >
                            ✕
                          </button>
                        </>
                      )}

                      <input
                        ref={(el) => {
                          cardFileInputRef.current[card.id] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleGridImageUpload(card.id, file);
                        }}
                      />
                    </div>

                    {/* 카드 제목 입력 */}
                    <input
                      type="text"
                      placeholder={`카드${idx + 1}`}
                      value={card.name}
                      onChange={(e) =>
                        setGridCards((prev) =>
                          prev.map((c) => (c.id === card.id ? { ...c, name: e.target.value } : c))
                        )
                      }
                      className="text-xs md:text-sm font-bold text-neutral-900 bg-transparent outline-none placeholder:text-neutral-400 pt-1"
                    />

                    {/* 카드 설명 입력 */}
                    <input
                      type="text"
                      placeholder="설명을 간단히 입력하세요."
                      value={card.description}
                      onChange={(e) =>
                        setGridCards((prev) =>
                          prev.map((c) => (c.id === card.id ? { ...c, description: e.target.value } : c))
                        )
                      }
                      className="text-xs text-neutral-600 bg-transparent outline-none placeholder:text-neutral-400"
                    />
                  </div>
                ))}

                {/* + 카드 추가 버튼 (최대 10줄 30개까지 노출) */}
                {gridCards.length < 30 && (
                  <button
                    type="button"
                    onClick={handleAddGridCard}
                    className="w-full aspect-[4/3] bg-[#FFFDF8] border border-neutral-300 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-neutral-50 transition text-neutral-700 hover:text-black shadow-2xs"
                  >
                    <span className="text-xl font-bold">+</span>
                    <span className="text-xs font-bold">카드 추가</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* (3) ⭐️ 리스트 섹션 (이미지 3 기반 모던 플랫 UI) */}
          {hasListSection && (
            <div className="w-full max-w-xl mx-auto flex flex-col gap-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-neutral-500 tracking-wide">리스트</span>
                <button
                  type="button"
                  onClick={() => setHasListSection(false)}
                  className="text-xs text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
                >
                  리스트 숨기기
                </button>
              </div>

              {/* 리스트 항목 목록 */}
              <div className="flex flex-col gap-2.5">
                {listItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="w-full bg-[#EFEFEF] rounded-xl px-5 py-3.5 flex items-center justify-between text-xs md:text-sm font-medium text-neutral-800 shadow-2xs group"
                  >
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) =>
                        setListItems((prev) =>
                          prev.map((li) => (li.id === item.id ? { ...li, text: e.target.value } : li))
                        )
                      }
                      placeholder={`리스트 ${idx + 1}`}
                      className="flex-1 bg-transparent outline-none text-neutral-800 placeholder:text-neutral-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveListItem(item.id)}
                      className="text-neutral-400 hover:text-black font-bold text-sm ml-2 cursor-pointer p-0.5 transition"
                      title="항목 삭제"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* + 리스트 추가 버튼 */}
                <button
                  type="button"
                  onClick={handleAddListItem}
                  className="w-full bg-[#FFFDF8] border border-neutral-300 rounded-xl py-3 flex items-center justify-center text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer shadow-2xs"
                >
                  + 리스트 추가
                </button>
              </div>
            </div>
          )}

          {/* (4) ⭐️ 퀴즈 섹션 (이미지 4, 5 기반 모던 플랫 UI) */}
          {hasQuizSection && (
            <div className="w-full max-w-xl mx-auto flex flex-col gap-4 pt-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-neutral-500 tracking-wide">퀴즈</span>
                <button
                  type="button"
                  onClick={() => setHasQuizSection(false)}
                  className="text-xs text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
                >
                  퀴즈 숨기기
                </button>
              </div>

              {/* 생성된 퀴즈 목록 */}
              {quizItems.map((q) => (
                <div key={q.id} className="flex flex-col gap-1.5 w-full">
                  <span className="text-[11px] font-bold text-neutral-600 px-1">
                    {q.type === "multiple" ? "객관식 퀴즈" : "주관식 퀴즈"}
                  </span>

                  {/* 퀴즈 회색 박스 컨테이너 */}
                  <div className="w-full bg-[#EFEFEF] rounded-2xl p-6 relative flex flex-col gap-4 shadow-2xs">
                    {/* 우측 상단 퀴즈 삭제 버튼 */}
                    <button
                      type="button"
                      onClick={() => handleRemoveQuiz(q.id)}
                      className="absolute top-3.5 right-4 text-neutral-400 hover:text-black font-bold text-sm cursor-pointer p-1 transition"
                      title="퀴즈 삭제"
                    >
                      ✕
                    </button>

                    {/* 문제 입력 필드 */}
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) =>
                        setQuizItems((prev) =>
                          prev.map((item) => (item.id === q.id ? { ...item, question: e.target.value } : item))
                        )
                      }
                      placeholder="문제를 입력해 주세요."
                      className="w-full text-center text-sm md:text-base font-bold text-neutral-900 bg-transparent outline-none placeholder:text-neutral-500 py-1"
                    />

                    {/* 객관식 보기 리스트 */}
                    {q.type === "multiple" ? (
                      <div className="flex flex-col gap-2 pt-1">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className="w-full bg-white rounded-xl py-2.5 px-4 text-xs font-medium text-neutral-800 flex items-center justify-between shadow-2xs"
                          >
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...q.options];
                                newOpts[optIdx] = e.target.value;
                                setQuizItems((prev) =>
                                  prev.map((item) =>
                                    item.id === q.id ? { ...item, options: newOpts } : item
                                  )
                                );
                              }}
                              placeholder={`보기${optIdx + 1}`}
                              className="w-full text-center bg-transparent outline-none placeholder:text-neutral-400 font-medium"
                            />
                          </div>
                        ))}

                        {/* + 보기 추가 */}
                        {q.options.length < 5 && (
                          <button
                            type="button"
                            onClick={() => handleAddQuizOption(q.id)}
                            className="w-full bg-white/70 hover:bg-white rounded-xl py-2.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 text-center transition cursor-pointer shadow-2xs"
                          >
                            + 보기 추가
                          </button>
                        )}
                      </div>
                    ) : (
                      /* 주관식 정답 안내/입력창 */
                      <div className="pt-1">
                        <input
                          type="text"
                          value={q.answer || ""}
                          onChange={(e) =>
                            setQuizItems((prev) =>
                              prev.map((item) => (item.id === q.id ? { ...item, answer: e.target.value } : item))
                            )
                          }
                          placeholder="정답을 입력하세요 (선택)"
                          className="w-full bg-white rounded-xl py-3 px-4 text-xs text-neutral-800 placeholder:text-neutral-400 outline-none shadow-2xs text-center font-medium"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* 하단 퀴즈 추가 버튼 2개 (이미지 4, 5) */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleAddQuiz("multiple")}
                  className="w-full bg-[#FFFDF8] border border-neutral-300 rounded-xl py-3 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer shadow-2xs text-center"
                >
                  + 객관식 퀴즈 추가
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuiz("subjective")}
                  className="w-full bg-[#FFFDF8] border border-neutral-300 rounded-xl py-3 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer shadow-2xs text-center"
                >
                  + 주관식 퀴즈 추가
                </button>
              </div>
            </div>
          )}

          {/* 4. 본문 텍스트 캔버스 (언제나 자연스럽게 최하단에 위치) */}
          <div className="w-full flex flex-col pt-2">
            <textarea
              placeholder="내용을 입력해주세요."
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              rows={12}
              className="w-full bg-transparent border-none outline-none resize-none text-sm text-neutral-800 placeholder:text-neutral-400 leading-relaxed pt-2"
            />
          </div>

        </div>

      </form>

      {/* 임시저장 모달 */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 border-neutral-100">
              <h4 className="font-bold text-sm text-neutral-900">
                임시저장 목록 ({drafts.length}/3)
              </h4>
              <button
                type="button"
                onClick={() => setShowDraftModal(false)}
                className="text-neutral-400 hover:text-black font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {drafts.length === 0 ? (
              <div className="py-8 text-center text-xs font-medium text-neutral-400">
                임시저장된 글이 없습니다.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {drafts.map((d: any) => (
                  <div
                    key={d.slotId}
                    onClick={() => handleLoadDraft(d)}
                    className="p-3 border border-neutral-200 rounded-2xl hover:bg-neutral-50 cursor-pointer flex justify-between items-center transition group"
                  >
                    <div className="flex flex-col flex-1 min-w-0 pr-3">
                      <span className="font-bold text-xs text-neutral-900 truncate">
                        {d.title || "제목 없음"}
                      </span>
                      <span className="text-[10px] text-neutral-400 mt-0.5">
                        저장 시간: {d.savedAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-blue-600 font-bold group-hover:underline">
                        불러오기
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("이 임시저장 글을 삭제하시겠습니까?")) {
                            handleDeleteDraft(d.slotId);
                          }
                        }}
                        className="text-xs text-neutral-400 hover:text-red-500 font-medium px-1.5 py-0.5 rounded cursor-pointer transition"
                        title="삭제"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}