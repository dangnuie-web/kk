export interface VillageContentItem {
  id: string | number;
  userId: string;
  userName: string;
  title: string;
  content: string;
  createdAt: number;
  coverImage: string;
  comments?: VillageComment[];
}