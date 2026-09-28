"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ThemeTab from "@/app/components/settings/ThemeTab";
import { MOCK_USERS } from "@/app/data/mockUsers";

// 프리셋 아바타 목록
const PRESET_AVATARS = [
  { id: "green-d", bg: "#2E5A36", text: "d", label: "포레스트 그린" },
  { id: "pink-flower", bg: "#D97D88", text: "🌸", label: "코랄 핑크" },
  { id: "blue-cloud", bg: "#4A7C9B", text: "☁️", label: "스카이 블루" },
  { id: "butter-star", bg: "#E6BA54", text: "✨", label: "버터 옐로우" },
  { id: "purple-grape", bg: "#6E5B8E", text: "🍇", label: "라벤더 퍼플" },
  { id: "brown-coffee", bg: "#7A5A43", text: "☕", label: "모카 브라운" },
];

// 이미 사용 중인 닉네임 목록 (중복 테스트용)
const TAKEN_NICKNAMES = ["콩콩", "admin", "초록", "관리자", "마을사람"];

function SettingsContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "profile";

  // 0. 현재 로그인한 유저 ID
  const [currentUserId, setCurrentUserId] = useState("dang");

  // 1. 프로필 아바타 상태
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState(PRESET_AVATARS[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. 닉네임 상태 및 유효성
  const [nickname, setNickname] = useState("당당");
  const [isNicknameTouched, setIsNicknameTouched] = useState(false);

  // 3. 이메일 및 인증 상태
  const [email, setEmail] = useState("dang@gmail.com");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(180); // 3분 = 180초
  const [isEmailVerified, setIsEmailVerified] = useState(true); // 기본 상태는 기존 인증됨으로 시작
  const [emailTouched, setEmailTouched] = useState(false);

  // 4. 내 집 이름 상태
  const [houseName, setHouseName] = useState("당당이네 집");

  // 초기 데이터 로드 (localStorage)
  useEffect(() => {
    try {
      const savedUserId = localStorage.getItem("current_user_id") || "dang";
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage는 마운트 후에만 읽을 수 있음 (하이드레이션 불일치 방지)
      setCurrentUserId(savedUserId);
      const userObj = MOCK_USERS.find((u) => u.id === savedUserId);

      const savedNick = localStorage.getItem("user_nickname");
      if (savedNick) {
        setNickname(savedNick);
      } else if (userObj) {
        setNickname(userObj.name);
      }

      // 현재 로그인한 유저의 집 이름 로드 (user_id 기반 동적 키)
      const savedHouse = localStorage.getItem(`house_name_${savedUserId}`);
      if (savedHouse) {
        setHouseName(savedHouse);
      } else if (userObj) {
        setHouseName(userObj.houseName);
      } else {
        const legacyDang = localStorage.getItem("house_name_dang");
        if (legacyDang && savedUserId === "dang") setHouseName(legacyDang);
      }

      const savedEmail = localStorage.getItem("user_email");
      if (savedEmail) {
        setEmail(savedEmail);
      } else if (userObj) {
        setEmail(userObj.email);
      }

      const savedAvatar = localStorage.getItem("user_avatar");
      if (savedAvatar) {
        if (savedAvatar.startsWith("preset:")) {
          const found = PRESET_AVATARS.find((p) => p.id === savedAvatar.replace("preset:", ""));
          if (found) setSelectedPreset(found);
        } else {
          setAvatarImage(savedAvatar);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // 이메일 타이머 카운트다운
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isCodeSent && !isEmailVerified && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCodeSent, isEmailVerified, timerSeconds]);

  // 타이머 형식 변환 (MM:SS)
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // 닉네임 유효성 검사 로직
  const getNicknameError = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return "닉네임을 입력해 주세요.";
    if (trimmed.length < 2 || trimmed.length > 10) return "닉네임은 2~10자로 입력해야 합니다.";
    // 특수문자 제한 (한글, 영문, 숫자만 허용)
    const regex = /^[a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ]+$/;
    if (!regex.test(trimmed)) return "닉네임에는 한글, 영문, 숫자만 사용할 수 있습니다.";
    // 중복 닉네임 검사
    if (TAKEN_NICKNAMES.includes(trimmed)) return "이미 사용 중인 닉네임입니다.";
    return null;
  };

  const nicknameError = getNicknameError(nickname);
  const isNicknameValid = !nicknameError;

  // 이메일 유효성 검사
  const isValidEmailFormat = (val: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(val.trim());
  };

  // 이미지 업로드 처리
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 인증번호 전송 처리
  const handleSendCode = () => {
    if (!isValidEmailFormat(email)) {
      alert("올바른 이메일 주소를 입력해 주세요.");
      return;
    }
    setIsCodeSent(true);
    setIsEmailVerified(false);
    setTimerSeconds(180);
    alert(`인증번호가 ${email}으로 발송되었습니다. (테스트 번호: 123456)`);
  };

  // 인증번호 확인 처리
  const handleVerifyCode = () => {
    if (timerSeconds <= 0) {
      alert("인증 시간이 만료되었습니다. 다시 시도해 주세요.");
      return;
    }
    if (authCode.trim() === "123456" || authCode.trim().length === 6) {
      setIsEmailVerified(true);
      alert("이메일 인증이 성공적으로 완료되었습니다!");
    } else {
      alert("인증번호 6자리를 올바르게 입력해 주세요. (테스트 번호: 123456)");
    }
  };

  // 저장 버튼 활성화 조건: 닉네임 유효 + 이메일 인증 완료 + 집 이름 입력 완료
  const canSave = isNicknameValid && isEmailVerified && houseName.trim().length > 0;

  // 전체 저장 처리
  const handleSave = () => {
    if (!canSave) return;

    try {
      localStorage.setItem("user_nickname", nickname.trim());
      // 현재 로그인한 유저의 고유 키에 집 이름 저장
      localStorage.setItem(`house_name_${currentUserId}`, houseName.trim());
      if (currentUserId === "dang") {
        localStorage.setItem("house_name_dang", houseName.trim());
      }
      localStorage.setItem("user_email", email.trim());

      if (avatarImage) {
        localStorage.setItem("user_avatar", avatarImage);
      } else {
        localStorage.setItem("user_avatar", `preset:${selectedPreset.id}`);
      }

      // 커스텀 이벤트 발생시켜 사이드바와 하우스 헤더 즉각 갱신
      window.dispatchEvent(new Event("user_profile_updated"));
      window.dispatchEvent(new Event("storage"));

      alert("프로필 정보가 성공적으로 저장되었습니다!");
    } catch {
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FFFDF8] px-8 md:px-16 py-10 font-sans flex flex-col">
      {/* 상단 탭 헤더 타이틀 */}
      <h1 className="text-xl md:text-2xl font-black text-neutral-900 mb-8">
        {currentTab === "profile" && "프로필"}
        {currentTab === "theme" && "테마"}
        {currentTab === "bookmark" && "저장"}
        {currentTab === "security" && "계정 및 보안"}
      </h1>

      {currentTab === "profile" ? (
        <div className="flex flex-col gap-10 max-w-xl">
          {/* 1. 아바타 설정 영역 */}
          <div className="flex items-center gap-6">
            {/* 현재 적용된 아바타 뷰 */}
            <div className="relative group">
              <div
                style={{ backgroundColor: avatarImage ? "transparent" : selectedPreset.bg }}
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-inner border border-black/5"
              >
                {avatarImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarImage} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                  selectedPreset.text
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* 변경 / 프리셋 선택 버튼 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-full border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-black/5 transition cursor-pointer"
                >
                  사진 업로드
                </button>
                {avatarImage && (
                  <button
                    type="button"
                    onClick={() => setAvatarImage(null)}
                    className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-700 font-medium transition cursor-pointer"
                  >
                    삭제
                  </button>
                )}
              </div>

              {/* 기본 컬러 프리셋 팔레트 */}
              <div className="flex items-center gap-1.5 pt-1">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.label}
                    onClick={() => {
                      setSelectedPreset(preset);
                      setAvatarImage(null);
                    }}
                    style={{ backgroundColor: preset.bg }}
                    className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                      !avatarImage && selectedPreset.id === preset.id
                        ? "ring-2 ring-neutral-900 scale-110"
                        : "hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 2. 입력 폼 영역 */}
          <div className="flex flex-col gap-6 text-sm">
            {/* 닉네임 행 */}
            <div className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] items-start gap-4">
              <label className="font-bold text-neutral-800 pt-2 shrink-0 select-none">
                닉네임
              </label>
              <div className="flex flex-col">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setIsNicknameTouched(true);
                  }}
                  placeholder="2~10자 한글, 영문, 숫자"
                  className="w-full bg-transparent border-b border-neutral-300 focus:border-neutral-900 py-1.5 outline-none font-medium text-neutral-900 placeholder:text-neutral-400 transition"
                  maxLength={10}
                />
                <div className="h-6 flex items-center">
                  {isNicknameTouched && nicknameError ? (
                    <span className="text-xs text-red-500 font-medium">{nicknameError}</span>
                  ) : isNicknameTouched && isNicknameValid ? (
                    <span className="text-xs text-green-600 font-medium">사용 가능한 닉네임입니다.</span>
                  ) : (
                    <span className="text-xs text-neutral-400">2~10자의 한글, 영문, 숫자를 사용할 수 있습니다.</span>
                  )}
                </div>
              </div>
            </div>

            {/* 이메일 및 인증 행 */}
            <div className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] items-start gap-4">
              <label className="font-bold text-neutral-800 pt-2 shrink-0 select-none">
                이메일
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailTouched(true);
                      setIsEmailVerified(false);
                      setIsCodeSent(false);
                    }}
                    placeholder="이메일 주소를 입력하세요."
                    className="flex-1 bg-transparent border-b border-neutral-300 focus:border-neutral-900 py-1.5 outline-none font-medium text-neutral-900 placeholder:text-neutral-400 transition"
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    className="px-3.5 py-1.5 rounded-full border border-neutral-300 hover:border-neutral-900 text-xs font-bold text-neutral-700 hover:text-black transition cursor-pointer shrink-0"
                  >
                    {isEmailVerified ? "재인증" : isCodeSent ? "재전송" : "인증요청"}
                  </button>
                </div>

                {/* 인증번호 입력 필드 (인증 요청 후 노출) */}
                {isCodeSent && !isEmailVerified && (
                  <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={authCode}
                        onChange={(e) => setAuthCode(e.target.value)}
                        placeholder="인증번호 6자리"
                        className="w-full bg-transparent border-b border-neutral-300 focus:border-neutral-900 py-1 outline-none text-xs font-medium text-neutral-900 placeholder:text-neutral-400"
                        maxLength={6}
                      />
                      <span className="absolute right-1 top-1 text-[11px] font-mono text-red-500 font-bold">
                        {formatTimer(timerSeconds)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      className="px-3.5 py-1 rounded-full bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition cursor-pointer shrink-0 shadow-2xs"
                    >
                      확인
                    </button>
                  </div>
                )}

                {/* 상태 안내 메시지 */}
                <div className="h-5 flex items-center">
                  {isEmailVerified ? (
                    <span className="text-xs text-green-600 font-medium">✓ 이메일 인증이 완료되었습니다.</span>
                  ) : isCodeSent ? (
                    <span className="text-xs text-neutral-500 font-normal">이메일로 전송된 6자리 번호를 입력해주세요.</span>
                  ) : emailTouched && !isValidEmailFormat(email) ? (
                    <span className="text-xs text-red-500 font-medium">유효한 이메일 형식이 아닙니다.</span>
                  ) : (
                    <span className="text-xs text-neutral-400">중요 알림 및 비밀번호 재설정에 사용됩니다.</span>
                  )}
                </div>
              </div>
            </div>

            {/* 내 집 이름 행 */}
            <div className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] items-start gap-4">
              <label className="font-bold text-neutral-800 pt-2 shrink-0 select-none">
                내 집 이름
              </label>
              <div className="flex flex-col">
                <input
                  type="text"
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                  placeholder="내 집 이름을 입력하세요."
                  className="w-full bg-transparent border-b border-neutral-300 focus:border-neutral-900 py-1.5 outline-none font-medium text-neutral-900 placeholder:text-neutral-400 transition"
                  maxLength={20}
                />
                <div className="h-6 flex items-center">
                  <span className="text-xs text-neutral-400">
                    * 하우스 상단 헤더에 실시간 반영되는 타이틀입니다.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 하단 [ 저장 ] 버튼 */}
          <div className="pt-6">
            <button
              type="button"
              disabled={!canSave}
              onClick={handleSave}
              className={`px-8 py-2.5 rounded-full text-xs md:text-sm font-black transition-all duration-200 shadow-sm ${
                canSave
                  ? "bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer hover:shadow-md active:scale-95"
                  : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
              }`}
            >
              저장
            </button>
          </div>
        </div>
      ) : currentTab === "theme" ? (
        <ThemeTab />
      ) : (
        /* 저장, 계정 및 보안 준비 중 화면 */
        <div className="py-28 text-center text-xs md:text-sm font-medium text-neutral-400 max-w-xl mx-auto w-full">
          {currentTab === "bookmark" && "저장된 보관함 목록 준비 중입니다."}
          {currentTab === "security" && "계정 및 보안 설정 화면 준비 중입니다."}
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-neutral-400">불러오는 중...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
