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

  // ⭐️ 2. 에디터 모달 열림/닫힘 상태 추가
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

  // 임시저장 핸들러
  const handleSaveDraft = () => {
    if (!title.trim() && !content.trim() && !posterImage) {
      alert("저장할 내용이 없습니다.");
      return;
    }
    if (drafts.length >= 3) {
      alert("임시저장은 최대 3개까지만 가능합니다.");
      setShowDraftModal(true);
      return;
    }

    const newDraft: DraftSlot = {
      slotId: (drafts.length + 1) as 1 | 2 | 3,
      savedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      title: title || "제목 없음",
      content,
      eventDate: getFormattedToday(),
      posterImage: posterImage || undefined,
    };

    const updated = [...drafts, newDraft];
    setDrafts(updated);
    localStorage.setItem(`drafts_${userId}`, JSON.stringify(updated));
    alert(`임시저장 완료 (${newDraft.slotId}/3)`);
  };

  const handleLoadDraft = (draft: DraftSlot) => {
    setTitle(draft.title === "제목 없음" ? "" : draft.title);
    setContent(draft.content || "");
    setPosterImage(draft.posterImage || null);
    setShowDraftModal(false);
  };

  // 파티 등록 완료
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

      alert("파티가 성공적으로 등록되었습니다!");
      router.push(`/house/${userId}/party`);
    } catch (err) {
      alert("저장 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-sm border border-white/40 max-w-5xl mx-auto w-full">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* ⭐️ 3. onOpenEditor에 alert 대신 setShowEditorModal(true) 연결 */}
        <PosterUploader
          posterImage={posterImage}
          onImageChange={setPosterImage}
          onCustomUpload={async (file) => {
            const compressed = await compressImage(file);
            setPosterImage(compressed);
          }}
          onOpenEditor={() => setShowEditorModal(true)}
        />

        <div className="flex flex-col justify-between h-full min-h-[420px] gap-6">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-bold">
              <span>작성일자</span>
              <span>{getFormattedToday()}</span>
            </div>

            <input
              type="text"
              placeholder="파티 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-black text-neutral-900 placeholder:text-neutral-300 outline-none border-b border-neutral-200 pb-2"
            />

            <textarea
              placeholder="본문 내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-2xl p-4 text-sm text-neutral-800 placeholder:text-neutral-300 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-bold px-4 py-2.5 rounded-xl transition"
              >
                저장 ({drafts.length}/3)
              </button>
              {drafts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowDraftModal(true)}
                  className="text-blue-600 hover:underline text-xs font-bold px-1"
                >
                  불러오기
                </button>
              )}
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

      {/* 임시저장 모달 */}
      <DraftModal
        isOpen={showDraftModal}
        onClose={() => setShowDraftModal(false)}
        drafts={drafts}
        onSelectDraft={handleLoadDraft}
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