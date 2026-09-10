"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CraftInvitationTemplate, DEFAULT_CRAFT_TEMPLATES } from "@/types/craft";

export default function VillageCraftInvitationPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<CraftInvitationTemplate[]>(DEFAULT_CRAFT_TEMPLATES);
  const [currentUserId, setCurrentUserId] = useState("dang");
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("current_user_id");
      if (savedUser) setCurrentUserId(savedUser);

      // 로컬스토리지에 저장된 커스텀 템플릿 불러오기 및 결합
      const customSaved = localStorage.getItem("craft_invitation_templates");
      if (customSaved) {
        const parsed: CraftInvitationTemplate[] = JSON.parse(customSaved);
        // 커스텀 템플릿을 목록 최상단에 배치
        setTemplates([...parsed, ...DEFAULT_CRAFT_TEMPLATES]);
      } else {
        setTemplates(DEFAULT_CRAFT_TEMPLATES);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const filteredTemplates = templates.filter((t) => {
    if (!searchKeyword.trim()) return true;
    const k = searchKeyword.toLowerCase();
    return t.title.toLowerCase().includes(k) || t.author.toLowerCase().includes(k);
  });

  return (
    <div className="w-full min-h-screen bg-[#FFFDF8] flex flex-col font-sans">
      <div className="w-full px-6 sm:px-10 md:px-12 py-6 sm:pt-24 sm:pb-12 flex flex-col gap-8 max-w-7xl mx-auto">
        {/* 상단 툴바: 검색 아이콘 + 우측 북마크 & 커스텀 초대장 에디터 버튼 */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="템플릿 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-transparent border-b border-neutral-300 focus:border-black outline-none transition w-44 sm:w-60"
              />
              <svg
                className="w-4 h-4 text-neutral-400 absolute left-1 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 북마크 아이콘 */}
            <button
              type="button"
              className="p-1.5 text-neutral-500 hover:text-black transition cursor-pointer"
              title="북마크"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>

            {/* ⭐️ [커스텀 초대장 에디터] 버튼 */}
            <button
              type="button"
              onClick={() => router.push("/craft/editor")}
              className="bg-black hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>커스텀 초대장 에디터</span>
            </button>
          </div>
        </div>

        {/* ⭐️ 템플릿 그리드 (5열 반응형): PNG 투명 영역 보존하여 오브젝트가 공중에 떠 있는 플랫 UI */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
          {filteredTemplates.map((template) => {
            return (
              <div
                key={template.id}
                onClick={() => router.push(`/house/${currentUserId}/postbox/new?templateId=${template.id}`)}
                className="flex flex-col gap-2.5 group cursor-pointer"
                title={`${template.title} 템플릿으로 초대장 만들기`}
              >
                {/* 썸네일: 투명 배경 위 오브젝트 플로팅 렌더링 */}
                <div className="w-full aspect-[148/100] flex items-center justify-center relative p-2 transition-transform duration-200 group-hover:scale-105 select-none">
                  {template.coverImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={template.coverImage}
                      alt={template.title}
                      className="w-full h-full object-contain drop-shadow-sm"
                    />
                  ) : template.coverType === "heart" ? (
                    <svg viewBox="0 0 300 200" className="w-full h-full drop-shadow-sm" fill="#FCE5E8">
                      <path d="M150,185 C20,130 10,60 70,30 C120,5 150,55 150,55 C150,55 180,5 230,30 C290,60 280,130 150,185 Z" fill="#FCE5E8" stroke="#F6ADB8" strokeWidth="2" />
                    </svg>
                  ) : template.coverType === "book" ? (
                    <div className="w-[85%] h-[80%] bg-[#486b51] rounded-lg p-2 shadow-sm flex items-center justify-center">
                      <div className="w-full h-full bg-[#FAF7EE] rounded-sm p-2 flex flex-col justify-between border border-[#37523e]">
                        <div className="w-2.5 h-6 bg-teal-600 rounded-b shadow-2xs self-center" />
                        <span className="text-[9px] text-[#2F5233] font-bold text-center">Book</span>
                      </div>
                    </div>
                  ) : template.coverType === "house" ? (
                    <div className="w-[85%] h-[80%] bg-[#faebd7] rounded-xl border-2 border-[#D97D54] relative shadow-sm p-3 flex flex-col justify-end">
                      <div className="absolute -top-2.5 left-4 w-4 h-6 bg-[#B24C3B] rounded-t-xs" />
                      <div className="absolute -top-3 inset-x-0 h-3 bg-[#E0634E] rounded-t-xl" />
                      <div className="w-5 h-5 rounded-full bg-cyan-200 border border-white self-end mb-1 flex items-center justify-center text-[8px]">🪟</div>
                    </div>
                  ) : (
                    /* 회색 플레이스홀더 썸네일 (크리스 마스 초대장 등) */
                    <div className="w-full h-full bg-[#DEDACF] rounded-2xl flex items-center justify-center shadow-2xs group-hover:bg-[#d6d1c4] transition" />
                  )}
                </div>

                {/* 하단 메타 정보 (작성자 프로필 + 템플릿 이름) */}
                <div className="flex flex-col gap-1 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-neutral-300 inline-block shrink-0" />
                    <span className="text-xs text-neutral-600 font-medium truncate">{template.author}</span>
                  </div>
                  <span className="text-xs font-black text-neutral-900 group-hover:text-amber-800 transition truncate">
                    {template.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="py-28 text-center text-xs text-neutral-400">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

