"use client";

import React, { useState, useEffect } from "react";
import { MOCK_USERS, UserProfile } from "@/app/data/mockUsers";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userId: string, targetPath?: string) => void;
  noticeMessage?: string;
  initialMode?: "LOGIN" | "SIGNUP";
}

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  noticeMessage,
  initialMode = "LOGIN",
}: LoginModalProps) {
  const [mode, setMode] = useState<"LOGIN" | "SIGNUP">(initialMode);

  // 로그인 폼 상태
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // 회원가입 폼 상태
  const [signupUserId, setSignupUserId] = useState("");
  const [signupUserIdTouched, setSignupUserIdTouched] = useState(false);

  const [signupPassword, setSignupPassword] = useState("");
  const [signupPasswordTouched, setSignupPasswordTouched] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [signupNickname, setSignupNickname] = useState("");
  const [signupNicknameTouched, setSignupNicknameTouched] = useState(false);

  // 모달이 열릴 때마다 모드 및 폼 초기화 (이전 props와 비교하여 렌더 중에 리셋)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialMode, setPrevInitialMode] = useState(initialMode);
  if (isOpen !== prevIsOpen || initialMode !== prevInitialMode) {
    setPrevIsOpen(isOpen);
    setPrevInitialMode(initialMode);
    if (isOpen) {
      setMode(initialMode);
      setSignupUserId("");
      setSignupUserIdTouched(false);
      setSignupPassword("");
      setSignupPasswordTouched(false);
      setShowSignupPassword(false);
      setSignupNickname("");
      setSignupNicknameTouched(false);
      setLoginEmail("");
      setLoginPassword("");
      setShowLoginPassword(false);
    }
  }

  // ESC 키 누르면 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 1. 로그인 제출
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = loginEmail ? loginEmail.split("@")[0].trim().toLowerCase() : "dang";
    onLoginSuccess(user);
    onClose();
  };

  // 2. 빠른 테스트 계정 전환 핸들러
  const handleQuickSwitchUser = (user: UserProfile) => {
    try {
      localStorage.setItem("user_nickname", user.name);
      localStorage.setItem("user_email", user.email);
      localStorage.setItem(`house_name_${user.id}`, user.houseName);
      if (user.id === "dang") {
        localStorage.setItem("house_name_dang", user.houseName);
      }
      localStorage.setItem("current_user_id", user.id);
      window.dispatchEvent(new Event("user_profile_updated"));
    } catch {
      // ignore
    }

    onLoginSuccess(user.id);
    onClose();
  };

  // 실시간 유효성 검사 로직 (아이디, 비밀번호, 닉네임)
  const isUserIdTaken = (id: string) => {
    const lower = id.toLowerCase().trim();
    const mockTaken = MOCK_USERS.some((u) => u.id.toLowerCase() === lower);
    try {
      const saved = localStorage.getItem("registered_users");
      if (saved) {
        const list: { id?: string }[] = JSON.parse(saved);
        if (list.some((u) => u.id?.toLowerCase() === lower)) return true;
      }
    } catch {}
    return mockTaken;
  };

  const getUserIdError = (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return "아이디를 입력해 주세요.";
    if (/[^a-zA-Z0-9]/.test(trimmed)) return "영문과 숫자만 사용할 수 있습니다.";
    if (trimmed.length < 4 || trimmed.length > 12) return "4~12자리로 입력해 주세요.";
    if (isUserIdTaken(trimmed)) return "이미 사용 중인 아이디입니다.";
    return null;
  };

  const userIdError = getUserIdError(signupUserId);
  const isUserIdValid = !userIdError;

  const isPasswordValid = signupPassword.length >= 4;
  const isNicknameValid =
    signupNickname.trim().length >= 2 && signupNickname.trim().length <= 10;

  // 필수 3개 항목 통과 시 가입 버튼 활성화
  const canSubmitSignup = isUserIdValid && isPasswordValid && isNicknameValid;

  // 3. 회원가입 제출 (집 이름은 '[닉네임]이네 집' 자동 지정, 즉시 가입 완료 및 메인 이동)
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitSignup) return;

    const trimmedId = signupUserId.trim().toLowerCase();
    const trimmedNick = signupNickname.trim();
    const autoHouseName = `${trimmedNick}이네 집`;

    try {
      // 1. 유저 프로필 로컬 저장
      localStorage.setItem("current_user_id", trimmedId);
      localStorage.setItem("user_nickname", trimmedNick);
      localStorage.setItem(`house_name_${trimmedId}`, autoHouseName);
      if (trimmedId === "dang") {
        localStorage.setItem("house_name_dang", autoHouseName);
      }
      localStorage.setItem("is_logged_in", "true");

      // 2. 가입 유저 목록에 등록
      const newUser: UserProfile = {
        id: trimmedId,
        name: trimmedNick,
        email: `${trimmedId}@knockknock.com`,
        houseName: autoHouseName,
        avatarBg: "#9BB8F9",
        subscribedCount: 0,
        guestCount: 0,
      };

      const prevRegistered = localStorage.getItem("registered_users");
      const list = prevRegistered ? JSON.parse(prevRegistered) : [];
      localStorage.setItem("registered_users", JSON.stringify([...list, newUser]));

      if (!MOCK_USERS.some((u) => u.id === trimmedId)) {
        MOCK_USERS.push(newUser);
      }

      window.dispatchEvent(new Event("auth_state_changed"));
      window.dispatchEvent(new Event("user_profile_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch {
      // ignore
    }

    // 가입 완료 안내 및 보안 알림
    alert(
      `${trimmedNick}님, 환영합니다! 회원가입이 완료되었습니다.\n(보안을 위해 '설정 > 계정 및 보안'에서 이메일 인증을 진행해 주세요.)`
    );

    // 가입 완료 즉시 로그인 처리 후 메인 화면으로 이동
    onLoginSuccess(trimmedId, "/");
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 animate-in fade-in duration-200"
    >
      {/* 모달 카드 컨테이너 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[360px] md:w-[410px] bg-[#FFFDF8] rounded-[32px] p-7 md:p-8 shadow-2xl flex flex-col items-center gap-4 border border-black/5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
      >
        {/* 상단: 집 모양 실루엣 아이콘 + KK 로고 */}
        <div className="flex flex-col items-center gap-1 pt-1">
          {/* 집 아이콘 */}
          <svg
            className="w-9 h-9 text-neutral-900"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
          </svg>

          {/* 볼드 텍스트 로고 'KK' */}
          <span className="text-3xl font-black text-neutral-900 tracking-tighter leading-none select-none">
            KK
          </span>

          {/* 안내 슬로건 / 타이틀 */}
          <p className="text-xs text-neutral-600 font-medium tracking-tight mt-0.5 text-center">
            {mode === "LOGIN"
              ? "가장 편안한 공간으로의 다정한 초대"
              : "가입하고 나만의 집을 만들어 보세요."}
          </p>
        </div>

        {/* 세션 만료 또는 권한 안내 메시지 (로그인 모드 시 조건부 노출) */}
        {mode === "LOGIN" && noticeMessage && (
          <div className="w-full bg-amber-50 border border-amber-200/80 text-amber-900 px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-2">
            <span className="text-sm">🔔</span>
            <span className="font-bold leading-tight">{noticeMessage}</span>
          </div>
        )}

        {mode === "LOGIN" ? (
          /* 1. 로그인 폼 */
          <form onSubmit={handleLoginSubmit} className="w-full flex flex-col gap-3.5 pt-1">
            {/* 이메일 또는 아이디 입력창 */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs font-bold text-neutral-800 px-1">
                아이디 또는 이메일
              </label>
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="아이디 또는 이메일을 입력해주세요."
                className="w-full rounded-2xl bg-neutral-100/80 border border-neutral-200/50 px-4 py-2.5 text-sm placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:bg-white transition"
              />
            </div>

            {/* 비밀번호 입력창 (+ 보기 토글) */}
            <div className="flex flex-col gap-1 text-left">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-bold text-neutral-800">
                  비밀번호
                </label>
                <button
                  type="button"
                  onClick={() => alert("비밀번호 재설정 링크가 이메일로 전송되었습니다 (테스트 안내)")}
                  className="text-[11px] text-neutral-500 hover:text-neutral-900 font-medium cursor-pointer"
                >
                  비밀번호 찾기
                </button>
              </div>
              <div className="relative w-full">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="비밀번호를 입력해주세요."
                  className="w-full rounded-2xl bg-neutral-100/80 border border-neutral-200/50 px-4 py-2.5 pr-10 text-sm placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 transition cursor-pointer"
                  title={showLoginPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  {showLoginPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* 너비 100% 검정 라운드 [로그인] 버튼 */}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-full text-sm font-bold hover:bg-neutral-800 transition active:scale-[0.99] shadow-sm cursor-pointer mt-1"
            >
              로그인
            </button>

            {/* 하단 텍스트 링크: 회원가입 모드로 전환 */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => setMode("SIGNUP")}
                className="text-xs text-neutral-600 font-medium hover:underline hover:text-black transition cursor-pointer"
              >
                계정이 없으신가요? 간편 회원가입
              </button>
            </div>
          </form>
        ) : (
          /* 2. 회원가입 폼: 아이디, 비밀번호(+보기 토글), 닉네임 초간편 3필드 */
          <form onSubmit={handleSignupSubmit} className="w-full flex flex-col gap-3 pt-1">
            
            {/* (1) 아이디 (영문 소문자/숫자 4~12자, 실시간 중복/형식 검사) */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs font-bold text-neutral-800 px-1 flex items-center justify-between">
                <span>아이디<span className="text-red-500 ml-0.5">*</span></span>
                <span className="text-[10px] font-normal text-neutral-400">영문 소문자/숫자 4~12자</span>
              </label>
              <input
                type="text"
                value={signupUserId}
                onChange={(e) => {
                  setSignupUserId(e.target.value);
                  setSignupUserIdTouched(true);
                }}
                placeholder="영문 소문자, 숫자 4~12자"
                className={`w-full rounded-2xl bg-neutral-100/80 border px-4 py-2.5 text-sm placeholder:text-neutral-400 outline-none transition ${
                  signupUserIdTouched && signupUserId
                    ? isUserIdValid
                      ? "border-green-500 bg-white"
                      : "border-red-400 bg-white"
                    : "border-neutral-200/50 focus:border-neutral-900 focus:bg-white"
                }`}
                maxLength={12}
                autoComplete="off"
              />
              {signupUserIdTouched && signupUserId && (
                <span className={`text-[11px] px-1 font-medium ${isUserIdValid ? "text-green-600" : "text-red-500"}`}>
                  {userIdError ? userIdError : "사용 가능한 멋진 아이디입니다! ✓"}
                </span>
              )}
            </div>

            {/* (2) 비밀번호 (4자리 이상 + 우측 비밀번호 보기 토글 아이콘) */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs font-bold text-neutral-800 px-1">
                비밀번호<span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative w-full">
                <input
                  type={showSignupPassword ? "text" : "password"}
                  value={signupPassword}
                  onChange={(e) => {
                    setSignupPassword(e.target.value);
                    setSignupPasswordTouched(true);
                  }}
                  placeholder="4자리 이상 입력해 주세요."
                  className="w-full rounded-2xl bg-neutral-100/80 border border-neutral-200/50 px-4 py-2.5 pr-10 text-sm placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:bg-white transition"
                />
                {/* 비밀번호 보기 토글 아이콘 */}
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 transition cursor-pointer"
                  title={showSignupPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  {showSignupPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  )}
                </button>
              </div>
              {signupPasswordTouched && signupPassword && !isPasswordValid && (
                <span className="text-[11px] px-1 text-red-500 font-medium">
                  비밀번호는 4자리 이상이어야 합니다.
                </span>
              )}
            </div>

            {/* (3) 닉네임 (2~10자) */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs font-bold text-neutral-800 px-1 flex items-center justify-between">
                <span>닉네임<span className="text-red-500 ml-0.5">*</span></span>
                <span className="text-[10px] font-normal text-neutral-400">2~10자</span>
              </label>
              <input
                type="text"
                value={signupNickname}
                onChange={(e) => {
                  setSignupNickname(e.target.value);
                  setSignupNicknameTouched(true);
                }}
                placeholder="사용하실 이름을 입력해 주세요."
                className="w-full rounded-2xl bg-neutral-100/80 border border-neutral-200/50 px-4 py-2.5 text-sm placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:bg-white transition"
                maxLength={10}
              />
              {signupNicknameTouched && signupNickname && !isNicknameValid && (
                <span className="text-[11px] px-1 text-red-500 font-medium">
                  닉네임은 2~10자로 입력해 주세요.
                </span>
              )}
            </div>

            {/* 너비 100% 검정 라운드 [가입하기] 버튼 (3개 필수 통과 시 활성화) */}
            <button
              type="submit"
              disabled={!canSubmitSignup}
              className={`w-full py-3 rounded-full text-sm font-bold transition shadow-sm mt-2 cursor-pointer ${
                canSubmitSignup
                  ? "bg-black hover:bg-neutral-800 text-white active:scale-[0.99]"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              가입하기
            </button>

            {/* 하단 텍스트 링크: 로그인 모드로 복귀 */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => setMode("LOGIN")}
                className="text-xs text-neutral-600 font-medium hover:underline hover:text-black transition cursor-pointer"
              >
                이미 계정이 있으신가요? 로그인
              </button>
            </div>
          </form>
        )}

        {/* 3. 원클릭 빠른 테스트 계정 스위처 & 게스트 둘러보기 */}
        <div className="w-full pt-3.5 border-t border-neutral-200/80 flex flex-col items-center gap-2 mt-0.5">
          <span className="text-[11px] font-bold text-neutral-400 select-none">
            ⚡ 빠른 테스트 계정 선택
          </span>

          {/* 유저 칩 버튼 목록 */}
          <div className="flex flex-wrap justify-center gap-1.5 w-full">
            {MOCK_USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleQuickSwitchUser(user)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-neutral-200/90 hover:border-neutral-900 text-xs font-bold text-neutral-800 transition shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                title={`${user.name} (${user.houseName})`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: user.avatarBg }}
                />
                <span>{user.name}</span>
              </button>
            ))}
          </div>

          {/* 게스트로 둘러보기 버튼 */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-neutral-400 hover:text-neutral-700 underline font-medium cursor-pointer transition"
            >
              로그인 없이 게스트로 둘러보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
