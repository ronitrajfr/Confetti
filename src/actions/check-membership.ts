"use server";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function checkMembership(channelId: string) {
  const session = await auth();

  if (!session?.user) return { isMember: false };

  const isMember = await db.member.findFirst({
    where: {
      subConfettiChannelId: channelId,
      userId: session.user.id,
    },
  });

  return { isMember: !!isMember };
}
