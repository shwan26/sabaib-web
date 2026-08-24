import { redirect } from "next/navigation";

export default async function BillPaymentPage({ params }: PageProps<"/b/[code]/payment">) {
  const { code } = await params;
  redirect(`/bill/${code}/payment`);
}
