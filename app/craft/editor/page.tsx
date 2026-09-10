"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import InvitationCoverPreview from "@/app/components/craft/InvitationCoverPreview";
import InvitationBodyPreview from "@/app/components/craft/InvitationBodyPreview";
import { CraftInvitationTemplate } from "@/types/craft";

export default function CraftEditorPage() {
  const router = useRouter();

  // 1. 에셋 데이터 상태 모델
  const [templateTitle, setTemplateTitle] = useState("나만의 초대장 템플릿");
  const [coverImage, setCoverImage] = useState<string | null>("/icons/pot.png");
  const [paperBgColor, setPaperBgColor] = useState("#f3e9e0");
  const [paperBgImage, setPaperBgImage] = useState<string | null>(null);

  // 내용 카드 프레임 (기본 라운딩 vs 3피스 슬라이스)
  const [frameType, setFrameType] = useState<"rounded" | "sliced">("rounded");
  const [frameBgColor, setFrameBgColor] = useState("#ffffffa0");
  const [sliceTop, setSliceTop] = useState<string | null>(null);
  const [sliceBody, setSliceBody] = useState<string | null>(null);
  const [sliceBottom, setSliceBottom] = useState<string | null>(null);

  // 커스텀 불릿
  const [customBullet, setCustomBullet] = useState<string | null>("/icons/pot.png");

  // 폰트 & 폰트/선 색
  const [fontFamily, setFontFamily] = useState("Paperlogy");
  const [fontColor, setFontColor] = useState("#87451E");

  // 하단 배너 (148*50)
  const [footerImage, setFooterImage] = useState<string | null>(null);

  // 파일 업로드 Refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const sliceTopRef = useRef<HTMLInputElement>(null);
  const sliceBodyRef = useRef<HTMLInputElement>(null);
  const sliceBottomRef = useRef<HTMLInputElement>(null);
  const bulletInputRef = useRef<HTMLInputElement>(null);
  const footerInputRef = useRef<HTMLInputElement>(null);

  // 현재 로그인 유저
  const [authorName, setAuthorName] = useState("당당");
  const [authorId, setAuthorId] = useState("dang");

  useEffect(() => {
    try {
      const savedName = localStorage.getItem("user_nickname");
      if (savedName) setAuthorName(savedName);
      const savedId = localStorage.getItem("current_user_id");
      if (savedId) setAuthorId(savedId);
    } catch {}
  }, []);

  // 이미지 업로드 유틸 (DataURL 변환)
  const handleImageFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 템플릿 다운로드 가이드
  const handleDownloadGuide = () => {
    alert("초대장 커버 가이드 규격(148*100 PNG) 다운로드가 시작되었습니다.");
  };

  // [임시저장] 핸들러
  const handleSaveDraft = () => {
    try {
      const draftData = {
        templateTitle,
        coverImage,
        paperBgColor,
        paperBgImage,
        frameType,
        frameBgColor,
        customBullet,
        fontFamily,
        fontColor,
        footerImage,
        savedAt: Date.now(),
      };
      localStorage.setItem("craft_editor_draft", JSON.stringify(draftData));
      alert("에디터 작업 내용이 임시저장되었습니다.");
    } catch {
      alert("임시저장 중 오류가 발생했습니다.");
    }
  };

  // [등록] 핸들러: 공방 목록 최상단에 저장 후 이동
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTemplate: CraftInvitationTemplate = {
      id: `custom-${Date.now()}`,
      title: templateTitle.trim() || "커스텀 초대장",
      author: authorName,
      authorId: authorId,
      coverImage: coverImage || undefined,
      coverType: "custom",
      paperBgColor,
      paperBgImage: paperBgImage || undefined,
      cardFrameType: frameType,
      cardFrameColor: frameBgColor,
      cardSliceTop: sliceTop || undefined,
      cardSliceBody: sliceBody || undefined,
      cardSliceBottom: sliceBottom || undefined,
      customBullet: customBullet || undefined,
      fontFamily,
      fontColor,
      footerImage: footerImage || undefined,
      createdAt: Date.now(),
    };

    try {
      const existing = localStorage.getItem("craft_invitation_templates");
      const list: CraftInvitationTemplate[] = existing ? JSON.parse(existing) : [];
      // 최상단에 추가
      localStorage.setItem("craft_invitation_templates", JSON.stringify([newTemplate, ...list]));

      alert("초대장 템플릿이 성공적으로 등록되었습니다!");
      router.push("/village/craft/invitation");
    } catch {
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  // 프리뷰에 전달할 템플릿 객체
  const previewTemplate: Partial<CraftInvitationTemplate> = {
    coverImage: coverImage || undefined,
    coverType: "custom",
    paperBgColor,
    paperBgImage: paperBgImage || undefined,
    cardFrameType: frameType,
    cardFrameColor: frameBgColor,
    customBullet: customBullet || undefined,
    fontFamily,
    fontColor,
    footerImage: footerImage || undefined,
  };

  return (
    <div className="w-full min-h-screen bg-[#FFFDF8] flex flex-col font-sans pb-24">
      {/* 1. 상단 바: 제목 및 [저장], [임시저장 1/3], [등록] */}
      <div className="w-full px-6 md:px-12 py-5 border-b border-neutral-200/70 flex items-center justify-between gap-4 sticky top-0 bg-[#FFFDF8]/90 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={templateTitle}
            onChange={(e) => setTemplateTitle(e.target.value)}
            className="text-xl md:text-2xl font-black text-neutral-900 bg-transparent outline-none border-b border-transparent hover:border-neutral-300 focus:border-black transition"
            placeholder="템플릿 이름을 입력하세요"
          />
        </div>

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
            className="h-9 bg-neutral-900 hover:bg-black text-white text-xs font-bold px-5 rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center whitespace-nowrap"
          >
            등록
          </button>
        </div>
      </div>

      {/* 2. 에디터 2단 레이아웃: 좌측(실시간 조립 프리뷰 고정) + 우측(부위별 에셋 등록 패널) */}
      <div className="w-full px-6 md:px-12 py-8 flex flex-col xl:flex-row gap-12 items-start max-w-7xl mx-auto">
        {/* [좌측] 실시간 조립 프리뷰 (고정 캔버스) */}
        <div className="w-full xl:w-[420px] shrink-0 flex flex-col gap-5 sticky top-24">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-500 px-1">
            <span>실시간 조립 프리뷰</span>
            <span className="text-[11px] font-normal text-neutral-400">우측 수정 사항이 즉시 반영됩니다</span>
          </div>

          <div className="w-full flex flex-col rounded-2xl overflow-hidden shadow-xl border border-black/10 bg-[#E8E2D5]/40 p-4 gap-4">
            {/* 1) 초대장 커버 프리뷰 (148*100) */}
            <div className="w-full">
              <InvitationCoverPreview template={previewTemplate} showGuides={true} />
            </div>

            {/* 2) 편지지 본문 프리뷰 (배경, 카드 프레임, 불릿, 하단 148*50) */}
            <div className="w-full">
              <InvitationBodyPreview
                template={previewTemplate}
                isEditorSample={true}
                scheduleGlobalMode="bullet"
              />
            </div>
          </div>
        </div>

        {/* [우측] 부위별 에셋 등록 패널 */}
        <div className="flex-1 w-full flex flex-col gap-7 divide-y divide-neutral-200/80">
          {/* 1) 초대장 커버 (148*100) */}
          <div className="flex flex-col gap-2.5 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <h3 className="text-sm font-black text-neutral-900">초대장 커버</h3>
                <button
                  type="button"
                  onClick={handleDownloadGuide}
                  className="text-xs text-neutral-500 hover:text-black underline underline-offset-2 transition"
                >
                  템플릿 다운받기
                </button>
              </div>

              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="bg-black hover:bg-neutral-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition shadow-2xs"
              >
                이미지 가져오기
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageFile(e, setCoverImage)}
              />
            </div>
            <p className="text-[11px] text-neutral-500">
              · 148*100 px 사이즈 이미지(PNG)를 등록해 주세요.
            </p>
          </div>

          {/* 2) 편지지 배경 */}
          <div className="flex flex-col gap-2.5 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-neutral-900">편지지 배경</h3>

              <div className="flex items-center gap-3">
                {/* 배경 컬러 피커 서클 */}
                <label className="flex items-center gap-2 border border-neutral-300 rounded-full px-2.5 py-1 bg-white cursor-pointer hover:border-neutral-500 transition text-xs">
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: paperBgColor }}
                  />
                  <span className="font-mono text-[11px] text-neutral-700">{paperBgColor}</span>
                  <input
                    type="color"
                    value={paperBgColor}
                    onChange={(e) => setPaperBgColor(e.target.value)}
                    className="sr-only"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => bgInputRef.current?.click()}
                  className="bg-black hover:bg-neutral-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition shadow-2xs"
                >
                  이미지 가져오기
                </button>
                <input
                  ref={bgInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageFile(e, setPaperBgImage)}
                />
              </div>
            </div>
            <div className="text-[11px] text-neutral-500 flex flex-col gap-0.5">
              <p>· 148*40 px 사이즈 이미지(PNG)를 등록해 주세요.</p>
              <p>· 본문 내용 길이에 따라 바디가 반복 됩니다.</p>
            </div>
          </div>

          {/* 3) 내용 카드 프레임 (3-Piece 슬라이스 방식) */}
          <div className="flex flex-col gap-3 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-neutral-900">내용 카드 프레임</h3>

              {/* 라운딩 vs 3피스 슬라이스 선택 토글 */}
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFrameType("rounded")}
                  className={`px-2.5 py-1 rounded-md transition ${
                    frameType === "rounded" ? "bg-white text-black shadow-2xs" : "text-neutral-500"
                  }`}
                >
                  기본 라운딩
                </button>
                <button
                  type="button"
                  onClick={() => setFrameType("sliced")}
                  className={`px-2.5 py-1 rounded-md transition ${
                    frameType === "sliced" ? "bg-white text-black shadow-2xs" : "text-neutral-500"
                  }`}
                >
                  3피스 슬라이스
                </button>
              </div>
            </div>

            {/* 카드 프레임 세부 설정 목록 */}
            <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-xl divide-y divide-neutral-200/60 overflow-hidden text-xs">
              {/* 기본 라운딩 박스 */}
              <div className="p-3 flex items-center justify-between">
                <span className="font-bold text-neutral-700">기본 라운딩 박스</span>
                <label className="flex items-center gap-2 border border-neutral-300 rounded-full px-2.5 py-1 bg-white cursor-pointer hover:border-neutral-500 transition">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: frameBgColor }}
                  />
                  <span className="font-mono text-[11px] text-neutral-700">{frameBgColor}</span>
                  <input
                    type="color"
                    value={frameBgColor.slice(0, 7)}
                    onChange={(e) => setFrameBgColor(e.target.value + "c0")}
                    className="sr-only"
                  />
                </label>
              </div>

              {/* 3피스 슬라이스 에셋 업로드 (상단 캡, 본문늘림, 하단 캡) */}
              {frameType === "sliced" && (
                <>
                  <div className="p-3 flex items-center justify-between">
                    <span className="font-medium text-neutral-600">상단 캡</span>
                    <button
                      type="button"
                      onClick={() => sliceTopRef.current?.click()}
                      className="bg-black hover:bg-neutral-800 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition"
                    >
                      {sliceTop ? "변경하기" : "이미지 가져오기"}
                    </button>
                    <input
                      ref={sliceTopRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFile(e, setSliceTop)}
                    />
                  </div>

                  <div className="p-3 flex items-center justify-between">
                    <span className="font-medium text-neutral-600">본문늘림</span>
                    <button
                      type="button"
                      onClick={() => sliceBodyRef.current?.click()}
                      className="bg-black hover:bg-neutral-800 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition"
                    >
                      {sliceBody ? "변경하기" : "이미지 가져오기"}
                    </button>
                    <input
                      ref={sliceBodyRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFile(e, setSliceBody)}
                    />
                  </div>

                  <div className="p-3 flex items-center justify-between">
                    <span className="font-medium text-neutral-600">하단 캡</span>
                    <button
                      type="button"
                      onClick={() => sliceBottomRef.current?.click()}
                      className="bg-black hover:bg-neutral-800 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition"
                    >
                      {sliceBottom ? "변경하기" : "이미지 가져오기"}
                    </button>
                    <input
                      ref={sliceBottomRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFile(e, setSliceBottom)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 4) 커스텀 불릿 */}
          <div className="flex items-center justify-between pt-6">
            <h3 className="text-sm font-black text-neutral-900">커스텀 불릿</h3>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shadow-2xs overflow-hidden">
                {customBullet ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={customBullet} alt="bullet" className="w-6 h-6 object-contain" />
                ) : (
                  <span className="text-base">☕</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => bulletInputRef.current?.click()}
                className="bg-black hover:bg-neutral-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition shadow-2xs"
              >
                이미지 가져오기
              </button>
              <input
                ref={bulletInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageFile(e, setCustomBullet)}
              />
            </div>
          </div>

          {/* 5) 폰트 & 폰트/선 색 */}
          <div className="flex flex-col gap-4 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-neutral-900">폰트</h3>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs font-bold text-neutral-800 outline-none cursor-pointer"
              >
                <option value="Paperlogy">Paperlogy</option>
                <option value="Pretendard">Pretendard</option>
                <option value="Gaegu">Gaegu</option>
                <option value="Gowun Dodum">Gowun Dodum</option>
                <option value="Nanum Myeongjo">Nanum Myeongjo</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-neutral-900">폰트,선 색</h3>
              <label className="flex items-center gap-2 border border-neutral-300 rounded-full px-3 py-1 bg-white cursor-pointer hover:border-neutral-500 transition text-xs">
                <span
                  className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: fontColor }}
                />
                <span className="font-mono text-xs text-neutral-800 font-bold">{fontColor}</span>
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          {/* 6) 하단 배너 (148*50) */}
          <div className="flex flex-col gap-2.5 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-neutral-900">하단</h3>
              <button
                type="button"
                onClick={() => footerInputRef.current?.click()}
                className="bg-black hover:bg-neutral-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition shadow-2xs"
              >
                이미지 가져오기
              </button>
              <input
                ref={footerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageFile(e, setFooterImage)}
              />
            </div>
            <p className="text-[11px] text-neutral-500">
              · 148*50 px 사이즈 이미지(PNG)를 등록해 주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

