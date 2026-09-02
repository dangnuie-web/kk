// types/house.ts

// 1. 유저 프로필 정보
export interface UserProfile {
  userId: string;
  userName: string;
  followingCount: number;
  followerCount: number;
}

// 2. 댓글 모델 (비밀 댓글 지원)
export interface Comment {
  id: number;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  isSecret: boolean;
}

// 3. 파티에 연동될 컨텐츠 요약
export interface LinkedContent {
  id: number;
  title: string;
  thumbnail: string;
}

// 4. 파티 포스터 게시글 모델
export interface PartyPost {
  id: number;
  userId: string;
  title: string;
  content: string;
  eventDate: string;
  posterImage: string;
  linkedContents?: LinkedContent[];
  comments?: Comment[];
}

// 5. 임시저장 슬롯 (최대 3개)
export interface DraftSlot {
  slotId: 1 | 2 | 3;
  savedAt: string;
  title: string;
  content: string;
  eventDate: string;
  posterImage?: string;
}