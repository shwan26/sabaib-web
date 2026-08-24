import { redirect } from "next/navigation";

export default async function BillSummaryPage({ params }: PageProps<"/b/[code]/summary">) {
  const { code } = await params;
  redirect(`/bill/${code}/summary`);
}
