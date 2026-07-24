import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null | undefined;

function getRatelimit(): Ratelimit | null {
  if (ratelimit !== undefined) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    ratelimit = null;
    return ratelimit;
  }

  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    prefix: "ratelimit",
  });
  return ratelimit;
}

export async function checkRateLimit(identifier: string): Promise<{ success: boolean }> {
  const limiter = getRatelimit();
  if (!limiter) return { success: true };

  const { success } = await limiter.limit(identifier);
  return { success };
}

export function clientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
}
