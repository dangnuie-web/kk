import React from "react";
import Link from "next/link";

// 반응형 카드 컴포넌트
function ItemCard({
  aspect = "aspect-square",
  title = "랜덤 비빔밥의 날",
  author = "작성자",
}: {
  aspect?: string;
  title?: string;
  author?: string;
}) {
  return (
    <div className="flex flex-col gap-2 cursor-pointer group">
      {/* 썸네일 이미지 박스 */}
      <div
        className={`w-full ${aspect} bg-neutral-200 rounded-xl overflow-hidden shadow-sm flex items-center justify-center text-neutral-400 group-hover:opacity-90 transition`}
      >
        <span className="text-xs">Image</span>
      </div>

      {/* 작성자 정보 */}
      <div className="flex items-center gap-1.5 px-0.5">
        <div className="w-5 h-5 rounded-full bg-neutral-300 shrink-0" />
        <span className="text-xs font-medium text-neutral-800 truncate">
          {author}
        </span>
      </div>

      {/* 게시글 제목 */}
      <p className="text-sm font-semibold text-neutral-900 leading-snug px-0.5 truncate">
        {title}
      </p>
    </div>
  );
}

// 섹션 컴포넌트 (모바일 1열 -> 태블릿 3열 -> PC 5열)
function Section({
  badgeText,
  description,
  aspect = "aspect-square",
}: {
  badgeText: string;
  description: string;
  aspect?: string;
}) {
  return (
    <section className="flex flex-col gap-4">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="bg-[#9BB8F9] text-white text-sm md:text-lg font-black px-3.5 py-1 rounded-md tracking-tight shadow-sm">
            {badgeText}
          </div>
          <span className="text-neutral-600 text-xs md:text-sm font-medium hidden sm:inline">
            {description}
          </span>
        </div>
        <button className="bg-[#3D7BF6] hover:bg-blue-600 text-white text-xs md:text-sm font-bold px-3.5 md:px-4 py-1.5 rounded-xl transition shrink-0 shadow-sm">
          더보기
        </button>
      </div>

      {/* 모바일 1열 -> 태블릿 3열 -> PC 5열 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <ItemCard key={item} aspect={aspect} />
        ))}
      </div>
    </section>
  );
}

export default function MainPage() {
  return (
    <div className="min-h-screen bg-[#D8EBFC] flex flex-col font-sans">

      {/* 2. 메인 컨텐츠 영역 */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-10">
        {/* 메인 히어로 모션 그래픽 자리 (반응형 집 모양) */}
        <div className="w-full flex justify-center py-2">
          <div className="w-full max-w-3xl aspect-4/3 bg-[#F7F3EC] shadow-inner flex items-center justify-center [clip-path:polygon(50%_0%,100%_25%,100%_100%,0%_100%,0%_25%)]">
            <span className="text-neutral-400 font-medium text-sm">
              🏡 메인 모션 그래픽 영역
            </span>
          </div>
        </div>

        {/* 3. 에디터 PICK 코너들 */}
        {/* 에디터 PICK 파티 (포스터 1:1.414 비율) */}
        <Section
          badgeText="에디터 PICK 파티"
          description="매주 월요일 오전 에디터가 엄선해서 고른 추천 파티가 업데이트 됩니다."
          aspect="aspect-[1/1.414]"
        />

        {/* 에디터 PICK 컨텐츠 (1:1 정사각형 비율) */}
        <Section
          badgeText="에디터 PICK 컨텐츠"
          description="매주 월요일 오전 에디터가 엄선해서 고른 추천 컨텐츠가 업데이트 됩니다."
          aspect="aspect-square"
        />

        {/* 에디터 PICK 초대장 (1:1 정사각형 비율) */}
        <Section
          badgeText="에디터 PICK 초대장"
          description="매주 월요일 오전 에디터가 엄선해서 고른 추천 초대장이 업데이트 됩니다."
          aspect="aspect-square"
        />
      </main>
    </div>
  );
}