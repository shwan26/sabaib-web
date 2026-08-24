import BillExperience from "@/components/bill-experience";

export default async function BillPaymentPage({ params }: PageProps<"/bill/[code]/payment">) {
  const { code } = await params;
  return <BillExperience code={code} step="payment" />;
}
