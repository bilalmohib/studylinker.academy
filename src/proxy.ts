import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/client";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/portal(.*)",
  "/parents/post-job",
  "/parents/find-teachers",
  "/parents/reports",
  "/parents/curriculum",
  "/parents/how-it-works",
  "/teachers/find-students",
  "/teachers/apply",
  "/teachers/application-process",
  "/teachers/benefits",
  "/teachers/resources",
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const { userId } = await auth();
  
  // Skip profile check ONLY for auth pages (to avoid redirect loops)
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    return NextResponse.next();
  }
  
  // Handle onboarding page
  if (pathname.startsWith("/onboarding")) {
    // If user has profile and is on onboarding, redirect them away
    if (userId) {
      try {
        const supabase = getSupabaseAdmin();
        const { data: userProfile } = await supabase
          .from("UserProfile")
          .select("id, role")
          .eq("clerkId", userId)
          .single();

        if (userProfile) {
          const role = (userProfile as { role: string }).role;
          if (role === "PARENT") {
            return NextResponse.redirect(new URL("/portal/parent", req.url));
          } else if (role === "TEACHER") {
            return NextResponse.redirect(new URL("/portal/teacher", req.url));
          } else if (role === "ADMIN" || role === "MANAGER") {
            return NextResponse.redirect(new URL("/admin", req.url));
          }
        }
      } catch (error) {
        // If error checking, let them stay on onboarding
        console.error("Error checking profile on onboarding:", error);
      }
    }
    return NextResponse.next();
  }
  
  // If user is authenticated, ALWAYS check if they have a profile (regardless of route)
  if (userId) {
    try {
      const supabase = getSupabaseAdmin();
      const { data: userProfile, error } = await supabase
        .from("UserProfile")
        .select("id, role")
        .eq("clerkId", userId)
        .single();

      // If no profile exists, redirect to onboarding
      if (error || !userProfile) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }

      // For admin routes, verify admin role
      if (pathname.startsWith("/admin")) {
        const role = (userProfile as { role: string }).role;
        if (role !== "ADMIN" && role !== "MANAGER") {
          return NextResponse.redirect(new URL("/", req.url));
        }
      }
    } catch (error) {
      console.error("Error checking user profile:", error);
      // On error, redirect to onboarding to be safe
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  } else {
    // If not authenticated and trying to access protected route
    if (isProtectedRoute(req) || pathname.match(/^\/jobs\/[^/]+\/apply/)) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
