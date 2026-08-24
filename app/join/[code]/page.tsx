import BillExperience from "@/components/bill-experience";

export default async function JoinBillPage({ params }: PageProps<"/join/[code]">) {
  const { code } = await params;
  return <BillExperience code={code} step="join" />;
}
