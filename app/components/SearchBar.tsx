"use client";

import React, { useState, useRef, useEffect } from "react";

export interface FilterOptions {
  keyword: string;
  startDate?: string;
  endDate?: string;
}

interface SearchBarProps {
  onSearch?: (options: FilterOptions) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const executeSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch?.({
      keyword: keyword.trim(),
      startDate,
      endDate,
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsFilterOpen(false);
    setKeyword("");
    setStartDate("");
    setEndDate("");
    onSearch?.({ keyword: "" });
  };

  return (
    <div className="relative flex items-center">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-1.5 text-neutral-800 hover:text-blue-600 transition flex items-center justify-center"
          aria-label="검색창 열기"
        >
          <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
          </svg>
        </button>
      ) : (
        <form
          onSubmit={executeSearch}
          className="flex items-center gap-2 border-b-2 border-neutral-600/80 pb-1 w-52 sm:w-64 md:w-80 transition-all duration-300"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="단어 검색 후 Enter"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="bg-transparent text-sm md:text-base outline-none w-full text-neutral-800 placeholder:text-neutral-500 font-medium"
          />

          <button type="submit" className="text-neutral-700 hover:text-blue-600 transition p-0.5" title="검색">
            <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`transition p-0.5 ${isFilterOpen ? "text-blue-600 font-bold" : "text-neutral-700 hover:text-blue-600"}`}
            title="기간 필터 설정"
          >
            <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
              <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
              <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
            </svg>
          </button>

          <button type="button" onClick={handleClose} className="text-neutral-400 hover:text-neutral-700 text-xs pl-1">
            ✕
          </button>
        </form>
      )}

      {/* 기간 필터 모달 */}
      {isFilterOpen && (
        <div className="absolute top-10 left-0 z-50 bg-[#FFFDF8] border border-neutral-200 rounded-2xl p-4 shadow-xl w-72 flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <span className="text-xs font-black text-neutral-800">🔍 기간 설정</span>
            <button onClick={() => setIsFilterOpen(false)} className="text-xs text-neutral-400 hover:text-neutral-700 font-bold">
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-lg px-2 py-1 outline-none text-neutral-700 text-xs"
              />
              <span className="text-neutral-400">~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-lg px-2 py-1 outline-none text-neutral-700 text-xs"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsFilterOpen(false);
              executeSearch();
            }}
            className="w-full bg-[#3D7BF6] hover:bg-blue-600 text-white text-xs font-bold py-2 rounded-xl transition shadow-sm mt-1"
          >
            조건 적용하기
          </button>
        </div>
      )}
    </div>
  );
}