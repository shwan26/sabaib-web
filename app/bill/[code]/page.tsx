import BillExperience from "@/components/bill-experience";

export default async function BillRoomPage({ params }: PageProps<"/bill/[code]">) {
  const { code } = await params;
  return <BillExperience code={code} step="room" />;
}
