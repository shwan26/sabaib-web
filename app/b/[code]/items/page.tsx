import { redirect } from "next/navigation";

export default async function BillItemsPage({ params }: PageProps<"/b/[code]/items">) {
  const { code } = await params;
  redirect(`/bill/${code}/split`);
}
