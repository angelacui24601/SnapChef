import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Pages that require a signed-in session.
// / and /snapchef are intentionally excluded — the app is guest-first.
const isProtectedRoute = createRouteMatcher([
  "/profile(.*)",
  "/onboarding(.*)",
]);

// Routes that must always be reachable without a session.
const isPublicApiRoute = createRouteMatcher([
  "/api/webhooks/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isPublicApiRoute(request)) {
    return;
  }
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
  // All other routes pass through; API handlers enforce auth via auth() internally.
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
