export interface PartyItem {
  id: string;
  title: string;
  date: string;       // 예: "26.10.15.수"
  desc?: string;
  posterBg: string;   // 배경색 HEX 또는 이미지 URL
  posterSticker?: string;
  isCustomImage?: boolean;
}