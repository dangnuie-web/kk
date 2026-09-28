"use client";

import React, { useState, useEffect, useRef } from "react";

export interface ThemeSettings {
  id?: string;
  name?: string;
  outerWallColor: string; // 외벽 배경 색상
  roofColor: string; // 지붕 배경 색상
  roofPattern?: string | null; // 지붕 패턴 이미지/식별자
  roofPatternMode?: "clip" | "repeat";
  indoorColor: string; // 집 안 배경 색상
  indoorPattern?: string | null;
  indoorPatternMode?: "clip" | "repeat";
  lineColor: string; // 선 색상
  buttonColor: string; // 버튼, 아이콘 색상
  buttonTextColor: string; // 버튼 글씨 색상
  fontFamily: string; // 글꼴 종류
  fontSize: "small" | "medium" | "large"; // 글자 크기
  fontColorType: "default" | "highlight" | "bg"; // 글자 색상 (기본, 강조, 배경)
  contrastOpacity: number; // 대비 (0~100)
}

// 1. 기본 프리셋 테마들 (현재 사이트의 실제 디자인 색상 반영)
export const DEFAULT_THEME_PRESETS: ThemeSettings[] = [
  {
    id: "default-ivory",
    name: "기본 테마 (아이보리)",
    outerWallColor: "#E8E6DF", // 현재 사이드바/외벽
    roofColor: "#F4F1EA", // 현재 상단 헤더/지붕
    indoorColor: "#FFFDF8", // 현재 하우스 본문/집 안
    lineColor: "#E0DDD5", // 현재 구분선
    buttonColor: "#171717", // 현재 검정 버튼
    buttonTextColor: "#FFFFFF", // 현재 버튼 글씨
    fontFamily: "Pretendard",
    fontSize: "medium",
    fontColorType: "default",
    contrastOpacity: 100,
  },
  {
    id: "cozy-wood",
    name: "코지 우드",
    outerWallColor: "#DED6CA",
    roofColor: "#EFE8DC",
    indoorColor: "#FAF7F0",
    lineColor: "#D5C8B8",
    buttonColor: "#3E3024",
    buttonTextColor: "#FFFFFF",
    fontFamily: "Pretendard",
    fontSize: "medium",
    fontColorType: "default",
    contrastOpacity: 90,
  },
  {
    id: "forest-green",
    name: "포레스트 그린",
    outerWallColor: "#2D4F32",
    roofColor: "#436E49",
    indoorColor: "#F0EFE6",
    lineColor: "#D2CEBE",
    buttonColor: "#2D4F32",
    buttonTextColor: "#FFFFFF",
    fontFamily: "Pretendard",
    fontSize: "medium",
    fontColorType: "default",
    contrastOpacity: 80,
  },
  {
    id: "butter-cream",
    name: "버터 크림",
    outerWallColor: "#C99757",
    roofColor: "#E0A96D",
    indoorColor: "#FFFDF7",
    lineColor: "#E8DBC5",
    buttonColor: "#4A3525",
    buttonTextColor: "#FFFDF7",
    fontFamily: "Gowun Dodum",
    fontSize: "medium",
    fontColorType: "default",
    contrastOpacity: 85,
  },
  {
    id: "soft-lavender",
    name: "소프트 라벤더",
    outerWallColor: "#735F87",
    roofColor: "#9782B3",
    indoorColor: "#FAF7FC",
    lineColor: "#E3DBEC",
    buttonColor: "#624F75",
    buttonTextColor: "#FFFFFF",
    fontFamily: "Nanum Myeongjo",
    fontSize: "medium",
    fontColorType: "default",
    contrastOpacity: 85,
  },
];

// 프리셋 패턴 SVG/CSS 생성 헬퍼
export function getPatternStyle(pattern: string | null | undefined, mode: "clip" | "repeat" = "repeat", bgColor: string = "transparent"): React.CSSProperties {
  if (!pattern) return { backgroundColor: bgColor };

  if (pattern === "check") {
    return {
      backgroundColor: bgColor,
      backgroundImage: `
        repeating-linear-gradient(45deg, rgba(0,0,0,0.06) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.06) 75%, rgba(0,0,0,0.06)),
        repeating-linear-gradient(45deg, rgba(0,0,0,0.06) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.06) 75%, rgba(0,0,0,0.06))
      `,
      backgroundPosition: "0 0, 10px 10px",
      backgroundSize: "20px 20px",
    };
  }

  if (pattern === "grid") {
    return {
      backgroundColor: bgColor,
      backgroundImage: `
        linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)
      `,
      backgroundSize: "20px 20px",
    };
  }

  if (pattern === "grass") {
    return {
      backgroundColor: bgColor,
      backgroundImage: `
        radial-gradient(rgba(0,0,0,0.12) 15%, transparent 16%),
        radial-gradient(rgba(0,0,0,0.08) 15%, transparent 16%)
      `,
      backgroundSize: "16px 16px",
      backgroundPosition: "0 0, 8px 8px",
    };
  }

  // 사용자 업로드 이미지 URL
  if (pattern.startsWith("data:") || pattern.startsWith("http") || pattern.startsWith("/")) {
    if (mode === "clip") {
      return {
        backgroundColor: bgColor,
        backgroundImage: `url(${pattern})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    } else {
      return {
        backgroundColor: bgColor,
        backgroundImage: `url(${pattern})`,
        backgroundSize: "60px 60px",
        backgroundRepeat: "repeat",
      };
    }
  }

  return { backgroundColor: bgColor };
}

// 2. 단일 색상 피커 행 컴포넌트
interface ColorRowProps {
  label: string;
  color: string;
  onChangeColor: (color: string) => void;
  showPatternButton?: boolean;
  onOpenPatternModal?: () => void;
}

function ColorRow({
  label,
  color,
  onChangeColor,
  showPatternButton = false,
  onOpenPatternModal,
}: ColorRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const nativeColorInputRef = useRef<HTMLInputElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const QUICK_PALETTE = [
    "#E8E6DF", "#F4F1EA", "#FFFDF8", "#FAF7F0",
    "#171717", "#FFFFFF", "#D9D6CB", "#E0DDD5",
    "#C76E6F", "#8D2F31", "#2D4F32", "#735F87",
  ];

  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral-200/60 relative">
      <span className="text-sm font-medium text-neutral-800">{label}</span>

      <div className="flex items-center gap-3 relative">
        {/* 패턴 직접 등록 버튼 */}
        {showPatternButton && (
          <button
            type="button"
            onClick={onOpenPatternModal}
            className="text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-3.5 py-1.5 rounded-xl border border-black/5 transition shadow-2xs"
          >
            패턴 직접 등록
          </button>
        )}

        {/* 헥스코드 & 원형 컬러 칩 버튼 */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/10 cursor-pointer hover:border-black/30 transition shadow-2xs select-none"
          style={{ backgroundColor: color }}
        >
          {/* 동그라미 색상 링 */}
          <div
            className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-xs shrink-0"
            style={{ backgroundColor: color }}
          />
          <span
            className="text-xs font-mono font-bold tracking-wider uppercase"
            style={{
              color: isLightColor(color) ? "#1A1A1A" : "#FFFFFF",
            }}
          >
            {color}
          </span>
        </div>

        {/* 색상 선택기 팝오버 */}
        {isOpen && (
          <div
            ref={popoverRef}
            className="absolute right-0 top-full mt-2 z-50 bg-white p-4 rounded-2xl shadow-xl border border-black/10 flex flex-col gap-3 w-64 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="text-xs font-bold text-neutral-700">색상 선택</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-neutral-400 hover:text-neutral-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* 네이티브 컬러 피커 트리거 & 헥스 인풋 */}
            <div className="flex items-center gap-2">
              <div
                onClick={() => nativeColorInputRef.current?.click()}
                className="w-8 h-8 rounded-xl cursor-pointer border border-black/10 shadow-xs shrink-0 flex items-center justify-center transition hover:scale-105"
                style={{ backgroundColor: color }}
                title="색상환 열기"
              >
                <span className="text-[10px] opacity-70">🎨</span>
              </div>
              <input
                ref={nativeColorInputRef}
                type="color"
                value={color.length === 7 ? color : "#000000"}
                onChange={(e) => onChangeColor(e.target.value.toUpperCase())}
                className="sr-only"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => onChangeColor(e.target.value.toUpperCase())}
                placeholder="#000000"
                className="w-full text-xs font-mono font-bold border border-neutral-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-neutral-900 uppercase"
                maxLength={7}
              />
            </div>

            {/* 추천 컬러 스와치 팔레트 */}
            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {QUICK_PALETTE.map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChangeColor(c)}
                  className={`w-7 h-7 rounded-lg border transition transform hover:scale-110 shadow-2xs ${
                    color.toUpperCase() === c ? "ring-2 ring-neutral-900 scale-105" : "border-black/10"
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 명도 계산 함수
function isLightColor(color: string) {
  const hex = color.replace("#", "");
  if (hex.length !== 6) return true;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}

// 3. 패턴 직접 등록 모달
interface PatternModalProps {
  targetLabel: "지붕" | "집 안";
  currentPattern: string | null | undefined;
  currentMode: "clip" | "repeat";
  bgColor: string;
  onClose: () => void;
  onApply: (pattern: string | null, mode: "clip" | "repeat") => void;
}

function PatternModal({
  targetLabel,
  currentPattern,
  currentMode,
  bgColor,
  onClose,
  onApply,
}: PatternModalProps) {
  const [tab, setTab] = useState<"clip" | "repeat">(currentMode || "clip");
  const [selectedPattern, setSelectedPattern] = useState<string | null>(currentPattern || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedPattern(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F5] rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center gap-6 max-w-lg w-full border border-white/60 animate-in zoom-in-95 duration-150"
      >
        <div className="w-full flex items-center justify-between border-b border-black/10 pb-3">
          <h2 className="text-base font-black text-neutral-900">
            {targetLabel} 패턴 / 이미지 등록
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-black font-bold"
          >
            ✕
          </button>
        </div>

        {/* 상단 미리보기 박스 (시안 완벽 재현) */}
        <div className="w-full bg-[#ECE7DC] p-5 rounded-2xl flex items-center justify-center">
          {targetLabel === "지붕" ? (
            /* 지붕: 가로 긴 직사각형 미리보기 */
            <div
              className="w-full h-24 rounded-xl border-2 border-dashed border-[#5582FF] flex items-center justify-center overflow-hidden transition-all"
              style={getPatternStyle(selectedPattern, tab, bgColor)}
            >
              {!selectedPattern && (
                <span className="text-xs font-bold text-neutral-400">지붕 영역 미리보기</span>
              )}
            </div>
          ) : (
            /* 집 안: 정방형 중앙 박스 + 우측 3개 타일 */
            <div className="w-full flex gap-4 items-center justify-center">
              <div
                className="w-40 h-32 rounded-xl border-2 border-dashed border-[#5582FF] flex items-center justify-center overflow-hidden transition-all"
                style={getPatternStyle(selectedPattern, tab, bgColor)}
              >
                {!selectedPattern && (
                  <span className="text-xs font-bold text-neutral-400">집 안 중앙</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-9 rounded-lg border border-black/10 overflow-hidden"
                    style={getPatternStyle(selectedPattern, tab, bgColor)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 등록 방식 탭 버튼: [ 이미지 직접 등록 ] vs [ 패턴 직접 등록 ] */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTab("clip")}
            className={`px-5 py-2 rounded-xl text-xs font-black transition ${
              tab === "clip"
                ? "bg-[#D9D6CB] text-neutral-900 shadow-xs"
                : "bg-white text-neutral-500 hover:bg-neutral-100 border border-black/5"
            }`}
          >
            이미지 직접 등록 (클리핑)
          </button>
          <button
            type="button"
            onClick={() => setTab("repeat")}
            className={`px-5 py-2 rounded-xl text-xs font-black transition ${
              tab === "repeat"
                ? "bg-[#D9D6CB] text-neutral-900 shadow-xs"
                : "bg-white text-neutral-500 hover:bg-neutral-100 border border-black/5"
            }`}
          >
            패턴 직접 등록 (반복)
          </button>
        </div>

        {/* 파일 업로드 & 프리셋 선택 */}
        <div className="w-full flex flex-col gap-3 bg-white/80 p-4 rounded-2xl border border-black/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-700">기본 프리셋 패턴:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedPattern(null)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                  selectedPattern === null ? "bg-neutral-900 text-white" : "border-neutral-200"
                }`}
              >
                없음 (단색)
              </button>
              <button
                type="button"
                onClick={() => setSelectedPattern("check")}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                  selectedPattern === "check" ? "bg-neutral-900 text-white" : "border-neutral-200"
                }`}
              >
                체크
              </button>
              <button
                type="button"
                onClick={() => setSelectedPattern("grid")}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                  selectedPattern === "grid" ? "bg-neutral-900 text-white" : "border-neutral-200"
                }`}
              >
                모눈
              </button>
              <button
                type="button"
                onClick={() => setSelectedPattern("grass")}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                  selectedPattern === "grass" ? "bg-neutral-900 text-white" : "border-neutral-200"
                }`}
              >
                잔디
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
            <span className="text-xs font-bold text-neutral-700">내 이미지 파일:</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-black bg-neutral-900 text-white px-4 py-1.5 rounded-xl hover:bg-neutral-800 transition"
            >
              파일 선택
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* 적용 버튼 */}
        <button
          type="button"
          onClick={() => {
            onApply(selectedPattern, tab);
            onClose();
          }}
          className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-2.5 rounded-full text-xs font-black transition shadow-sm"
        >
          저장
        </button>
      </div>
    </div>
  );
}

// 4. 메인 테마 탭 컴포넌트
export default function ThemeTab() {
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME_PRESETS[0]);
  const [customPresets, setCustomPresets] = useState<ThemeSettings[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("default-ivory");

  // 패턴 모달 상태
  const [patternModalTarget, setPatternModalTarget] = useState<"roof" | "indoor" | null>(null);

  // 사용자 테마 저장 모달/인풋 상태
  const [showSaveThemeModal, setShowSaveThemeModal] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");

  // 초기 로드: 저장된 테마 불러오기
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("house_theme_dang");
      if (savedTheme) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate saved theme from localStorage after mount
        setTheme(JSON.parse(savedTheme));
      }

      const savedCustomPresets = localStorage.getItem("custom_themes");
      if (savedCustomPresets) {
        setCustomPresets(JSON.parse(savedCustomPresets));
      }
    } catch {
      // ignore
    }
  }, []);

  // 프리셋 선택 핸들러
  const handleSelectPreset = (presetId: string) => {
    if (presetId === "__NEW_THEME__") {
      setShowSaveThemeModal(true);
      return;
    }

    setSelectedPresetId(presetId);
    const allPresets = [...DEFAULT_THEME_PRESETS, ...customPresets];
    const found = allPresets.find((p) => p.id === presetId);
    if (found) {
      setTheme({ ...found });
    }
  };

  // 사용자 테마 이름 저장 핸들러
  const handleSaveNewCustomTheme = () => {
    if (!newThemeName.trim()) {
      alert("테마 이름을 입력해 주세요.");
      return;
    }

    const newCustom: ThemeSettings = {
      ...theme,
      id: `custom-${Date.now()}`,
      name: newThemeName.trim(),
    };

    const updated = [...customPresets, newCustom];
    setCustomPresets(updated);
    localStorage.setItem("custom_themes", JSON.stringify(updated));
    setSelectedPresetId(newCustom.id!);
    setShowSaveThemeModal(false);
    setNewThemeName("");
    alert(`'${newCustom.name}' 테마가 저장되었습니다!`);
  };

  // 최종 저장: 하우스 전체 적용
  const handleApplyTheme = () => {
    try {
      localStorage.setItem("house_theme_dang", JSON.stringify(theme));
      window.dispatchEvent(new Event("house_theme_updated"));
      alert("테마가 성공적으로 저장되었습니다!");
    } catch {
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const allPresets = [...DEFAULT_THEME_PRESETS, ...customPresets];

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-8 pb-16 font-sans">
      {/* 1. 상단 미니 하우스 실시간 미리보기 다이어그램 (시안 구조 완벽 일치) */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <div className="w-64 h-36 rounded-2xl overflow-hidden shadow-md flex border border-black/10 transition-all">
          {/* 좌측: 외벽 영역 */}
          <div
            className="w-20 h-full transition-colors duration-200 shrink-0"
            style={{ backgroundColor: theme.outerWallColor }}
            title="외벽"
          />

          {/* 우측 2단: 지붕(상단) & 집 안(하단) */}
          <div className="flex-1 h-full flex flex-col">
            {/* 우측 상단: 지붕 */}
            <div
              className="w-full h-12 transition-all duration-200 border-b"
              style={{
                borderColor: theme.lineColor,
                ...getPatternStyle(theme.roofPattern, theme.roofPatternMode, theme.roofColor),
              }}
              title="지붕"
            />
            {/* 우측 하단: 집 안 */}
            <div
              className="w-full flex-1 transition-all duration-200 flex items-center justify-center p-2"
              style={getPatternStyle(theme.indoorPattern, theme.indoorPatternMode, theme.indoorColor)}
              title="집 안"
            >
              {/* 버튼/텍스트 실시간 미리보기 샘플 */}
              <div
                className="px-3 py-1 rounded-lg text-[10px] font-bold shadow-xs transition-all"
                style={{
                  backgroundColor: theme.buttonColor,
                  color: theme.buttonTextColor,
                }}
              >
                버튼
              </div>
            </div>
          </div>
        </div>

        {/* 2. 프리셋 테마 선택 드롭다운 */}
        <div className="w-full flex justify-end pt-2">
          <select
            value={selectedPresetId}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-transparent border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-800 outline-none focus:border-neutral-900 cursor-pointer shadow-2xs"
          >
            {allPresets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            <option disabled>──────────</option>
            <option value="__NEW_THEME__">+ 사용자 테마 저장</option>
          </select>
        </div>
      </div>

      {/* 3. 테마 상세 설정 리스트 */}
      <div className="w-full flex flex-col gap-1">
        {/* 외벽 배경 색상 */}
        <ColorRow
          label="외벽 배경 색상"
          color={theme.outerWallColor}
          onChangeColor={(color) => setTheme((prev) => ({ ...prev, outerWallColor: color }))}
        />

        {/* 지붕 배경 색상 + 패턴 직접 등록 */}
        <ColorRow
          label="지붕 배경 색상"
          color={theme.roofColor}
          onChangeColor={(color) => setTheme((prev) => ({ ...prev, roofColor: color }))}
          showPatternButton={true}
          onOpenPatternModal={() => setPatternModalTarget("roof")}
        />

        {/* 집 안 배경 색상 + 패턴 직접 등록 */}
        <ColorRow
          label="집 안 배경 색상"
          color={theme.indoorColor}
          onChangeColor={(color) => setTheme((prev) => ({ ...prev, indoorColor: color }))}
          showPatternButton={true}
          onOpenPatternModal={() => setPatternModalTarget("indoor")}
        />

        {/* 선 색상 */}
        <ColorRow
          label="선 색상"
          color={theme.lineColor}
          onChangeColor={(color) => setTheme((prev) => ({ ...prev, lineColor: color }))}
        />

        {/* 버튼, 아이콘 색상 */}
        <ColorRow
          label="버튼, 아이콘 색상"
          color={theme.buttonColor}
          onChangeColor={(color) => setTheme((prev) => ({ ...prev, buttonColor: color }))}
        />

        {/* 버튼 글씨 색상 */}
        <ColorRow
          label="버튼 글씨 색상"
          color={theme.buttonTextColor}
          onChangeColor={(color) => setTheme((prev) => ({ ...prev, buttonTextColor: color }))}
        />

        {/* 글꼴 종류 */}
        <div className="flex items-center justify-between py-2 border-b border-neutral-200/60">
          <span className="text-sm font-medium text-neutral-800">글꼴 종류</span>
          <select
            value={theme.fontFamily}
            onChange={(e) => setTheme((prev) => ({ ...prev, fontFamily: e.target.value }))}
            className="bg-transparent border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-800 outline-none focus:border-neutral-900 cursor-pointer shadow-2xs"
          >
            <option value="시스템 기본값">시스템 기본값</option>
            <option value="Pretendard">Pretendard (프리텐다드)</option>
            <option value="Gowun Dodum">고운돋움 (Gowun Dodum)</option>
            <option value="Gowun Batang">고운바탕 (Gowun Batang)</option>
            <option value="Nanum Myeongjo">나눔명조 (Nanum Myeongjo)</option>
            <option value="Gaegu">개구체 (손글씨)</option>
          </select>
        </div>

        {/* 글자 크기 */}
        <div className="flex items-center justify-between py-2 border-b border-neutral-200/60">
          <span className="text-sm font-medium text-neutral-800">글자 크기</span>
          <select
            value={theme.fontSize}
            onChange={(e) => setTheme((prev) => ({ ...prev, fontSize: e.target.value as ThemeSettings["fontSize"] }))}
            className="bg-transparent border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-800 outline-none focus:border-neutral-900 cursor-pointer shadow-2xs"
          >
            <option value="small">작게</option>
            <option value="medium">보통</option>
            <option value="large">크게</option>
          </select>
        </div>

        {/* 글자 색상 (3가지 Aa 칩) */}
        <div className="flex items-center justify-between py-2 border-b border-neutral-200/60">
          <span className="text-sm font-medium text-neutral-800">글자 색상</span>
          <div className="flex items-center gap-2">
            {/* 1. 기본 글씨 */}
            <button
              type="button"
              onClick={() => setTheme((prev) => ({ ...prev, fontColorType: "default" }))}
              className={`w-9 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition shadow-2xs ${
                theme.fontColorType === "default"
                  ? "border-2 border-neutral-900 bg-white text-neutral-900"
                  : "border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50"
              }`}
              title="기본 글씨"
            >
              Aa
            </button>
            {/* 2. 강조색 (빨간 포인트) */}
            <button
              type="button"
              onClick={() => setTheme((prev) => ({ ...prev, fontColorType: "highlight" }))}
              className={`w-9 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition shadow-2xs ${
                theme.fontColorType === "highlight"
                  ? "border-2 border-neutral-900 bg-white text-red-500 font-black"
                  : "border border-neutral-200 bg-white text-red-400 hover:bg-neutral-50"
              }`}
              title="강조색"
            >
              Aa
            </button>
            {/* 3. 글씨 배경색 (하이라이트 배경) */}
            <button
              type="button"
              onClick={() => setTheme((prev) => ({ ...prev, fontColorType: "bg" }))}
              className={`w-9 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition shadow-2xs ${
                theme.fontColorType === "bg"
                  ? "border-2 border-neutral-900 bg-neutral-200 text-neutral-900"
                  : "border border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
              title="글씨 배경색"
            >
              Aa
            </button>
          </div>
        </div>

        {/* 대비 슬라이더 (0~100) */}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm font-medium text-neutral-800">대비</span>
          <div className="flex items-center gap-4 w-52">
            <input
              type="range"
              min={0}
              max={100}
              value={theme.contrastOpacity}
              onChange={(e) => setTheme((prev) => ({ ...prev, contrastOpacity: Number(e.target.value) }))}
              className="w-full accent-neutral-900 cursor-pointer h-1.5 bg-neutral-200 rounded-lg appearance-none"
            />
            <span className="text-xs font-mono font-bold text-neutral-700 w-8 text-right shrink-0">
              {theme.contrastOpacity}
            </span>
          </div>
        </div>
      </div>

      {/* 하단 최종 [ 저장 ] 버튼 */}
      <div className="pt-4">
        <button
          type="button"
          onClick={handleApplyTheme}
          className="bg-neutral-900 hover:bg-neutral-800 text-white px-9 py-2.5 rounded-full text-xs md:text-sm font-black transition shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
        >
          저장
        </button>
      </div>

      {/* 지붕 / 집 안 패턴 등록 모달 */}
      {patternModalTarget && (
        <PatternModal
          targetLabel={patternModalTarget === "roof" ? "지붕" : "집 안"}
          currentPattern={patternModalTarget === "roof" ? theme.roofPattern : theme.indoorPattern}
          currentMode={patternModalTarget === "roof" ? (theme.roofPatternMode || "clip") : (theme.indoorPatternMode || "clip")}
          bgColor={patternModalTarget === "roof" ? theme.roofColor : theme.indoorColor}
          onClose={() => setPatternModalTarget(null)}
          onApply={(newPattern, newMode) => {
            if (patternModalTarget === "roof") {
              setTheme((prev) => ({ ...prev, roofPattern: newPattern, roofPatternMode: newMode }));
            } else {
              setTheme((prev) => ({ ...prev, indoorPattern: newPattern, indoorPatternMode: newMode }));
            }
          }}
        />
      )}

      {/* 사용자 테마 이름 입력 모달 */}
      {showSaveThemeModal && (
        <div
          onClick={() => setShowSaveThemeModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-w-sm w-full border border-white/60 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-2">
              <h3 className="text-sm font-black text-neutral-900">사용자 테마 저장</h3>
              <button
                type="button"
                onClick={() => setShowSaveThemeModal(false)}
                className="text-xs text-neutral-400 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600">
              현재 설정한 색상 조합을 저장할 이름을 입력해 주세요.
            </p>

            <input
              type="text"
              value={newThemeName}
              onChange={(e) => setNewThemeName(e.target.value)}
              placeholder="예: 내 감성 하우스, 봄날의 정원"
              className="w-full text-xs font-bold border border-neutral-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-neutral-900 bg-white"
              maxLength={15}
              autoFocus
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveThemeModal(false)}
                className="text-xs font-bold text-neutral-500 hover:bg-black/5 px-4 py-2 rounded-xl transition"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveNewCustomTheme}
                className="text-xs font-black bg-neutral-900 text-white hover:bg-neutral-800 px-5 py-2 rounded-xl transition shadow-xs"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
