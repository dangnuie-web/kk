import { redirect } from "next/navigation";

export default async function UserHouseRedirect({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  redirect(`/house/${userId}/party`);
}