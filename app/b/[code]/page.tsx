import { redirect } from "next/navigation";

export default async function JoinBillPage({ params }: PageProps<"/b/[code]">) {
  const { code } = await params;
  redirect(`/join/${code}`);
}
