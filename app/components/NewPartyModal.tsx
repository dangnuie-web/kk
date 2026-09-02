"use client";

import React, { useState } from "react";
import { PartyItem } from "@/app/types/party";

const BG_PRESETS = [
  { id: "cream", color: "#FFFDF8", label: "크림" },
  { id: "lilac", color: "#F3E8FF", label: "라일락" },
  { id: "lemon", color: "#FEF08A", label: "레몬" },
  { id: "sky", color: "#E0F2FE", label: "스카이" },
  { id: "coral", color: "#FFE4E6", label: "코랄" },
  { id: "dark", color: "#1E293B", label: "나이트" },
];

const STICKER_PRESETS = ["🎉", "🍕", "🍷", "🎂", "🎮", "🐱", "🥂", "🏠"];

interface NewPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddParty: (party: PartyItem) => void;
}

export default function NewPartyModal({ isOpen, onClose, onAddParty }: NewPartyModalProps) {
  const [title, setTitle] = useState("");
  const [dateStr, setDateStr] = useState("26.10.15.수");
  const [desc, setDesc] = useState("");
  const [posterBg, setPosterBg] = useState(BG_PRESETS[1].color);
  const [sticker, setSticker] = useState("🎉");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("파티 제목을 입력해주세요!");
      return;
    }

    const newParty: PartyItem = {
      id: `party_${Date.now()}`,
      title: title.trim(),
      date: dateStr,
      desc: desc.trim(),
      posterBg: uploadedImage || posterBg,
      posterSticker: uploadedImage ? undefined : sticker,
      isCustomImage: !!uploadedImage,
    };

    onAddParty(newParty);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row gap-8 relative border border-neutral-200 animate-in zoom-in-95 duration-150"
      >
        {/* 좌측: 실시간 포스터 프리뷰 */}
        <div className="w-full md:w-56 flex flex-col items-center gap-2 shrink-0">
          <span className="text-xs font-black text-neutral-400">포스터 미리보기</span>
          <div
            className="w-full aspect-[3/4] rounded-2xl border border-black/10 shadow-md p-4 flex flex-col justify-between relative overflow-hidden transition-colors"
            style={{
              backgroundColor: uploadedImage ? "transparent" : posterBg,
              backgroundImage: uploadedImage ? `url(${uploadedImage})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!uploadedImage && (
              <>
                <div className="text-3xl filter drop-shadow-sm select-none">{sticker}</div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-black text-neutral-900 line-clamp-2 leading-tight">
                    {title || "파티 제목"}
                  </span>
                  <span className="text-[10px] font-bold text-neutral-600">{dateStr}</span>
                </div>
              </>
            )}
          </div>
          <span className="text-[11px] font-bold text-neutral-400 mt-1">{title || "새 파티"}</span>
        </div>

        {/* 우측: 폼 입력 & 에디터 툴 */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <h3 className="text-lg font-black text-neutral-900">새 파티 등록</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-neutral-400 hover:text-black font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* 기본 텍스트 정보 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-700">파티 이름</label>
              <input
                type="text"
                placeholder="예: 보드게임 올데이 파티"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-700">날짜</label>
              <input
                type="text"
                placeholder="예: 26.10.15.수"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-blue-500"
              />
            </div>

            {/* 포스터 스타일 설정 */}
            <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100">
              <label className="text-xs font-bold text-neutral-700">배경 색상 선택</label>
              <div className="flex items-center gap-2">
                {BG_PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset.id}
                    onClick={() => {
                      setUploadedImage(null);
                      setPosterBg(preset.color);
                    }}
                    className={`w-7 h-7 rounded-xl border-2 transition-transform ${
                      !uploadedImage && posterBg === preset.color
                        ? "border-blue-600 scale-110 shadow-sm"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: preset.color }}
                  />
                ))}
              </div>
            </div>

            {/* 스티커 선택 */}
            {!uploadedImage && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-neutral-700">아이콘 스티커</label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {STICKER_PRESETS.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSticker(s)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition ${
                        sticker === s ? "bg-neutral-200 scale-110" : "hover:bg-neutral-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 이미지 직접 업로드 */}
            <div className="flex flex-col gap-1.5 pt-1">
              <label className="text-xs font-bold text-neutral-700">또는 포스터 이미지 직접 업로드</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:text-black"
            >
              취소
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow"
            >
              파티 만들기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}