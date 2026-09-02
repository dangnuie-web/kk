"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";

const getFormattedToday = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${yy}.${mm}.${dd}.${days[now.getDay()]}`;
};

// 기본 제공 프레임 템플릿 색상/패턴
const BASIC_TEMPLATES = [
  { id: "blue_stripe", name: "블루 스트라이프", color: "#BEE3F8", border: "border-sky-300" },
  { id: "pink_pastel", name: "핑크 파스텔", color: "#FED7D7", border: "border-pink-300" },
  { id: "yellow_day", name: "토스트 옐로우", color: "#FEEBC8", border: "border-amber-300" },
  { id: "green_mint", name: "민트 그린", color: "#C6F6D5", border: "border-emerald-300" },
  { id: "dark_classic", name: "클래식 블랙", color: "#2D3748", border: "border-neutral-700" },
];

export default function NewGalleryPage() {
  const params = useParams();
  const userId = (params?.userId as string) || "dang";
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [frameType, setFrameType] = useState<"3cut" | "4cut">("3cut");
  const [selectedTemplate, setSelectedTemplate] = useState(BASIC_TEMPLATES[0]);

  // 각 컷별 사진 저장 (3컷 or 4컷)
  const [photos, setPhotos] = useState<string[]>([]);

  // 특정 컷 사진 업로드 핸들러
  const handlePhotoUpload = (slotIndex: number, file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPhotos((prev) => {
        const next = [...prev];
        next[slotIndex] = result;
        return next;
      });
    };
  };

  // 등록 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("제목을 입력해 주세요.");
      return;
    }

    try {
      const storageKey = `gallery_${userId}`;
      const prev = localStorage.getItem(storageKey);
      const parsed = prev ? JSON.parse(prev) : [];

      const newGalleryItem = {
        id: Date.now(),
        title,
        date: getFormattedToday(),
        frameType,
        frameColor: selectedTemplate.color,
        photos,
      };

      localStorage.setItem(storageKey, JSON.stringify([newGalleryItem, ...parsed]));
      alert("네컷 사진이 성공적으로 등록되었습니다!");
      router.push(`/house/${userId}/gallery`);
    } catch (err) {
      console.error(err);
      alert("용량 초과 또는 저장 오류가 발생했습니다.");
    }
  };

  const slotCount = frameType === "4cut" ? 4 : 3;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-sm border border-neutral-200/60 max-w-5xl mx-auto w-full min-h-[640px] flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-10 items-start flex-1">
        
        {/* 좌측: 실시간 네컷/세컷 스트립 프레임 미리보기 & 개별 사진 업로드 */}
        <div className="w-full md:w-[320px] flex justify-center shrink-0">
          <div
            className="w-[240px] p-4 rounded-2xl shadow-xl flex flex-col justify-between gap-3 transition-colors duration-300 border-2"
            style={{ backgroundColor: selectedTemplate.color }}
          >
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: slotCount }).map((_, idx) => (
                <label
                  key={idx}
                  className="w-full aspect-[4/3] bg-white/80 hover:bg-white rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative border border-dashed border-black/20 group transition"
                >
                  {photos[idx] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photos[idx]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-400 group-hover:text-black">
                      <span className="text-2xl font-black">+</span>
                      <span className="text-[10px] font-bold">사진 {idx + 1}</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(idx, file);
                    }}
                  />
                </label>
              ))}
            </div>

            {/* 하단 스트립 타이틀 */}
            <div className="text-center pt-2 border-t border-black/10">
              <p className="text-xs font-black text-neutral-800 tracking-wider truncate">
                {title || "TITLE HERE"}
              </p>
              <span className="text-[9px] text-neutral-500 font-bold">{getFormattedToday()}</span>
            </div>
          </div>
        </div>

        {/* 우측: 제목, 프레임 종류, Basic 템플릿, 저장된 프레임 선택 */}
        <div className="flex-1 w-full flex flex-col justify-between h-full gap-8">
          <div className="flex flex-col gap-6">
            {/* 1. 제목 입력 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-neutral-400 font-bold">
                <span>작성일자</span>
                <span>{getFormattedToday()}</span>
              </div>
              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl md:text-3xl font-black text-neutral-900 placeholder:text-neutral-300 outline-none border-b border-neutral-200 pb-2"
              />
            </div>

            {/* 2. 프레임 선택 (4컷 vs 3컷) */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-black text-neutral-700">프레임 선택</span>
              <div className="flex items-center gap-4">
                {/* 4컷 선택 버튼 */}
                <button
                  type="button"
                  onClick={() => setFrameType("4cut")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                    frameType === "4cut" ? "border-blue-500 bg-blue-50/50 shadow-sm" : "border-neutral-200 bg-white"
                  }`}
                >
                  <div className="w-10 h-16 bg-neutral-200 rounded p-1 flex flex-col justify-between gap-0.5">
                    <div className="bg-white flex-1 rounded-sm" />
                    <div className="bg-white flex-1 rounded-sm" />
                    <div className="bg-white flex-1 rounded-sm" />
                    <div className="bg-white flex-1 rounded-sm" />
                  </div>
                  <span className="text-xs font-bold text-neutral-700">4 컷</span>
                </button>

                {/* 3컷 선택 버튼 */}
                <button
                  type="button"
                  onClick={() => setFrameType("3cut")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                    frameType === "3cut" ? "border-blue-500 bg-blue-50/50 shadow-sm" : "border-neutral-200 bg-white"
                  }`}
                >
                  <div className="w-10 h-16 bg-neutral-200 rounded p-1 flex flex-col justify-between gap-1">
                    <div className="bg-white flex-1 rounded-sm" />
                    <div className="bg-white flex-1 rounded-sm" />
                    <div className="bg-white flex-1 rounded-sm" />
                  </div>
                  <span className="text-xs font-bold text-neutral-700">3 컷</span>
                </button>
              </div>
            </div>

            {/* 3. Basic 프레임 템플릿 선택 */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-black text-neutral-700">Basic 프레임 템플릿</span>
              <div className="grid grid-cols-5 gap-2.5">
                {BASIC_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tmpl)}
                    className={`aspect-square rounded-xl border-2 transition-transform hover:scale-105 flex flex-col items-center justify-center p-1 ${
                      selectedTemplate.id === tmpl.id ? "border-blue-600 shadow-md scale-105" : "border-neutral-200"
                    }`}
                    style={{ backgroundColor: tmpl.color }}
                  >
                    <span className="text-[10px] font-black text-black/60 truncate w-full text-center">
                      {tmpl.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. 저장 목록에서 가져오기 (커스텀 프레임 슬롯) */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-black text-neutral-700">저장 목록에서 가져오기</span>
              <div className="grid grid-cols-5 gap-2.5">
                {[1, 2, 3, 4, 5].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => alert(`저장된 ${slot}번 프레임 불러오기 준비 중`)}
                    className="aspect-square bg-neutral-200/80 hover:bg-neutral-200 rounded-xl flex items-center justify-center text-neutral-500 font-black text-lg transition"
                  >
                    +
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 하단 버튼 바 */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert("프레임 저장 완료 (0/3)")}
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
              className="bg-black hover:bg-neutral-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-md"
            >
              등록하기
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}