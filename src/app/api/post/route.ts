import { type NextRequest, NextResponse } from "next/server";
import { string, z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";
import { redis } from "~/utils/redis";

const postReqRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "10 s"),
  analytics: true,
});

const getReqRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "10 s"),
  analytics: true,
});

const createPostSchema = z.object({
  subConfettiChannelId: string(),
  content: string(),
  mediaType: z.enum(["IMAGE", "VIDEO"]).optional(),
  mediaUrl: z.string().optional(),
});

const getPostSchema = z.object({
  subConfettiChannelId: string(),
});

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
    const { subConfettiChannelId, content, mediaType, mediaUrl } =
      createPostSchema.parse(body);

    const isMember = await db.member.findFirst({
      where: {
        subConfettiChannelId,
        userId: session.user.id,
      },
    });

    if (!isMember) {
      return NextResponse.json(
        { error: "Forbidden, you are not part of this channel" },
        { status: 403 },
      );
    }

    const newPost = await db.post.create({
      data: {
        subConfettiChannelId,
        createdById: session.user.id,
        content,
        mediaType,
        mediaUrl,
      },
    });

    await redis.del(`subConfetti:posts:${subConfettiChannelId}`);

    return NextResponse.json({ newPost }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

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

    const body = await req.json();

    const { subConfettiChannelId } = getPostSchema.parse(body);

    const cacheKey = `subConfetti:posts:${subConfettiChannelId}`;
    const cached = await redis.get<string>(cacheKey);

    if (cached) {
      const posts = typeof cached === "string" ? JSON.parse(cached) : cached;
      return NextResponse.json({ posts, cached: true }, { status: 200 });
    }

    const isMember = await db.member.findFirst({
      where: {
        subConfettiChannelId,
        userId: session.user.id,
      },
    });

    if (!isMember) {
      return NextResponse.json(
        { error: "Forbidden, you are not part of this channel" },
        { status: 403 },
      );
    }

    const posts = await db.post.findMany({
      where: {
        subConfettiChannelId,
      },
      select: {
        createdBy: {
          select: {
            username: true,
            id: true,
          },
        },
      },
    });

    await redis.set(cacheKey, JSON.stringify(posts), { ex: 300 }); // cache for 5 min

    return NextResponse.json({ posts, cached: false }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
