"use client";

import React, { use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HouseBanner from "@/app/components/HouseBanner";

export default function HouseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const pathname = usePathname();

  const tabs = [
    { name: "파티", path: `/house/${userId}/party` },
    { name: "콘텐츠", path: `/house/${userId}/contents` },
    { name: "갤러리", path: `/house/${userId}/gallery` },
    { name: "우체통", path: `/house/${userId}/postbox` },
  ];

  return (
    <div className="min-h-screen bg-[#D4E8FE] p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        
        {/* 좌측 사이드바 */}
        <aside className="w-full md:w-56 shrink-0 flex flex-col gap-6">
          <HouseBanner userId={userId} />

          {/* 탭 메뉴 */}
          <nav className="grid grid-cols-2 md:flex md:flex-col gap-2 w-full">
            {tabs.map((tab) => {
              const isActive = pathname.startsWith(tab.path);
              return (
                <Link
                  key={tab.name}
                  href={tab.path}
                  className={`text-base md:text-lg font-black tracking-normal transition-all duration-100 py-1.5 px-3 block w-fit ${
                    isActive
                      ? "bg-[#8CB2F8] text-[#FFFBEB]"
                      : "text-[#543D32] hover:text-[#2D1F17]"
                  }`}
                >
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* 메인 영역 */}
        <main className="flex-1 w-full min-w-0">
          {children}
        </main>

      </div>
    </div>
  );
}