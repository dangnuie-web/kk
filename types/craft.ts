export interface CraftInvitationTemplate {
  id: string | number;
  title: string;
  author: string;
  authorId?: string;
  coverImage?: string; // 148*100 PNG dataURL or file path
  coverType?: "pot" | "heart" | "book" | "house" | "custom";
  paperBgColor: string; // 기본 편지지 배경색 (default #f3e9e0)
  paperBgImage?: string; // 148*40 세로 반복 타일 이미지
  cardFrameType: "rounded" | "sliced"; // 기본 라운딩 박스 vs 3피스 슬라이스
  cardFrameColor?: string; // 라운딩 박스 색상 (#f3e9e0 등)
  cardSliceTop?: string; // 상단 캡 PNG
  cardSliceBody?: string; // 본문 늘림 타일링 PNG
  cardSliceBottom?: string; // 하단 캡 PNG
  customBullet?: string; // 식순용 미니 PNG 아이콘
  bulletIconType?: string;
  fontFamily: string; // 'Paperlogy', 'Pretendard', etc.
  fontColor: string; // 폰트 및 선 색상 (default #87451E)
  footerImage?: string; // 148*50 하단 PNG
  createdAt?: number;
}

export interface CategorySeal {
  id: string | number;
  name: string;
  image?: string;
  emoji?: string;
  color?: string;
}

// ⭐️ 기본 프리셋 템플릿 목록 (스크린샷 기반)
export const DEFAULT_CRAFT_TEMPLATES: CraftInvitationTemplate[] = [
  {
    id: "pot-tea-time",
    title: "티타임",
    author: "당당",
    authorId: "dang",
    coverImage: "/icons/pot.png",
    coverType: "pot",
    paperBgColor: "#f3e9e0",
    cardFrameType: "rounded",
    cardFrameColor: "#ffffffa0",
    customBullet: "/icons/pot.png",
    bulletIconType: "pot",
    fontFamily: "Paperlogy",
    fontColor: "#87451E",
    createdAt: 1,
  },
  {
    id: "pink-cupid",
    title: "큐피드",
    author: "당당",
    authorId: "dang",
    coverType: "heart",
    paperBgColor: "#fcefed",
    cardFrameType: "rounded",
    cardFrameColor: "#fff5f5c0",
    fontFamily: "Paperlogy",
    fontColor: "#C53030",
    createdAt: 2,
  },
  {
    id: "reading-book",
    title: "독서",
    author: "당당",
    authorId: "dang",
    coverType: "book",
    paperBgColor: "#eef3ed",
    cardFrameType: "rounded",
    cardFrameColor: "#f4f8f3c0",
    fontFamily: "Paperlogy",
    fontColor: "#2F5233",
    createdAt: 3,
  },
  {
    id: "our-house",
    title: "우리집",
    author: "당당",
    authorId: "dang",
    coverImage: "/icons/house.png",
    coverType: "house",
    paperBgColor: "#fbf2ea",
    cardFrameType: "rounded",
    cardFrameColor: "#fff8f2c0",
    fontFamily: "Paperlogy",
    fontColor: "#87451E",
    createdAt: 4,
  },
  {
    id: "christmas-invitation",
    title: "크리스 마스 초대장",
    author: "당당",
    authorId: "dang",
    coverType: "custom",
    paperBgColor: "#f3e9e0",
    cardFrameType: "rounded",
    cardFrameColor: "#ffffffa0",
    fontFamily: "Paperlogy",
    fontColor: "#87451E",
    createdAt: 5,
  },
];

// ⭐️ 카테고리 씰(우표) 프리셋 목록
export const PRESET_SEALS: CategorySeal[] = [
  {
    id: "seal-dog-1",
    name: "해피 퍼피 씰",
    emoji: "🐶",
    color: "#2ea043",
  },
  {
    id: "seal-dog-2",
    name: "하트 퍼피 씰",
    emoji: "💚",
    color: "#38A169",
  },
  {
    id: "seal-dog-3",
    name: "튤립 퍼피 씰",
    emoji: "🌷",
    color: "#E53E3E",
  },
  {
    id: "seal-dog-4",
    name: "플라워 퍼피 씰",
    emoji: "🌸",
    color: "#D69E2E",
  },
];

