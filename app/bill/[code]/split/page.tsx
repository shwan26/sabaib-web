import BillExperience from "@/components/bill-experience";

export default async function BillSplitPage({ params }: PageProps<"/bill/[code]/split">) {
  const { code } = await params;
  return <BillExperience code={code} step="split" />;
}
