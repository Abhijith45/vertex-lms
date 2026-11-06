import { NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// Global in-memory store for rate limiting by IP/key
const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Checks rate limit for a given request.
 * @param req The incoming Request
 * @param limit Max allowed requests within window
 * @param windowMs Window duration in milliseconds (default 60 seconds)
 * @param keyPrefix Optional identifier prefix (e.g. "search", "suggestions")
 */
export function checkRateLimit(
  req: Request,
  limit: number = 20,
  windowMs: number = 60 * 1000,
  keyPrefix: string = "api"
) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = (forwardedFor ? forwardedFor.split(",")[0].trim() : realIp) || "127.0.0.1";
  
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();

  let record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitMap.set(key, record);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return {
      success: false,
      limit,
      remaining: 0,
      reset: retryAfter,
      response: NextResponse.json(
        {
          error: "Too Many Requests",
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(retryAfter),
          },
        }
      ),
    };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: Math.ceil((record.resetTime - now) / 1000),
  };
}
