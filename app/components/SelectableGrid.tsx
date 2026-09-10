"use client";

import React, { useState } from "react";

export interface GridItem {
  id: number | string;
  title: string;
  date?: string;
  sender?: string;
  customContent?: React.ReactNode;
}

interface SelectableGridProps {
  items: GridItem[];
  aspect?: string;
  gridCols?: string;
  canSelect?: boolean;
  onItemClick?: (item: GridItem) => void;
  onDelete?: (selectedIds: (number | string)[]) => void;
  onEdit?: (selectedIds: (number | string)[]) => void;
  containerClassName?: string;
  cardClassName?: string;
  cardStyle?: React.CSSProperties;
  wrapperClassName?: string;
  hideCardInfo?: boolean;
}

export default function SelectableGrid({
  items,
  aspect = "aspect-[1/1.414]",
  gridCols = "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 min-[1750px]:grid-cols-7 min-[2000px]:grid-cols-8",
  canSelect = true,
  onItemClick,
  onDelete,
  onEdit,
  containerClassName,
  cardClassName,
  cardStyle,
  wrapperClassName,
  hideCardInfo = false,
}: SelectableGridProps) {
  // 선택된 카드 ID 관리
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);

  // 체크박스 클릭
  const toggleSelect = (id: number | string, e: React.MouseEvent) => {
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
      {/* 카드 컨테이너 */}
      <div className={containerClassName || `grid ${gridCols} gap-4 md:gap-5`}>
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => onItemClick && onItemClick(item)}
              className={wrapperClassName || "flex flex-col gap-1.5 cursor-pointer group relative transition-transform duration-200 hover:-translate-y-1"}
            >
              <div
                style={cardStyle}
                className={`relative w-full ${aspect} bg-[#FAF7F0] border border-neutral-200/80 rounded-[6px] overflow-hidden shadow-sm transition-all duration-200 ${
                  isSelected ? "ring-2 ring-neutral-900 shadow-md" : "group-hover:shadow-md"
                } flex items-center justify-center text-neutral-400 ${cardClassName || ""}`}
              >
                {item.customContent ? (
                  item.customContent
                ) : (
                  <span className="text-xs font-bold">Item {item.id}</span>
                )}

                {/* 체크박스 (canSelect일 때만 표시) */}
                {canSelect && (
                  <div
                    onClick={(e) => toggleSelect(item.id, e)}
                    className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all z-10 ${
                      isSelected
                        ? "bg-neutral-900 text-white opacity-100 scale-100 shadow-sm"
                        : "bg-black/35 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 scale-90 hover:scale-100 hover:bg-black/55"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>

              {!hideCardInfo && (
                <>
                  {(item.date || item.sender) && (
                    <span className="text-[11px] font-medium text-neutral-400 px-0.5 mt-0.5 block">
                      {item.date || item.sender}
                    </span>
                  )}

                  <p className="text-xs md:text-sm font-black text-neutral-900 leading-snug px-0.5 truncate group-hover:text-blue-600 transition">
                    {item.title}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 플로팅 바 (선택된 항목이 있을 때만 노출) */}
      {canSelect && selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/95 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 text-xs md:text-sm font-bold border border-white/15 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="text-neutral-300 font-medium">{selectedIds.length}개 선택됨</span>
          <div className="w-[1px] h-3.5 bg-neutral-700" />
          <button
            type="button"
            onClick={toggleSelectAll}
            className="text-neutral-300 hover:text-white transition"
          >
            {selectedIds.length === items.length ? "선택 해제" : "전체 선택"}
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300 transition font-bold"
            >
              삭제
            </button>
          )}
        </div>
      )}
    </div>
  );
}