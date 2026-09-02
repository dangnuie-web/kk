"use client";

import React, { useState } from "react";
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

// 템플릿 타입 정의
type TemplateType = "grid" | "post" | "list" | "quiz";

// 1. 그리드 아이템 타입
interface GridCardItem {
  id: number;
  name: string;
  description: string;
  image?: string;
}

// 3. 리스트 아이템 타입
interface ListItem {
  id: number;
  text: string;
}

// 4. 퀴즈 아이템 타입
interface QuizItem {
  id: number;
  type: "multiple" | "subjective";
  question: string;
  options: string[]; // 객관식용 보기들
}

export default function NewContentsPage() {
  const params = useParams();
  const userId = (params?.userId as string) || "dang";
  const router = useRouter();

  // 기본 정보 상태
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState<TemplateType>("grid");

  // 1. 그리드 폼 상태 (기본 2개 제공)
  const [gridCards, setGridCards] = useState<GridCardItem[]>([
    { id: 1, name: "", description: "" },
    { id: 2, name: "", description: "" },
  ]);

  // 2. 게시글 폼 상태
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postBody, setPostBody] = useState("");

  // 3. 리스트 폼 상태 (기본 3개 제공)
  const [listItems, setListItems] = useState<ListItem[]>([
    { id: 1, text: "" },
    { id: 2, text: "" },
    { id: 3, text: "" },
  ]);

  // 4. 퀴즈 폼 상태 (기본 객관식 1개 제공)
  const [quizItems, setQuizItems] = useState<QuizItem[]>([
    { id: 1, type: "multiple", question: "", options: ["", "", "", ""] },
  ]);

  // ---------------- 핸들러 모음 ----------------

  // [그리드] 카드 추가/삭제
  const handleAddGridCard = () => {
    setGridCards((prev) => [
      ...prev,
      { id: Date.now(), name: "", description: "" },
    ]);
  };
  const handleRemoveGridCard = (id: number) => {
    if (gridCards.length <= 1) return;
    setGridCards((prev) => prev.filter((c) => c.id !== id));
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

  // [게시글] 이미지 업로드
  const handlePostImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => setPostImage(e.target?.result as string);
  };

  // [리스트] 항목 추가/삭제
  const handleAddListItem = () => {
    setListItems((prev) => [...prev, { id: Date.now(), text: "" }]);
  };
  const handleRemoveListItem = (id: number) => {
    if (listItems.length <= 1) return;
    setListItems((prev) => prev.filter((item) => item.id !== id));
  };

  // [퀴즈] 퀴즈 추가/삭제
  const handleAddQuiz = (type: "multiple" | "subjective") => {
    setQuizItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        type,
        question: "",
        options: type === "multiple" ? ["", "", "", ""] : [],
      },
    ]);
  };
  const handleRemoveQuiz = (id: number) => {
    if (quizItems.length <= 1) return;
    setQuizItems((prev) => prev.filter((q) => q.id !== id));
  };

  // 최종 등록 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("제목을 입력해 주세요.");
      return;
    }

    try {
      const storageKey = `contents_${userId}`;
      const prev = localStorage.getItem(storageKey);
      const parsed = prev ? JSON.parse(prev) : [];

      const newContent = {
        id: Date.now(),
        userId,
        title,
        description,
        type: selectedType,
        createdAt: getFormattedToday(),
        data: {
          gridCards: selectedType === "grid" ? gridCards : undefined,
          post: selectedType === "post" ? { postImage, postBody } : undefined,
          listItems: selectedType === "list" ? listItems : undefined,
          quizItems: selectedType === "quiz" ? quizItems : undefined,
        },
      };

      localStorage.setItem(storageKey, JSON.stringify([newContent, ...parsed]));
      alert("콘텐츠가 성공적으로 등록되었습니다!");
      router.push(`/house/${userId}/contents`);
    } catch (err) {
      console.error(err);
      alert("저장 중 용량 초과 또는 오류가 발생했습니다.");
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-sm border border-neutral-200/60 max-w-5xl mx-auto w-full min-h-[620px] flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">
        
        {/* 상단 1: 작성일자 & 제목 & 설명 */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-bold">
            <span>작성일자</span>
            <span>{getFormattedToday()}</span>
          </div>

          <input
            type="text"
            placeholder="콘텐츠 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl md:text-3xl font-black text-neutral-900 placeholder:text-neutral-300 outline-none border-b border-neutral-200 pb-2.5"
          />

          <input
            type="text"
            placeholder="간단한 소개나 설명을 적어보세요 (선택)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-xs md:text-sm text-neutral-600 placeholder:text-neutral-400 outline-none px-0.5"
          />
        </div>

        {/* 상단 2: 가로 세그먼트 탭 (파티 페이지 톤앤매너 일치) */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100/90 rounded-2xl w-fit">
          {[
            { key: "grid", label: "그리드형" },
            { key: "post", label: "게시글형" },
            { key: "list", label: "리스트형" },
            { key: "quiz", label: "퀴즈형" },
          ].map((tab) => {
            const isSelected = selectedType === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedType(tab.key as TemplateType)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  isSelected
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ---------------- 폼 본문 영역 (선택 탭에 따라 교체) ---------------- */}
        <div className="flex-1 py-2">
          
          {/* 1. 그리드형 (메뉴판 / 보드게임 카드 모음) */}
          {selectedType === "grid" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {gridCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="relative bg-neutral-50 border border-neutral-200/80 rounded-2xl p-3 flex flex-col gap-2.5 group"
                  >
                    {/* 카드 삭제 (X) 버튼 */}
                    {gridCards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveGridCard(card.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10"
                      >
                        ✕
                      </button>
                    )}

                    {/* 사진 업로드 영역 */}
                    <label className="w-full aspect-[4/3] bg-neutral-200/70 hover:bg-neutral-200 rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative transition border border-dashed border-neutral-300">
                      {card.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={card.image}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-neutral-500">
                          + 사진 업로드
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleGridImageUpload(card.id, file);
                        }}
                      />
                    </label>

                    {/* 이름 & 설명 인풋 */}
                    <input
                      type="text"
                      placeholder={`메뉴명 / 카드 ${idx + 1}`}
                      value={card.name}
                      onChange={(e) =>
                        setGridCards((prev) =>
                          prev.map((c) =>
                            c.id === card.id ? { ...c, name: e.target.value } : c
                          )
                        )
                      }
                      className="text-sm font-bold bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400 border-b border-neutral-200 pb-1"
                    />
                    <input
                      type="text"
                      placeholder="설명을 간단히 적어보세요"
                      value={card.description}
                      onChange={(e) =>
                        setGridCards((prev) =>
                          prev.map((c) =>
                            c.id === card.id
                              ? { ...c, description: e.target.value }
                              : c
                          )
                        )
                      }
                      className="text-xs bg-transparent outline-none text-neutral-600 placeholder:text-neutral-400"
                    />
                  </div>
                ))}

                {/* + 카드 추가 박스 */}
                <button
                  type="button"
                  onClick={handleAddGridCard}
                  className="aspect-[4/3] rounded-2xl border-2 border-dashed border-neutral-300 hover:border-neutral-400 flex flex-col items-center justify-center text-neutral-400 hover:text-neutral-600 gap-1 transition"
                >
                  <span className="text-2xl font-bold">+</span>
                  <span className="text-xs font-bold">카드 추가</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. 게시글형 (상단 대형 미디어 + 긴 본문) */}
          {selectedType === "post" && (
            <div className="flex flex-col gap-4">
              <label className="w-full aspect-video md:aspect-[21/9] bg-neutral-100 hover:bg-neutral-200/70 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden border border-dashed border-neutral-300 transition">
                {postImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={postImage}
                    alt="post banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-neutral-400">
                    <span className="text-2xl">📷</span>
                    <span className="text-xs font-bold">대표 사진 / 이미지 등록</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePostImageUpload(file);
                  }}
                />
              </label>

              <textarea
                rows={8}
                placeholder="자세한 이야기나 규칙, 소개 내용을 적어주세요..."
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
                className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-2xl p-4 text-sm text-neutral-800 placeholder:text-neutral-300 outline-none resize-none leading-relaxed"
              />
            </div>
          )}

          {/* 3. 리스트형 (둥근 알약형 목록 추가/제거) */}
          {selectedType === "list" && (
            <div className="flex flex-col gap-3 max-w-2xl mx-auto w-full">
              {listItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="flex-1 bg-neutral-200/80 hover:bg-neutral-200 rounded-2xl px-5 py-3.5 flex items-center transition shadow-sm">
                    <input
                      type="text"
                      placeholder={`리스트 항목 ${idx + 1}`}
                      value={item.text}
                      onChange={(e) =>
                        setListItems((prev) =>
                          prev.map((it) =>
                            it.id === item.id
                              ? { ...it, text: e.target.value }
                              : it
                          )
                        )
                      }
                      className="w-full bg-transparent text-center font-bold text-neutral-800 placeholder:text-neutral-500 outline-none text-sm md:text-base"
                    />
                  </div>
                  {listItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveListItem(item.id)}
                      className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-400 hover:text-black text-xs font-bold transition flex items-center justify-center shrink-0"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddListItem}
                className="w-full py-3.5 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-neutral-400 text-neutral-500 hover:text-black font-bold text-xs md:text-sm transition flex items-center justify-center gap-1 mt-2"
              >
                + 리스트 항목 추가
              </button>
            </div>
          )}

          {/* 4. 퀴즈형 (객관식 / 주관식 카드 추가) */}
          {selectedType === "quiz" && (
            <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full">
              {quizItems.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="bg-neutral-200/70 rounded-3xl p-5 md:p-6 flex flex-col gap-4 relative shadow-sm"
                >
                  {/* 상단 퀴즈 헤더 & 삭제 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-neutral-800">
                      {q.type === "multiple" ? "객관식 퀴즈" : "주관식 퀴즈"} #{qIdx + 1}
                    </span>
                    {quizItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuiz(q.id)}
                        className="text-xs text-neutral-400 hover:text-neutral-700 font-bold"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  {/* 질문 입력 */}
                  <input
                    type="text"
                    placeholder="문제를 입력하세요 (예: 집주인이 가장 좋아하는 음식은?)"
                    value={q.question}
                    onChange={(e) =>
                      setQuizItems((prev) =>
                        prev.map((item) =>
                          item.id === q.id
                            ? { ...item, question: e.target.value }
                            : item
                        )
                      )
                    }
                    className="w-full bg-white rounded-xl px-4 py-2.5 text-sm font-bold text-neutral-800 placeholder:text-neutral-400 outline-none shadow-sm"
                  />

                  {/* 객관식 보기 4개 */}
                  {q.type === "multiple" && (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {q.options.map((opt, optIdx) => (
                        <input
                          key={optIdx}
                          type="text"
                          placeholder={`보기 ${optIdx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...q.options];
                            newOpts[optIdx] = e.target.value;
                            setQuizItems((prev) =>
                              prev.map((item) =>
                                item.id === q.id
                                  ? { ...item, options: newOpts }
                                  : item
                              )
                            );
                          }}
                          className="bg-white/80 rounded-lg px-3 py-2 text-xs font-semibold text-neutral-700 placeholder:text-neutral-400 outline-none"
                        />
                      ))}
                    </div>
                  )}

                  {/* 주관식 정답 안내 */}
                  {q.type === "subjective" && (
                    <div className="bg-white/60 border border-white rounded-xl p-3 text-center text-xs text-neutral-400 font-medium">
                      참여자가 입력할 정답 인풋창이 상세 페이지에 표시됩니다.
                    </div>
                  )}
                </div>
              ))}

              {/* 퀴즈 추가 버튼 2종 */}
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => handleAddQuiz("multiple")}
                  className="py-3 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-neutral-400 text-neutral-600 font-bold text-xs transition"
                >
                  + 객관식 퀴즈 추가
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuiz("subjective")}
                  className="py-3 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-neutral-400 text-neutral-600 font-bold text-xs transition"
                >
                  + 주관식 퀴즈 추가
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ---------------- 하단 버튼 바 (파티 페이지와 100% 통일) ---------------- */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert("임시저장 기능 준비 중입니다.")}
              className="border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-bold px-4 py-2.5 rounded-xl transition"
            >
              저장 (0/3)
            </button>
            <button
              type="button"
              onClick={() => alert("불러올 임시저장 내역이 없습니다.")}
              className="text-blue-600 hover:underline text-xs font-bold px-1"
            >
              불러오기
            </button>
          </div>

          <button
            type="submit"
            className="bg-black hover:bg-neutral-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-md"
          >
            등록하기
          </button>
        </div>

      </form>
    </div>
  );
}