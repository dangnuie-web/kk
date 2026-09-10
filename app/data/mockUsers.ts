export interface UserProfile {
  id: string;
  name: string;
  houseName: string;
  email: string;
  subscribedCount: number;
  guestCount: number;
  avatarBg: string;
}

export const MOCK_USERS: UserProfile[] = [
  {
    id: "dang",
    name: "당당",
    houseName: "당당이네 집",
    email: "dang@example.com",
    subscribedCount: 3,
    guestCount: 3,
    avatarBg: "#2B5329",
  },
  {
    id: "kongkong",
    name: "콩콩",
    houseName: "콩콩 하우스",
    email: "kong@example.com",
    subscribedCount: 3,
    guestCount: 3,
    avatarBg: "#8D2F31",
  },
  {
    id: "mint",
    name: "민트",
    houseName: "민트초코 아틀리에",
    email: "mint@example.com",
    subscribedCount: 3,
    guestCount: 3,
    avatarBg: "#4E706A",
  },
  {
    id: "haru",
    name: "하루",
    houseName: "하루의 다락방",
    email: "haru@example.com",
    subscribedCount: 3,
    guestCount: 3,
    avatarBg: "#D97D54",
  },
  {
    id: "mori",
    name: "모리",
    houseName: "숲속 모리네",
    email: "mori@example.com",
    subscribedCount: 3,
    guestCount: 3,
    avatarBg: "#5C6B73",
  },
];