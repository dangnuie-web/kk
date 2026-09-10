"use client";

import React, { useRef } from "react";

interface Props {
  posterImage: string | null;
  onImageChange: (img: string | null) => void;
  onOpenEditor: () => void;
  onCustomUpload?: (file: File) => void;
}

export default function PosterUploader({
  posterImage,
  onImageChange,
  onOpenEditor,
  onCustomUpload,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (onCustomUpload) {
        onCustomUpload(file);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => onImageChange(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div
      style={{
        height: "min(calc(100vh - 280px), 620px)",
        width: "calc(min(calc(100vh - 280px), 620px) / 1.414)",
      }}
      className="max-w-full aspect-[1/1.414] bg-[#D9D9D9] rounded-sm flex flex-col items-center justify-center relative overflow-hidden group shrink-0"
    >
      {posterImage ? (

        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={posterImage} alt="포스터" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onImageChange(null)}
            className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 transition"
          >
            지우기
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-2.5 items-center z-10">
          <button
            type="button"
            onClick={onOpenEditor}
            className="bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-medium py-2 px-4 rounded-md shadow-sm transition text-center min-w-[140px]"
          >
            포스터 만들기 에디터
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-medium py-2 px-4 rounded-md shadow-sm transition text-center min-w-[140px]"
          >
            이미지 불러오기
          </button>
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  );
}