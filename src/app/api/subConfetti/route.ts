import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";
import { redis } from "~/utils/redis";

//10 REQUESTS PER 10 SECONDS
const postReqRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

const subConfettiChannelPostSchema = z.object({
  name: z.string().min(3).max(50),
  image: z.string().url(),
  username: z.string().min(3).max(50),
});

export async function POST(req: NextRequest) {
  try {
    const headerList = await headers();
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "[[CONFETTI_POST]]" + error },
      { status: 500 },
    );
  }
}
