"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

interface PosterItem {
  id: string;
  type: "text" | "emoji" | "image";
  content: string; // 텍스트 내용, 이모지 문자, 또는 이미지 DataURL
  x: number;
  y: number;
  scale: number;
  rotation: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
}

interface SavedPosterSlot {
  slotId: number;
  savedAt: string;
  previewUrl: string;
  bgColor: string;
  items: PosterItem[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (dataUrl: string) => void;
  defaultTitle?: string;
  defaultDate?: string;
}

const BG_PALETTE = [
  "#FFFDF8", "#FEF08A", "#D4E8FE", "#F3E8FF", 
  "#E6F4EA", "#FFE4E6", "#FED7AA", "#1E293B"
];

const EMOJI_LIST = ["🎉", "🍕", "🍷", "🎂", "🎮", "🐱", "🥂", "🏠", "✨", "💿", "🥐", "🎈", "🍰", "💌", "🎸", "🍹"];

const FONTS = [
  { name: "기본 고딕", value: "sans-serif" },
  { name: "세리프 명조", value: "serif" },
  { name: "타자기 (Monospace)", value: "monospace" },
  { name: "Impact", value: "Impact" },
  { name: "Comic Sans", value: "Comic Sans MS" },
];

export default function PosterEditorModal({
  isOpen,
  onClose,
  onComplete,
  defaultTitle = "HOUSEWARMING PARTY",
  defaultDate = "26.10.15.수",
}: Props) {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);

  // 캔버스 상태
  const [bgColor, setBgColor] = useState("#FFFDF8");
  const [items, setItems] = useState<PosterItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 포스터 저장 슬롯 (최대 3개)
  const [savedSlots, setSavedSlots] = useState<SavedPosterSlot[]>([]);
  const [showSlotModal, setShowSlotModal] = useState(false);

  // 드래그 & 회전 & 스케일 트래킹
  const isDraggingRef = useRef(false);
  const dragModeRef = useRef<"move" | "resize" | "rotate" | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const originalItemState = useRef<PosterItem | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("saved_poster_templates");
      if (saved) setSavedSlots(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 기본 아이템 세팅
  useEffect(() => {
    if (!isOpen) return;
    setItems([
      {
        id: "default-sticker",
        type: "emoji",
        content: "🚪",
        x: 190,
        y: 150,
        scale: 1,
        rotation: 0,
        fontSize: 70,
      },
      {
        id: "default-title",
        type: "text",
        content: defaultTitle || "HOUSEWARMING",
        x: 190,
        y: 280,
        scale: 1,
        rotation: 0,
        fontSize: 26,
        fontWeight: "bold",
        fontFamily: "sans-serif",
        color: "#1E293B",
      },
      {
        id: "default-date",
        type: "text",
        content: defaultDate || "26.10.15.수",
        x: 190,
        y: 450,
        scale: 1,
        rotation: 0,
        fontSize: 16,
        fontWeight: "normal",
        fontFamily: "sans-serif",
        color: "#64748B",
      },
    ]);
    setSelectedId("default-title");
  }, [isOpen, defaultTitle, defaultDate]);

  // 캔버스 드로잉 엔진
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 380;
    const h = Math.round(380 * 1.414);
    canvas.width = w;
    canvas.height = h;

    // 1. 배경
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    // 2. 테두리
    ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, w - 32, h - 32);

    // 3. 아이템 렌더링
    items.forEach((item) => {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate((item.rotation * Math.PI) / 180);
      ctx.scale(item.scale, item.scale);

      if (item.type === "text") {
        ctx.font = `${item.fontWeight || "normal"} ${item.fontSize || 20}px ${item.fontFamily || "sans-serif"}`;
        ctx.fillStyle = item.color || "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.content, 0, 0);
      } else if (item.type === "emoji") {
        ctx.font = `${item.fontSize || 50}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.content, 0, 0);
      } else if (item.type === "image") {
        const img = new Image();
        img.src = item.content;
        if (img.complete) {
          ctx.drawImage(img, -60, -60, 120, 120);
        }
      }

      // 선택 표시 (바운딩 박스 & 리사이즈/회전 핀)
      if (item.id === selectedId) {
        ctx.strokeStyle = "#3D7BF6";
        ctx.lineWidth = 1.5;
        const boxSize = (item.fontSize || 60) * 1.3;
        ctx.strokeRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize);

        // 회전 핸들
        ctx.fillStyle = "#3D7BF6";
        ctx.beginPath();
        ctx.arc(0, -boxSize / 2 - 16, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#3D7BF6";
        ctx.beginPath();
        ctx.moveTo(0, -boxSize / 2);
        ctx.lineTo(0, -boxSize / 2 - 10);
        ctx.stroke();

        // 크기 조절 핸들
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#3D7BF6";
        ctx.lineWidth = 2;
        ctx.fillRect(boxSize / 2 - 5, boxSize / 2 - 5, 10, 10);
        ctx.strokeRect(boxSize / 2 - 5, boxSize / 2 - 5, 10, 10);
      }

      ctx.restore();
    });
  }, [bgColor, items, selectedId]);

  useEffect(() => {
    if (isOpen) renderCanvas();
  }, [isOpen, renderCanvas]);

  // 마우스 인터랙션 (선택, 이동, 회전, 크기 조절)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = [...items].reverse().find((item) => {
      const dist = Math.hypot(item.x - x, item.y - y);
      return dist < (item.fontSize || 60) * item.scale;
    });

    if (clicked) {
      setSelectedId(clicked.id);
      isDraggingRef.current = true;
      dragModeRef.current = "move";
      dragStartPos.current = { x, y };
      originalItemState.current = { ...clicked };
    } else {
      setSelectedId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !selectedId || !originalItemState.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const dx = currentX - dragStartPos.current.x;
    const dy = currentY - dragStartPos.current.y;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== selectedId) return item;
        return {
          ...item,
          x: originalItemState.current!.x + dx,
          y: originalItemState.current!.y + dy,
        };
      })
    );
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    dragModeRef.current = null;
  };

  // 텍스트 속성 조절
  const updateSelectedItem = (patch: Partial<PosterItem>) => {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((it) => (it.id === selectedId ? { ...it, ...patch } : it))
    );
  };

  const selectedItem = items.find((i) => i.id === selectedId);

  // 스티커 추가
  const addEmojiSticker = (emoji: string) => {
    const newItem: PosterItem = {
      id: `sticker_${Date.now()}`,
      type: "emoji",
      content: emoji,
      x: 190,
      y: 250,
      scale: 1,
      rotation: 0,
      fontSize: 55,
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedId(newItem.id);
  };

  // 새 텍스트 추가
  const addText = () => {
    const newItem: PosterItem = {
      id: `text_${Date.now()}`,
      type: "text",
      content: "새 문구 입력",
      x: 190,
      y: 250,
      scale: 1,
      rotation: 0,
      fontSize: 22,
      fontWeight: "bold",
      fontFamily: "sans-serif",
      color: "#1E293B",
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedId(newItem.id);
  };

  // 이미지 스티커 업로드
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const newItem: PosterItem = {
        id: `img_${Date.now()}`,
        type: "image",
        content: dataUrl,
        x: 190,
        y: 250,
        scale: 1,
        rotation: 0,
      };
      setItems((prev) => [...prev, newItem]);
      setSelectedId(newItem.id);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // 포스터 슬롯 임시저장 (최대 3개)
  const handleSavePosterSlot = () => {
    if (!canvasRef.current) return;
    if (savedSlots.length >= 3) {
      alert("포스터는 최대 3개까지만 보관할 수 있습니다. 기존 포스터를 덮어씌워 주세요.");
      setShowSlotModal(true);
      return;
    }

    const previewUrl = canvasRef.current.toDataURL("image/jpeg", 0.6);
    const newSlot: SavedPosterSlot = {
      slotId: Date.now(),
      savedAt: new Date().toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      previewUrl,
      bgColor,
      items: JSON.parse(JSON.stringify(items)),
    };

    const updated = [newSlot, ...savedSlots];
    setSavedSlots(updated);
    localStorage.setItem("saved_poster_templates", JSON.stringify(updated));
    alert(`포스터가 보관함에 저장되었습니다! (${updated.length}/3)`);
  };

  const handleLoadPosterSlot = (slot: SavedPosterSlot) => {
    setBgColor(slot.bgColor);
    setItems(slot.items);
    setSelectedId(null);
    setShowSlotModal(false);
  };

  const handleDeleteSlot = (slotId: number) => {
    const updated = savedSlots.filter((s) => s.slotId !== slotId);
    setSavedSlots(updated);
    localStorage.setItem("saved_poster_templates", JSON.stringify(updated));
  };

  // 최종 추출
  const handleApply = () => {
    if (!canvasRef.current) return;
    setSelectedId(null);
    setTimeout(() => {
      if (!canvasRef.current) return;
      const finalUrl = canvasRef.current.toDataURL("image/jpeg", 0.95);
      onComplete(finalUrl);
      onClose();
    }, 50);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] bg-neutral-900/85 backdrop-blur-md flex flex-col justify-between p-3 md:p-6 animate-in fade-in duration-150">
      
      {/* 1. 상단 내비게이션 바 */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between bg-white/95 px-6 py-3 rounded-2xl shadow-lg border border-black/5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎨</span>
          <h2 className="text-sm md:text-base font-black text-neutral-900">
            Knock Knock 파티 포스터 스튜디오
          </h2>
          <span className="text-xs text-neutral-400 font-bold hidden sm:inline">
            · 마우스 드래그로 요소를 이동하세요
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSavePosterSlot}
            className="border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-bold px-3 py-2 rounded-xl transition"
          >
            💾 포스터 저장 ({savedSlots.length}/3)
          </button>
          {savedSlots.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSlotModal(true)}
              className="bg-neutral-100 hover:bg-neutral-200 text-blue-600 text-xs font-black px-3 py-2 rounded-xl transition"
            >
              불러오기
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-100"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="bg-[#3D7BF6] hover:bg-blue-600 text-white font-black text-xs px-5 py-2 rounded-xl transition shadow-md"
          >
            ✓ 이 포스터 적용하기
          </button>
        </div>
      </div>

      {/* 2. 에디터 캔버스 & 툴바 본체 */}
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col md:flex-row gap-5 my-3 overflow-hidden items-center justify-center">
        
        {/* 중앙: 포스터 캔버스 작업대 */}
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center relative bg-neutral-800/40 rounded-3xl p-4 overflow-hidden border border-white/10 shadow-inner">
          <div className="shadow-2xl rounded-2xl overflow-hidden border border-black/20 bg-white">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="cursor-move"
            />
          </div>

          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs font-bold text-neutral-200 pointer-events-none">
            <span className="bg-black/60 px-3 py-1 rounded-lg">포스터 규격 1 : 1.414</span>
            {selectedId && (
              <button
                type="button"
                onClick={() => {
                  setItems((prev) => prev.filter((it) => it.id !== selectedId));
                  setSelectedId(null);
                }}
                className="pointer-events-auto bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg font-bold shadow"
              >
                선택 요소 삭제
              </button>
            )}
          </div>
        </div>

        {/* 우측: 속성 & 꾸미기 패널 */}
        <div className="w-full md:w-80 shrink-0 h-full flex flex-col gap-3 overflow-y-auto pr-1">
          
          {/* 선택 요소 실시간 텍스트 서식 편집 */}
          {selectedItem && selectedItem.type === "text" && (
            <div className="bg-white p-4 rounded-2xl border border-blue-400 shadow-md flex flex-col gap-2.5">
              <span className="text-xs font-black text-blue-600">✏️ 텍스트 수정 및 서식</span>
              
              <input
                type="text"
                value={selectedItem.content}
                onChange={(e) => updateSelectedItem({ content: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none"
              />

              <div className="flex items-center gap-2">
                <select
                  value={selectedItem.fontFamily || "sans-serif"}
                  onChange={(e) => updateSelectedItem({ fontFamily: e.target.value })}
                  className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-2 py-1 text-xs font-bold"
                >
                  {FONTS.map((f) => (
                    <option key={f.value} value={f.value}>{f.name}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => updateSelectedItem({ fontWeight: selectedItem.fontWeight === "bold" ? "normal" : "bold" })}
                  className={`w-8 h-8 rounded-xl font-black text-xs border ${
                    selectedItem.fontWeight === "bold" ? "bg-black text-white" : "bg-white text-neutral-700"
                  }`}
                >
                  B
                </button>

                <input
                  type="color"
                  value={selectedItem.color || "#000000"}
                  onChange={(e) => updateSelectedItem({ color: e.target.value })}
                  className="w-8 h-8 rounded-xl cursor-pointer bg-white border p-0.5"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] text-neutral-400 font-bold">크기</span>
                <input
                  type="range"
                  min={12}
                  max={60}
                  value={selectedItem.fontSize || 24}
                  onChange={(e) => updateSelectedItem({ fontSize: Number(e.target.value) })}
                  className="flex-1 cursor-pointer"
                />
                <span className="text-xs font-bold text-neutral-600 w-5">{selectedItem.fontSize}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-400 font-bold">회전</span>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={selectedItem.rotation || 0}
                  onChange={(e) => updateSelectedItem({ rotation: Number(e.target.value) })}
                  className="flex-1 cursor-pointer"
                />
                <span className="text-xs font-bold text-neutral-600 w-5">{selectedItem.rotation}°</span>
              </div>
            </div>
          )}

          {/* 추가 툴 */}
          <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm flex flex-col gap-2">
            <span className="text-xs font-black text-neutral-800">➕ 추가하기</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={addText}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold py-2 rounded-xl"
              >
                + 문구 추가
              </button>
              <button
                type="button"
                onClick={() => imageUploadRef.current?.click()}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold py-2 rounded-xl"
              >
                + 사진 스티커
              </button>
            </div>
            <input ref={imageUploadRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          {/* 스티커 팔레트 */}
          <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm flex flex-col gap-2">
            <span className="text-xs font-black text-neutral-800">✨ 데코 스티커</span>
            <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {EMOJI_LIST.map((em) => (
                <button
                  type="button"
                  key={em}
                  onClick={() => addEmojiSticker(em)}
                  className="h-9 bg-neutral-50 hover:bg-neutral-100 rounded-xl flex items-center justify-center text-lg border border-black/5 transition hover:scale-110"
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* 배경 컬러 테마 */}
          <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm flex flex-col gap-2">
            <span className="text-xs font-black text-neutral-800">🎨 배경 테마 컬러</span>
            <div className="grid grid-cols-4 gap-2">
              {BG_PALETTE.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setBgColor(c)}
                  className={`h-7 rounded-xl border-2 transition ${
                    bgColor === c ? "border-blue-600 scale-105 shadow" : "border-black/10"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 3. 포스터 3개 보관함 불러오기 모달 */}
      {showSlotModal && (
        <div
          onClick={() => setShowSlotModal(false)}
          className="fixed inset-0 z-[9999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-base font-black text-neutral-900">저장된 포스터 보관함 ({savedSlots.length}/3)</h3>
              <button onClick={() => setShowSlotModal(false)} className="text-sm font-bold text-neutral-400">✕</button>
            </div>

            <div className="flex flex-col gap-3">
              {savedSlots.map((slot, idx) => (
                <div key={slot.slotId} className="flex items-center justify-between bg-neutral-50 p-2.5 rounded-2xl border">
                  <div
                    onClick={() => handleLoadPosterSlot(slot)}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={slot.previewUrl} alt="미리보기" className="w-12 h-16 object-cover rounded-lg border shadow-sm" />
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-neutral-800">슬롯 {idx + 1}</span>
                      <span className="text-[10px] font-bold text-neutral-400">{slot.savedAt}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(slot.slotId)}
                    className="text-xs text-red-500 hover:text-red-700 font-bold px-2"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}