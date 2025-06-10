import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";
import { redis } from "~/utils/redis";
import { Prisma } from "@prisma/client";

// 10 REQUESTS PER 10 SECONDS
const postReqRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

const subConfettiChannelPostSchema = z.object({
  name: z.string().min(3).max(50),
  image: z.string().url().optional(),
  username: z.string().min(3).max(50),
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
    const { name, image, username } = subConfettiChannelPostSchema.parse(body);

    const result = await db.$transaction(async (tx) => {
      const subConfettiChannel = await tx.subConfettiChannel.create({
        data: {
          name,
          image,
          username,
          createdById: session.user.id,
        },
      });

      const member = await tx.member.create({
        data: {
          role: "ADMIN",
          userId: session.user.id,
          subConfettiChannelId: subConfettiChannel.id,
        },
      });

      return { channel: subConfettiChannel, member };
    });

    return NextResponse.json(
      {
        channel: result.channel,
        message: "Channel created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Channel creation error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = error.meta?.target as string[];
        if (target?.includes("username")) {
          return NextResponse.json(
            { error: "Username already exists" },
            { status: 409 },
          );
        }
      }
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create channel" },
      { status: 500 },
    );
  }
}

const subConfettiChannelDeleteSchema = z.object({
  id: z.string(),
});

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "User unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = subConfettiChannelDeleteSchema.parse(body);

    const isAdmin = await db.member.findFirst({
      where: {
        userId: session.user.id,
        subConfettiChannelId: id,
        role: "ADMIN",
      },
    });

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only ADMINS can delete." },
        { status: 403 },
      );
    }

    await db.subConfettiChannel.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: "Channel deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete channel" },
      { status: 500 },
    );
  }
}

const subConfettiChannelPatchSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  image: z.string().url().optional(),
  username: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "User Unautorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, image, username } =
      subConfettiChannelPatchSchema.parse(body);

    const isAdminOrModerator = await db.member.findFirst({
      where: {
        userId: session.user.id,
        subConfettiChannelId: id,
        role: {
          in: ["ADMIN", "MODERATOR"],
        },
      },
    });

    if (!isAdminOrModerator) {
      return NextResponse.json(
        { error: "Only ADMINS or MODERATORS can update." },
        { status: 403 },
      );
    }
    const updateData: {
      name?: string;
      image?: string;
      username?: string;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;
    if (username !== undefined) updateData.username = username;

    const updatedSubConfettiChannel = await db.subConfettiChannel.update({
      where: {
        id,
      },
      data: updateData,
    });

    return NextResponse.json(
      {
        data: updatedSubConfettiChannel,
        message: "SubConfettiChannel Updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 505 });
  }
}
