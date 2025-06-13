import { DiscordSidebar } from "~/components/members-sidebar";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="=">
      <p>subConfettichannel ID: {id}</p>
      <DiscordSidebar channelId={id} />
    </div>
  );
}
