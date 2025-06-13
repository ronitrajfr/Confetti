import { DiscordSidebar } from "~/components/members-sidebar";
import { checkMembership } from "~/actions/check-membership";
export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { isMember } = await checkMembership(id);
  console.log(isMember);

  if (!isMember) {
    return <div>you are not fucking part of this server</div>;
  }

  return (
    <div className="=">
      <p>subConfettichannel ID: {id}</p>
      <DiscordSidebar channelId={id} />
    </div>
  );
}
