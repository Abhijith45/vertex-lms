import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

/**
 * On-demand revalidation endpoint for Sanity Studio webhooks or manual cache purging.
 * Protected by a secret token to prevent unauthorized cache busting.
 */
function isAuthorized(req: NextRequest): boolean {
  const secret = req.nextUrl.searchParams.get("secret");
  const expectedSecret =
    process.env.SANITY_REVALIDATE_SECRET ||
    process.env.REVALIDATE_SECRET ||
    "vertex-cache-secret-token";

  return Boolean(secret && secret === expectedSecret);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ message: "Unauthorized: Invalid revalidation token" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const tag = req.nextUrl.searchParams.get("tag") || body.tag;
    const path = req.nextUrl.searchParams.get("path") || body.path;

    if (tag) {
      revalidateTag(tag, "max");
      return NextResponse.json({ revalidated: true, tag, timestamp: Date.now() });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path, timestamp: Date.now() });
    }

    return NextResponse.json({ message: "Missing tag or path parameter to revalidate" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: "Revalidation failed", error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ message: "Unauthorized: Invalid revalidation token" }, { status: 401 });
  }

  try {
    const tag = req.nextUrl.searchParams.get("tag");
    const path = req.nextUrl.searchParams.get("path");

    if (tag) {
      revalidateTag(tag, "max");
      return NextResponse.json({ revalidated: true, tag, timestamp: Date.now() });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path, timestamp: Date.now() });
    }

    return NextResponse.json({ message: "Missing tag or path parameter to revalidate" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: "Revalidation failed", error: message }, { status: 500 });
  }
}
