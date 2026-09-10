"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { DraftSlot, PartyPost } from "@/types/house";
import PosterUploader from "@/app/components/party/PosterUploader";
import DraftModal from "@/app/components/party/DraftModal";
// ⭐️ 1. 포스터 에디터 모달 import 추가
import PosterEditorModal from "@/app/components/party/PosterEditorModal";

// 오늘 날짜 포맷
const getFormattedToday = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${yy}.${mm}.${dd}.${days[now.getDay()]}`;
};

// 이미지 압축
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 600;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
    };
  });
};

export default function NewPartyPage() {
  const params = useParams();
  const userId = (params?.userId as string) || "dang";
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posterImage, setPosterImage] = useState<string | null>(null);
  const [activeDraftSlotId, setActiveDraftSlotId] = useState<number | null>(null);

  // 에디터 모달 열림/닫힘 상태
  const [showEditorModal, setShowEditorModal] = useState(false);

  // 임시저장 데이터 로드
  const [drafts, setDrafts] = useState<DraftSlot[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const savedDrafts = localStorage.getItem(`drafts_${userId}`);
      return savedDrafts ? JSON.parse(savedDrafts) : [];
    } catch {
      return [];
    }
  });

  const [showDraftModal, setShowDraftModal] = useState(false);

  // 임시저장 핸들러 (덮어쓰기 지원 및 3개 초과 검사)
  const handleSaveDraft = () => {
    if (!title.trim() && !content.trim() && !posterImage) {
      alert("저장할 내용이 없습니다.");
      return;
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 1. 이미 열려있거나 저장된 활성 슬롯이 존재하는 경우 -> 해당 슬롯 최신 버전으로 덮어쓰기!
    if (activeDraftSlotId !== null && drafts.some((d) => d.slotId === activeDraftSlotId)) {
      const updated = drafts.map((d) =>
        d.slotId === activeDraftSlotId
          ? {
              ...d,
              title: title || "제목 없음",
              content,
              eventDate: getFormattedToday(),
              posterImage: posterImage || undefined,
              savedAt: nowTime,
            }
          : d
      );
      setDrafts(updated);
      localStorage.setItem(`drafts_${userId}`, JSON.stringify(updated));
      alert(`임시저장이 최신 버전으로 갱신되었습니다.`);
      return;
    }

    // 2. 새 슬롯으로 저장하려는 경우: 3개 초과 체크!
    if (drafts.length >= 3) {
      alert("저장 목록이 꽉 찼습니다.");
      setShowDraftModal(true);
      return;
    }

    // 빈 슬롯 번호 찾기 (1, 2, 3 중 비어있는 가장 작은 번호)
    const existingSlotIds = drafts.map((d) => d.slotId);
    let newSlotId: 1 | 2 | 3 = 1;
    for (let i = 1; i <= 3; i++) {
      if (!existingSlotIds.includes(i as 1 | 2 | 3)) {
        newSlotId = i as 1 | 2 | 3;
        break;
      }
    }

    const newDraft: DraftSlot = {
      slotId: newSlotId,
      savedAt: nowTime,
      title: title || "제목 없음",
      content,
      eventDate: getFormattedToday(),
      posterImage: posterImage || undefined,
    };

    const updated = [...drafts, newDraft];
    setDrafts(updated);
    setActiveDraftSlotId(newSlotId);
    localStorage.setItem(`drafts_${userId}`, JSON.stringify(updated));
    alert(`임시저장 완료 (${updated.length}/3)`);
  };

  const handleLoadDraft = (draft: DraftSlot) => {
    setTitle(draft.title === "제목 없음" ? "" : draft.title);
    setContent(draft.content || "");
    setPosterImage(draft.posterImage || null);
    setActiveDraftSlotId(draft.slotId);
    setShowDraftModal(false);
  };

  const handleDeleteDraft = (slotId: number) => {
    const updated = drafts.filter((d) => d.slotId !== slotId);
    setDrafts(updated);
    localStorage.setItem(`drafts_${userId}`, JSON.stringify(updated));
    if (activeDraftSlotId === slotId) {
      setActiveDraftSlotId(null);
    }
  };

  // 파티 등록(발행) 완료
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("제목을 입력해 주세요.");
      return;
    }

    try {
      const storageKey = `party_posts_${userId}`;
      const prevData = localStorage.getItem(storageKey);
      const currentPosts: PartyPost[] = prevData ? JSON.parse(prevData) : [];

      const newPost: PartyPost = {
        id: Date.now(),
        userId,
        title,
        content,
        eventDate: getFormattedToday(),
        posterImage: posterImage || "",
      };

      localStorage.setItem(storageKey, JSON.stringify([newPost, ...currentPosts]));
      localStorage.setItem("party_posts_dang", JSON.stringify([newPost, ...currentPosts]));

      // 등록 성공 시 임시저장에서 현재 슬롯 삭제(선택사항)
      if (activeDraftSlotId !== null) {
        handleDeleteDraft(activeDraftSlotId);
      }

      alert("파티가 성공적으로 등록되었습니다!");
      router.push(`/house/${userId}/party`);
    } catch (err) {
      alert("등록 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  return (
    <div className="w-full px-6 md:px-12 py-6 pb-20 md:pb-28 flex flex-col gap-6 font-sans">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
        {/* 상단 바: 작성일자 & 제목 / 우측 임시저장(저장 + 아래 1/3) & 등록 버튼 */}
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
          </div>

          <div className="flex items-start gap-3 shrink-0">
            {/* 임시저장 컨트롤 (저장 버튼 + 그 아래 '임시저장 1/3') */}
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

            {/* 글 등록(발행) 버튼 */}
            <button
              type="submit"
              className="h-9 bg-neutral-900 hover:bg-black text-white text-xs font-bold px-5 rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap flex items-center justify-center"
            >
              등록
            </button>
          </div>
        </div>

        {/* 2. 에디터 서식 툴바 (콘텐츠 등록처럼 제목 바로 아래에 가로 전체 배치, 자동 줄바꿈) */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-neutral-200/60 pb-3 text-xs text-neutral-700 select-none">
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

        {/* 3. 본문: 플랫 포스터 영역 + 텍스트 본문 (1280px 아래에서는 본문이 포스터 아래로 이동) */}
        <div className="flex flex-col xl:flex-row gap-8 items-start pt-1 pb-16 md:pb-20">
          <PosterUploader
            posterImage={posterImage}
            onImageChange={setPosterImage}
            onCustomUpload={async (file) => {
              const compressed = await compressImage(file);
              setPosterImage(compressed);
            }}
            onOpenEditor={() => setShowEditorModal(true)}
          />

          <div className="flex-1 flex flex-col gap-3 min-w-0 w-full">
            {/* 본문 텍스트 영역 (테두리/박스/그림자 없이 자연스러운 캔버스) */}
            <textarea
              placeholder="파티에 대해 자유롭게 소개해 주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
              className="w-full bg-transparent border-none outline-none resize-none text-sm text-neutral-800 placeholder:text-neutral-500 leading-relaxed pt-1"
            />
          </div>
        </div>
      </form>

      {/* 임시저장 모달 */}
      <DraftModal
        isOpen={showDraftModal}
        onClose={() => setShowDraftModal(false)}
        drafts={drafts}
        onSelectDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
      />

      {/* ⭐️ 4. 포스터 만들기 에디터 모달 연동 */}
      <PosterEditorModal
        isOpen={showEditorModal}
        onClose={() => setShowEditorModal(false)}
        onComplete={(imageDataUrl) => setPosterImage(imageDataUrl)}
        defaultTitle={title}
        defaultDate={getFormattedToday()}
      />
    </div>
  );
}