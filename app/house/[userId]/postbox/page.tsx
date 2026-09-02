"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import SelectableGrid, { GridItem } from "@/app/components/SelectableGrid";
import SearchBar, { FilterOptions } from "@/app/components/SearchBar";
import InvitationCard, { CustomSection, ScheduleItem, SealInfo } from "@/app/components/postbox/InvitationCard";
import InvitationModal from "@/app/components/postbox/InvitationModal";

interface InvitationMailItem extends GridItem {
  bg?: string;
  hasStamp?: boolean;
  isAccepted?: boolean;
  bgColor?: string;
  seal?: SealInfo;
  partyStartTime?: string;
  partyEndTime?: string;
  location?: string;
  customSections?: CustomSection[];
  schedules?: ScheduleItem[];
  scheduleGlobalMode?: "time" | "bullet";
}

const DEFAULT_RECEIVED: InvitationMailItem[] = [
  {
    id: 1,
    title: "생일 축하 케이크 파티",
    date: "2026.10.04",
    sender: "초록이",
    bgColor: "#FFF0F2",
    seal: { emoji: "🎂", color: "#FF6B81", name: "케이크 씰" },
    partyStartTime: "14:00",
    partyEndTime: "18:00",
    location: "마포구 연남동 초록이네",
    hasStamp: true,
    isAccepted: true,
    scheduleGlobalMode: "time",
    customSections: [{ id: 101, title: "파티 소개", content: "달콤한 수제 케이크와 함께하는 생일 파티!" }],
    schedules: [{ id: 201, startTime: "14:00", endTime: "15:00", showDuration: true, bulletType: "dash", content: "웰컴 티타임 & 케이크" }],
  },
  {
    id: 2,
    title: "시트러스 홈카페 & 브런치",
    date: "2026.10.05",
    sender: "오렌지",
    bgColor: "#FEF9C3",
    seal: { emoji: "🍊", color: "#F59E0B", name: "오렌지 씰" },
    partyStartTime: "11:30",
    partyEndTime: "14:30",
    location: "용산구 한남동 햇살가득한 집",
    hasStamp: true,
    isAccepted: true,
    scheduleGlobalMode: "time",
    customSections: [{ id: 103, title: "메뉴 안내", content: "직접 착즙한 시트러스 에이드와 브런치" }],
    schedules: [{ id: 204, startTime: "11:30", endTime: "13:00", showDuration: true, bulletType: "dash", content: "브런치 식사" }],
  },
];

export default function HousePostboxPage() {
  const params = useParams();
  const userId = (params?.userId as string) || "dang";
  const router = useRouter();

  const [boxType, setBoxType] = useState<"received" | "created">("received");
  const [receivedMails, setReceivedMails] = useState<InvitationMailItem[]>(DEFAULT_RECEIVED);
  const [createdMails, setCreatedMails] = useState<InvitationMailItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedMail, setSelectedMail] = useState<InvitationMailItem | null>(null);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(`sent_invitations_${userId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCreatedMails(parsed.map((item: any) => ({
          id: item.id,
          title: item.partyTitle,
          date: item.eventDate,
          sender: "나 (주최자)",
          ...item,
        })));
      }
    } catch (e) {
      console.error(e);
    }
  }, [userId]);

  const currentList = boxType === "received" ? receivedMails : createdMails;
  const filtered = currentList.filter((m) => {
    const cleanTitle = (m.title || "").toLowerCase();
    const cleanSender = (m.sender || "").toLowerCase();
    const k = keyword.replace(/\s+/g, "").toLowerCase();
    return cleanTitle.includes(k) || cleanSender.includes(k);
  });

  const gridItems: GridItem[] = filtered.map((mail) => {
    if (boxType === "created") {
      return {
        ...mail,
        customContent: (
          <div
            className="w-full h-full p-3 flex flex-col items-center justify-between rounded-2xl relative shadow-sm border border-black/10 group transition"
            style={{ backgroundColor: mail.bgColor || "#C8AD8D" }}
          >
            <span className="text-[10px] font-black text-black/70 self-start truncate max-w-full">{mail.title}</span>
            <div
              className="w-14 h-14 rounded-full shadow-lg border-2 border-white flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
              style={{ backgroundColor: mail.seal?.color || "#DD6B20" }}
            >
              {mail.seal?.emoji || "💌"}
            </div>
            <span className="text-[9px] font-bold text-neutral-700">{mail.date}</span>
          </div>
        ),
      };
    }

    return {
      ...mail,
      customContent: (
        <div
          className="w-full h-full p-2 flex flex-col justify-between border-2 border-dashed border-white/80 relative rounded-xl shadow-sm"
          style={{ backgroundColor: mail.bgColor || "#FFF0F2" }}
        >
          <div className="flex justify-between text-[8px] font-bold text-neutral-800 leading-none">
            <span>{mail.sender}</span>
            <span>2026</span>
          </div>
          <div className="w-full flex justify-center text-2xl drop-shadow-sm">{mail.seal?.emoji || "🎂"}</div>
          <div className="text-[7px] font-black text-neutral-700 tracking-wider text-center uppercase">Knock Knock</div>
          {mail.hasStamp && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-neutral-700/70 flex flex-col items-center justify-center rotate-[-18deg] text-neutral-800/80 bg-white/20 backdrop-blur-[0.5px]">
                <span className="text-[5px] font-mono tracking-widest">POST</span>
                <span className="text-[6px] font-black">ACCEPTED</span>
              </div>
            </div>
          )}
        </div>
      ),
    };
  });

  const handleDelete = (ids: number[]) => {
    if (boxType === "received") {
      setReceivedMails((prev) => prev.filter((m) => !ids.includes(m.id)));
    } else {
      const next = createdMails.filter((m) => !ids.includes(m.id));
      setCreatedMails(next);
      localStorage.setItem(`sent_invitations_${userId}`, JSON.stringify(next));
    }
  };

  const handleAcceptReceivedMail = (id: number) => {
    setReceivedMails((prev) => prev.map((m) => (m.id === id ? { ...m, isAccepted: true, hasStamp: true } : m)));
    if (selectedMail && selectedMail.id === id) {
      setSelectedMail((prev) => (prev ? { ...prev, isAccepted: true, hasStamp: true } : null));
    }
    alert("초대를 수락했습니다! 우체국 소인 도장이 찍혔습니다 📮");
  };

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/house/${userId}/postbox` : "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SearchBar onSearch={(options: FilterOptions) => setKeyword(options.keyword)} />

        <div className="flex items-center gap-2.5">
          <select
            value={boxType}
            onChange={(e) => setBoxType(e.target.value as any)}
            className="bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-bold text-neutral-800 shadow-sm outline-none cursor-pointer hover:border-neutral-400 transition"
          >
            <option value="received">📬 받은 초대장 ({receivedMails.length})</option>
            <option value="created">📮 만든 초대장 ({isMounted ? createdMails.length : 0})</option>
          </select>

          <Link
            href={`/house/${userId}/postbox/new`}
            className="bg-[#3D7BF6] hover:bg-blue-600 text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-sm shrink-0 flex items-center justify-center"
          >
            초대장 만들기
          </Link>
        </div>
      </div>

      {gridItems.length > 0 ? (
        <SelectableGrid
          items={gridItems}
          aspect="aspect-square"
          gridCols={boxType === "created" ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6" : "grid-cols-2 sm:grid-cols-4 md:grid-cols-7"}
          onItemClick={(item) => setSelectedMail(item as InvitationMailItem)}
          onDelete={handleDelete}
        />
      ) : (
        <div className="py-20 text-center text-sm font-medium text-neutral-400 bg-white/40 rounded-3xl border border-dashed border-neutral-300">
          {boxType === "received" ? "받은 초대장이 없습니다." : "만든 초대장이 없습니다."}
        </div>
      )}

      <InvitationModal
        isOpen={Boolean(selectedMail)}
        onClose={() => setSelectedMail(null)}
        title={boxType === "created" ? "📮 내가 만든 초대장" : `📬 ${selectedMail?.sender || "친구"}님의 초대장`}
        description={boxType === "created" ? "수정하거나 링크를 다시 공유할 수 있습니다." : "파티 세부 내용을 확인하고 수락해 보세요."}
      >
        {selectedMail && (
          <>
            <InvitationCard
              partyTitle={selectedMail.title}
              eventDate={selectedMail.date}
              partyStartTime={selectedMail.partyStartTime}
              partyEndTime={selectedMail.partyEndTime}
              location={selectedMail.location}
              bgColor={selectedMail.bgColor}
              seal={selectedMail.seal}
              customSections={selectedMail.customSections}
              schedules={selectedMail.schedules}
              scheduleGlobalMode={selectedMail.scheduleGlobalMode}
              minHeight="min-h-[420px]"
              onLinkClick={(title) => alert(`🔗 '${title}' 콘텐츠로 이동합니다!`)}
            />

            {boxType === "created" ? (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    const id = selectedMail.id;
                    setSelectedMail(null);
                    router.push(`/house/${userId}/postbox/new?edit=${id}`);
                  }}
                  className="w-1/3 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold py-3 rounded-xl transition text-xs md:text-sm"
                >
                  ✏️ 초대장 수정
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    alert("초대장 링크가 복사되었습니다! 📋");
                  }}
                  className="flex-1 bg-[#3D7BF6] hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition shadow text-xs md:text-sm"
                >
                  📋 초대장 링크 복사
                </button>
              </div>
            ) : (
              <div className="pt-1">
                {selectedMail.isAccepted ? (
                  <button disabled className="w-full bg-neutral-200 text-neutral-500 font-bold py-3 rounded-xl cursor-not-allowed text-xs md:text-sm">
                    이미 수락 완료된 파티입니다 ✨
                  </button>
                ) : (
                  <button
                    onClick={() => handleAcceptReceivedMail(selectedMail.id)}
                    className="w-full bg-[#3D7BF6] hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition shadow-md text-xs md:text-sm"
                  >
                    초대 수락하기 (소인 도장 찍기) 📮
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </InvitationModal>
    </div>
  );
}