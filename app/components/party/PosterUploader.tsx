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
    <div className="w-full aspect-[1/1.414] bg-neutral-200/70 rounded-2xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
      {posterImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={posterImage} alt="포스터" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onImageChange(null)}
            className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition"
          >
            지우기
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-3 w-48 z-10">
          <button
            type="button"
            onClick={onOpenEditor}
            className="bg-white hover:bg-neutral-50 text-neutral-800 text-xs md:text-sm font-bold py-2.5 px-4 rounded-xl shadow-sm border border-neutral-200 transition text-center"
          >
            포스터 만들기 에디터
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-white hover:bg-neutral-50 text-neutral-800 text-xs md:text-sm font-bold py-2.5 px-4 rounded-xl shadow-sm border border-neutral-200 transition text-center"
          >
            이미지 불러오기
          </button>
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  );
}