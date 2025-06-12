import { type NextRequest, NextResponse } from "next/server";
import { string, z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";
import { redis } from "~/utils/redis";

const getReqRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "10 s"),
  analytics: true,
});

const postReqRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "10 s"),
  analytics: true,
});

const membersGetSchema = z.object({
  id: string(),
});

export async function GET(req: NextRequest) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "anonymous";
    const { success, limit, reset, remaining } =
      await getReqRateLimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: "Too many requests",
          limit,
          reset,
          remaining,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      );
    }

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "User unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const { id: validatedId } = membersGetSchema.parse({ id });

    const cacheKey = `subConfetti:members:${validatedId}`;
    const cached = await redis.get<string>(cacheKey);
    if (cached) {
      const members = typeof cached === "string" ? JSON.parse(cached) : cached;

      return NextResponse.json({ members, cached: true }, { status: 200 });
    }

    const members = await db.member.findMany({
      where: {
        subConfettiChannelId: validatedId,
      },
      include: {
        user: {
          select: {
            username: true,
            id: true,
          },
        },
      },
    });

    await redis.set(cacheKey, JSON.stringify(members), { ex: 300 });

    return NextResponse.json({ members, cached: false }, { status: 200 });
  } catch (error) {
    console.error("Fetch members error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "anonymous";
    const { success, limit, reset, remaining } =
      await postReqRateLimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: "Too many requests",
          limit,
          reset,
          remaining,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      );
    }

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "User unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { id } = membersGetSchema.parse(body);

    const newMember = await db.member.create({
      data: {
        role: "GUEST",
        userId: session.user.id,
        subConfettiChannelId: id,
      },
    });

    await redis.del(`subConfetti:members:${id}`);

    return NextResponse.json({ member: newMember }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

const membersDeleteSchema = z.object({
  confettiChannelId: string(),
});

export async function DELETE(req: NextRequest) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "anonymous";
    const { success, limit, reset, remaining } =
      await postReqRateLimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: "Too many requests",
          limit,
          reset,
          remaining,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      );
    }

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "User unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { confettiChannelId } = membersDeleteSchema.parse(body);

    const member = await db.member.findFirst({
      where: {
        userId: session.user.id,
        subConfettiChannelId: confettiChannelId,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 },
      );
    }

    await db.member.delete({ where: { id: member.id } });

    await redis.del(`subConfetti:members:${confettiChannelId}`);

    return NextResponse.json(
      { message: "You left this channel" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
