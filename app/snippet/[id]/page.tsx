import { redirect } from "next/navigation";

export default async function SnippetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/s/${id}`);
}
