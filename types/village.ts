export interface VillageComment {
  id: string | number;
  author: string;
  text: string;
  content?: string;
  createdAt?: number;
}

export interface VillageContentItem {
  id: string | number;
  userId: string;
  userName: string;
  title: string;
  content: string;
  description?: string;
  date?: string;
  type?: string;
  data?: any;
  createdAt: number;
  coverImage: string;
  comments?: VillageComment[];
}

export interface VillagePartyItem {
  id: string | number;
  userId: string;
  userName: string;
  title: string;
  content: string;
  eventDate: string;
  posterImage?: string;
  createdAt: number;
  comments?: VillageComment[];
}