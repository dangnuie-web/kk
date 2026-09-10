import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function HouseIndexPage({ params }: Props) {
  const { userId } = await params;

  // 집 주소로 진입 시 기본 탭인 party로 자동 이동
  redirect(`/house/${userId || "dang"}/party`);
}