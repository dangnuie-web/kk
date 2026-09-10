"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import SideNav, { NavMode } from "./SideNav";
import SubPanel from "./SubPanel";
import MobileHeader from "./MobileHeader";
import MobileBottomNav from "./MobileBottomNav";
import LoginModal from "@/app/components/auth/LoginModal";
import { MOCK_USERS } from "@/app/data/mockUsers";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // URL 기반 모드 및 기본 카테고리 판별
  const getModeFromPath = (path: string): NavMode => {
    if (path.startsWith("/village") || path.startsWith("/craft")) return "VILLAGE";
    if (path.startsWith("/house")) return "HOUSE";
    if (path.startsWith("/settings")) return "SETTINGS";
    return "MAIN";
  };

  const [currentMode, setCurrentMode] = useState<NavMode>(getModeFromPath(pathname));
  const [activeCategory, setActiveCategory] = useState<string>("PARTY");
  const [studioSub, setStudioSub] = useState<string>("INVITATION");
  
  // 로그인 상태 및 모달 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | undefined>();
  const [userName, setUserName] = useState<string>("당당");
  const [currentUserId, setCurrentUserId] = useState<string>("dang");

  // 이전 테스트용 목업 게시글 전체 초기화 (1회 실행)
  useEffect(() => {
    try {
      const isCleaned = localStorage.getItem("knock_knock_clean_v3");
      if (!isCleaned) {
        const userIds = ["dang", "kongkong", "mint", "haru", "mori"];
        userIds.forEach((uId) => {
          localStorage.removeItem(`party_posts_${uId}`);
          localStorage.removeItem(`content_posts_${uId}`);
          localStorage.removeItem(`gallery_${uId}`);
          localStorage.removeItem(`sent_invitations_${uId}`);
        });
        localStorage.removeItem("party_posts_dang");
        localStorage.removeItem("content_posts_dang");
        localStorage.removeItem("village_parties_feed");
        localStorage.removeItem("village_bookmarks");
        localStorage.setItem("knock_knock_clean_v3", "true");
        window.dispatchEvent(new Event("storage"));
      }

      // ⭐️ 오염된 house_name_dang 복구
      const dangHouse = localStorage.getItem("house_name_dang");
      if (dangHouse && (dangHouse.includes("콩콩") || dangHouse.includes("민트") || dangHouse.includes("오렌지"))) {
        localStorage.setItem("house_name_dang", "당당이네 집");
      }
    } catch {
      // ignore
    }
  }, []);

  // 초기 로그인 및 프로필 복원
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem("is_logged_in");
      setIsLoggedIn(savedAuth === "true");

      const savedId = localStorage.getItem("current_user_id");
      if (savedId) setCurrentUserId(savedId);

      const savedName = localStorage.getItem("user_nickname");
      if (savedName) setUserName(savedName);
    } catch {
      // ignore
    }

    // 전역 권한 가드 이벤트
    const handleAuthRequired = (e: any) => {
      setNoticeMessage(e.detail?.noticeMessage || "로그인이 필요합니다.");
      setIsLoginModalOpen(true);
    };

    // 전역 세션 만료 이벤트
    const handleSessionExpired = () => {
      setIsLoggedIn(false);
      try {
        localStorage.removeItem("is_logged_in");
      } catch {}
      setNoticeMessage("세션이 만료되었습니다. 다시 로그인해주세요.");
      setIsLoginModalOpen(true);
      router.push("/village");
    };

    const syncUser = () => {
      try {
        const savedId = localStorage.getItem("current_user_id");
        if (savedId) setCurrentUserId(savedId);
        const savedName = localStorage.getItem("user_nickname");
        if (savedName) setUserName(savedName);
        setIsLoggedIn(localStorage.getItem("is_logged_in") === "true");
      } catch {}
    };

    window.addEventListener("auth_required", handleAuthRequired);
    window.addEventListener("session_expired", handleSessionExpired);
    window.addEventListener("auth_state_changed", syncUser);
    window.addEventListener("storage", syncUser);
    window.addEventListener("user_profile_updated", syncUser);

    return () => {
      window.removeEventListener("auth_required", handleAuthRequired);
      window.removeEventListener("session_expired", handleSessionExpired);
      window.removeEventListener("auth_state_changed", syncUser);
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("user_profile_updated", syncUser);
    };
  }, [router]);

  useEffect(() => {
    const mode = getModeFromPath(pathname);
    setCurrentMode(mode);

    // 경로별 기본 활성 카테고리 동기화
    if (pathname.includes("/party")) setActiveCategory("PARTY");
    else if (pathname.includes("/contents")) setActiveCategory("CONTENTS");
    else if (pathname.includes("/gallery")) setActiveCategory("GALLERY");
    else if (pathname.includes("/studio") || pathname.includes("/craft")) {
      setActiveCategory("STUDIO");
      if (pathname.includes("/invitation") || pathname.includes("/craft/editor")) {
        setStudioSub("INVITATION");
      }
    }
    else if (pathname.startsWith("/settings")) {
      const tab = new URLSearchParams(window.location.search).get("tab");
      if (tab === "theme") setActiveCategory("THEME");
      else if (tab === "bookmark") setActiveCategory("BOOKMARK");
      else if (tab === "security") setActiveCategory("SECURITY");
      else setActiveCategory("PROFILE");
    }
  }, [pathname]);

  const handleSelectMode = (mode: NavMode) => {
    if (mode === "SETTINGS" && !isLoggedIn) {
      setNoticeMessage("설정을 변경하려면 로그인이 필요합니다.");
      setIsLoginModalOpen(true);
      return;
    }

    setCurrentMode(mode);
    if (mode === "MAIN") {
      router.push("/");
    } else if (mode === "VILLAGE") {
      setActiveCategory("PARTY");
      router.push("/village?tab=party");
    } else if (mode === "HOUSE") {
      setActiveCategory("PARTY");
      const targetUser = currentUserId || "dang";
      router.push(`/house/${targetUser}/party`);
    } else if (mode === "SETTINGS") {
      setActiveCategory("PROFILE");
      router.push("/settings?tab=profile");
    }
  };

  const handleLoginSuccess = (userId: string, targetPath?: string) => {
    setIsLoggedIn(true);
    setCurrentUserId(userId);
    try {
      localStorage.setItem("is_logged_in", "true");
      localStorage.setItem("current_user_id", userId);
      const found = MOCK_USERS.find((u) => u.id === userId);
      if (found) {
        setUserName(found.name);
        localStorage.setItem("user_nickname", found.name);
        localStorage.setItem("user_email", found.email);
        localStorage.setItem(`house_name_${found.id}`, found.houseName);
        if (found.id === "dang") {
          localStorage.setItem("house_name_dang", found.houseName);
        }
      } else {
        const savedNick = localStorage.getItem("user_nickname");
        if (savedNick) setUserName(savedNick);
      }
    } catch {
      // ignore
    }
    setIsLoginModalOpen(false);
    setNoticeMessage(undefined);
    window.dispatchEvent(new Event("auth_state_changed"));
    window.dispatchEvent(new Event("user_profile_updated"));

    // ⭐️ 회원가입 완료 등 targetPath가 지정되어 있으면 메인 화면 등 해당 경로로 이동
    if (targetPath) {
      if (targetPath === "/") {
        setCurrentMode("MAIN");
      }
      router.push(targetPath);
    } else {
      router.push(`/house/${userId}/party`);
    }
  };

  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);

    if (currentMode === "VILLAGE") {
      if (catId === "STUDIO") {
        router.push("/village/craft/invitation");
      } else {
        router.push(`/village?tab=${catId.toLowerCase()}`);
      }
    } else if (currentMode === "HOUSE") {
      // URL에서 userId 추출 (없으면 기본값 dang)
      const segments = pathname.split("/").filter(Boolean);
      const targetUserId = segments[1] || "dang";
      
      router.push(`/house/${targetUserId}/${catId.toLowerCase()}`);
    } else if (currentMode === "SETTINGS") {
      router.push(`/settings?tab=${catId.toLowerCase()}`);
    }
  };

  const handleSelectStudioSub = (subId: string) => {
    setStudioSub(subId);
    if (subId === "INVITATION") {
      router.push("/village/craft/invitation");
    } else {
      router.push(`/village?tab=studio&sub=${subId.toLowerCase()}`);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row h-screen w-screen overflow-hidden bg-[#E8E6DF]">
      {/* 1. 최좌측 1단 도크 (데스크탑) */}
      <SideNav
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        isLoggedIn={isLoggedIn}
        userName={userName}
        onOpenLoginModal={() => {
          setNoticeMessage(undefined);
          setIsLoginModalOpen(true);
        }}
      />

      {/* 2. 좌측 2단 슬라이딩 서브 패널 (데스크탑) */}
      <SubPanel
        currentMode={currentMode}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        studioSubCategory={studioSub}
        onSelectStudioSub={handleSelectStudioSub}
      />

      {/* 3. 모바일 상단 헤더 & 카테고리 탭 (sm 미만 모바일 전용) */}
      <MobileHeader
        currentMode={currentMode}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        studioSubCategory={studioSub}
        onSelectStudioSub={handleSelectStudioSub}
        onGoHome={() => handleSelectMode("MAIN")}
        isLoggedIn={isLoggedIn}
      />

      {/* 4. 메인 콘텐츠 영역 (모바일에서는 하단 바 높이만큼 pb-20 확보) */}
      <div className="flex-1 h-full overflow-y-auto min-w-0 pb-20 sm:pb-0 bg-[#FFFDF8]">
        {children}
      </div>

      {/* 5. 모바일 하단 네비게이션 도크 (sm 미만 모바일 전용) */}
      <MobileBottomNav
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        isLoggedIn={isLoggedIn}
        onOpenLoginModal={() => {
          setNoticeMessage(undefined);
          setIsLoginModalOpen(true);
        }}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        noticeMessage={noticeMessage}
      />
    </div>
  );
}
