import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sanitizeRedirectUrl } from "@/lib/utils/url";

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/my-learning(.*)",
  "/profile(.*)",
  "/api/progress(.*)",
]);

// Signed-in users skip the sign-in page
const isSignInRoute = createRouteMatcher(["/sign-in"]);

export default clerkMiddleware(async (auth, req) => {
  if (isSignInRoute(req)) {
    const { userId } = await auth();
    if (userId) {
      const destination = sanitizeRedirectUrl(req.nextUrl.searchParams.get("redirect_url"), "/");
      return NextResponse.redirect(new URL(destination, req.url));
    }
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
