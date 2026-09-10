"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import SearchBar, { FilterOptions } from "@/app/components/SearchBar";
import InvitationCard, { CustomSection, ScheduleItem, SealInfo } from "@/app/components/postbox/InvitationCard";
import InvitationModal from "@/app/components/postbox/InvitationModal";

interface InvitationMailItem {
  id: number;
  title: string;
  date: string;
  sender: string;
  bgColor?: string;
  seal?: SealInfo;
  hasStamp?: boolean;
  isAccepted?: boolean;
  partyStartTime?: string;
  partyEndTime?: string;
  location?: string;
  customSections?: CustomSection[];
  schedules?: ScheduleItem[];
  scheduleGlobalMode?: "time" | "bullet";
}

const DEFAULT_RECEIVED: InvitationMailItem[] = [];

export default function HousePostboxPage() {
  const router = useRouter();
  const params = useParams();
  const userId = (params?.userId as string) || "dang";
  const [currentUserId, setCurrentUserId] = useState<string>("dang");
  const isMe = userId === currentUserId;

  const [boxType, setBoxType] = useState<"received" | "created">("received");
  const [receivedMails, setReceivedMails] = useState<InvitationMailItem[]>(DEFAULT_RECEIVED);
  const [createdMails, setCreatedMails] = useState<InvitationMailItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedMail, setSelectedMail] = useState<InvitationMailItem | null>(null);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedUser = localStorage.getItem("current_user_id");
      if (savedUser) setCurrentUserId(savedUser);
      const saved = localStorage.getItem(`sent_invitations_${userId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCreatedMails(
          parsed.map((item: any) => ({
            id: item.id,
            title: item.partyTitle,
            date: item.eventDate,
            sender: "나 (주최자)",
            ...item,
          }))
        );
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

  const handleAcceptReceivedMail = (id: number) => {
    setReceivedMails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isAccepted: true, hasStamp: true } : m))
    );
    if (selectedMail && selectedMail.id === id) {
      setSelectedMail((prev) => (prev ? { ...prev, isAccepted: true, hasStamp: true } : null));
    }
    alert("초대를 수락했습니다! 우체국 소인 도장이 찍혔습니다 📮");
  };

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/house/${userId}/postbox` : "";

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6 font-sans pb-16">
      {/* 상단 툴바: 검색바 + 드롭다운 & 초대장 만들기 버튼 */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SearchBar onSearch={(options: FilterOptions) => setKeyword(options.keyword)} />

        <div className="flex items-center gap-2.5">
          <select
            value={boxType}
            onChange={(e) => setBoxType(e.target.value as "received" | "created")}
            className="bg-white border border-neutral-300 hover:border-neutral-400 rounded-xl px-3 py-2 text-xs font-bold text-neutral-800 shadow-sm outline-none cursor-pointer transition"
          >
            <option value="received">📬 받은 초대장 ({receivedMails.length})</option>
            <option value="created">📮 만든 초대장 ({isMounted ? createdMails.length : 0})</option>
          </select>

          <button
            type="button"
            onClick={() => router.push(`/house/${userId}/postbox/new`)}
            className="text-xs font-black bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 rounded-xl transition shadow-sm shrink-0 cursor-pointer"
          >
            초대장 만들기
          </button>
        </div>
      </div>

      {/* 씰 카드 그리드 (반응형 2 -> 3 -> 4 -> 5열) */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {filtered.map((mail) => {
            if (boxType === "created") {
              return (
                <div
                  key={mail.id}
                  onClick={() => setSelectedMail(mail)}
                  className="aspect-[1/1.2] p-4 flex flex-col items-center justify-between rounded-[6px] relative shadow-sm border border-black/5 hover:scale-[1.02] cursor-pointer transition group"
                  style={{ backgroundColor: mail.bgColor || "#E8E2D5" }}
                >
                  <span className="text-xs font-black text-neutral-800 tracking-wide truncate w-full text-center">
                    {mail.title}
                  </span>

                  <div
                    className="w-16 h-16 rounded-full shadow-md border-2 border-white flex items-center justify-center text-3xl transition-transform group-hover:scale-110"
                    style={{ backgroundColor: mail.seal?.color || "#DD6B20" }}
                  >
                    {mail.seal?.emoji || "💌"}
                  </div>

                  <span className="text-[11px] font-medium text-neutral-500">{mail.date}</span>
                </div>
              );
            }

            return (
              <div
                key={mail.id}
                onClick={() => setSelectedMail(mail)}
                className="aspect-[1/1.2] p-3.5 flex flex-col justify-between border-2 border-dashed border-white/80 relative rounded-[6px] shadow-sm hover:scale-[1.02] cursor-pointer transition group overflow-hidden"
                style={{ backgroundColor: mail.bgColor || "#FFF0F2" }}
              >
                <div className="flex justify-between items-center text-[10px] font-bold text-neutral-700 w-full px-0.5">
                  <span>From. {mail.sender}</span>
                  <span className="text-neutral-400">2026</span>
                </div>

                <div className="w-full flex justify-center py-1">
                  <div
                    className="w-14 h-14 rounded-full shadow-md border-2 border-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: mail.seal?.color || "#FF6B81" }}
                  >
                    {mail.seal?.emoji || "🎂"}
                  </div>
                </div>

                {mail.hasStamp && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-neutral-700/60 flex flex-col items-center justify-center rotate-[-18deg] text-neutral-800/80 bg-white/20 backdrop-blur-[0.5px]">
                      <span className="text-[6px] font-mono tracking-widest font-bold">POST</span>
                      <span className="text-[7px] font-black">ACCEPTED</span>
                    </div>
                  </div>
                )}

                <div className="text-center pt-1.5 border-t border-black/5">
                  <p className="text-xs font-black text-neutral-800 truncate">{mail.title}</p>
                  <span className="text-[10px] text-neutral-500 block">{mail.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center text-xs md:text-sm font-medium text-neutral-400">
          {keyword
            ? "검색 결과가 없습니다."
            : boxType === "received"
            ? "받은 초대장이 없습니다."
            : "만든 초대장이 없습니다."}
        </div>
      )}

      {/* 초대장 상세 모달 */}
      <InvitationModal
        isOpen={Boolean(selectedMail)}
        onClose={() => setSelectedMail(null)}
        title={boxType === "created" ? "📮 내가 만든 초대장" : `📬 ${selectedMail?.sender || "친구"}님의 초대장`}
        description={
          boxType === "created"
            ? "수정하거나 링크를 다시 공유할 수 있습니다."
            : "파티 세부 내용을 확인하고 수락해 보세요."
        }
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
              onLinkClick={(t) => alert(`🔗 '${t}' 콘텐츠로 이동합니다!`)}
            />

            {boxType === "created" ? (
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const id = selectedMail.id;
                    setSelectedMail(null);
                    router.push(`/house/${userId}/postbox/new?edit=${id}`);
                  }}
                  className="w-1/3 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold py-2.5 rounded-xl transition text-xs md:text-sm"
                >
                  초대장 수정
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    alert("초대장 링크가 복사되었습니다! 📋");
                  }}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2.5 rounded-xl transition shadow-sm text-xs md:text-sm"
                >
                  초대장 링크 복사
                </button>
              </div>
            ) : (
              <div className="pt-1">
                {selectedMail.isAccepted ? (
                  <button
                    disabled
                    className="w-full bg-neutral-200 text-neutral-500 font-bold py-2.5 rounded-xl cursor-not-allowed text-xs md:text-sm"
                  >
                    이미 수락 완료된 파티입니다 ✨
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAcceptReceivedMail(selectedMail.id)}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2.5 rounded-xl transition shadow-sm text-xs md:text-sm"
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