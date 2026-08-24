import BillExperience from "@/components/bill-experience";

export default async function BillSummaryPage({ params }: PageProps<"/bill/[code]/summary">) {
  const { code } = await params;
  return <BillExperience code={code} step="summary" />;
}
