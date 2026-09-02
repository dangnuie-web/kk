"use client";

import React, { useState } from "react";

export interface GridItem {
  id: number;
  title: string;
  date?: string;
  sender?: string;
  customContent?: React.ReactNode;
}

interface SelectableGridProps {
  items: GridItem[];
  aspect?: string;
  gridCols?: string;
  onItemClick?: (item: GridItem) => void;
  onDelete?: (selectedIds: number[]) => void;
  onEdit?: (selectedIds: number[]) => void;
}

export default function SelectableGrid({
  items,
  aspect = "aspect-[1/1.414]",
  gridCols = "grid-cols-1 sm:grid-cols-3 md:grid-cols-5",
  onItemClick,
  onDelete,
  onEdit,
}: SelectableGridProps) {
  // 선택된 카드 번호만 관리
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 체크박스 클릭
  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 전체 선택 / 해제
  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  // 삭제 처리
  const handleDelete = () => {
    if (confirm(`${selectedIds.length}개 항목을 삭제하시겠습니까?`)) {
      if (onDelete) onDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div className="flex flex-col gap-6 relative pb-20">
      {/* 카드 그리드: 부모가 준 items를 직접 렌더링 */}
      <div className={`grid ${gridCols} gap-4`}>
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => onItemClick && onItemClick(item)}
              className="flex flex-col gap-1.5 cursor-pointer group relative transition-transform duration-200 hover:-translate-y-2"
            >
              <div
                className={`relative w-full ${aspect} bg-[#FAF7F0] border border-neutral-200/80 rounded-xl overflow-hidden shadow-sm transition-all duration-200 ${
                  isSelected ? "ring-2 ring-blue-500 shadow-md" : "group-hover:shadow-lg"
                } flex items-center justify-center text-neutral-400`}
              >
                {item.customContent ? (
                  item.customContent
                ) : (
                  <span className="text-xs">Post {item.id}</span>
                )}

                {/* 체크박스 */}
                <div
                  onClick={(e) => toggleSelect(item.id, e)}
                  className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-md flex items-center justify-center transition-all z-10 ${
                    isSelected
                      ? "bg-blue-600 text-white opacity-100 scale-100"
                      : "bg-black/30 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 scale-90 hover:scale-100 hover:bg-black/50"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>

              {(item.date || item.sender) && (
                <span className="text-[10px] text-neutral-500 px-0.5 mt-0.5">
                  {item.date || item.sender}
                </span>
              )}

              <p className="text-sm font-semibold text-neutral-900 leading-snug px-0.5 truncate">
                {item.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* 하단 플로팅 바 */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#191919] text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-4 text-xs md:text-sm font-bold border border-white/10">
          <span className="text-neutral-200">{selectedIds.length}개 선택됨</span>
          <div className="w-[1px] h-3 bg-neutral-700" />
          <button onClick={toggleSelectAll} className="text-neutral-300 hover:text-white transition">
            {selectedIds.length === items.length ? "선택 해제" : "전체 선택"}
          </button>
          <button
            onClick={() => onEdit && onEdit(selectedIds)}
            className="text-neutral-300 hover:text-white transition"
          >
            수정하기
          </button>
          <button onClick={handleDelete} className="text-[#FF5C5C] hover:text-red-400 transition font-black">
            삭제하기
          </button>
        </div>
      )}
    </div>
  );
}