import { DiscordSidebar } from "~/components/members-sidebar";
import { checkMembership } from "~/actions/check-membership";
import JoinChannelModal from "~/components/join-channel-modal";
import { auth } from "~/server/auth";
//import { useRouter } from "next/navigation";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  //const router = useRouter();
  const session = await auth();

  if (!session?.user) {
    return null;
  }
  const { id } = await params;

  const { isMember } = await checkMembership(id);
  console.log(isMember);

  if (!isMember) {
    return (
      <div>
        <JoinChannelModal channelId={id} />
      </div>
    );
  }

  return (
    <div className="=">
      <p>subConfettichannel ID: {id}</p>
      <DiscordSidebar channelId={id} />
    </div>
  );
}
