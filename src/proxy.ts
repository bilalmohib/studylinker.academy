import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/client";
import { checkTeacherVerification } from "@/actions/teachers/verification";

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
  
  // Skip middleware for server actions (they have their own auth)
  const isServerAction = req.headers.get("next-action") !== null;
  if (isServerAction) {
    return NextResponse.next();
  }
  
  // Skip profile check ONLY for auth pages (to avoid redirect loops)
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    return NextResponse.next();
  }
  
  // Handle onboarding page
  if (pathname.startsWith("/onboarding")) {
    // If user has profile with valid role, redirect them away
    if (userId) {
      try {
        const supabase = getSupabaseAdmin();
        const { data: userProfile } = await supabase
          .from("UserProfile")
          .select("id, role, isAdmin")
          .eq("clerkId", userId)
          .single();

        if (userProfile) {
          const profile = userProfile as { role: string; isAdmin?: boolean };
          // Only redirect if they have a valid role (PARENT or TEACHER)
          if (profile.role === "PARENT" || profile.role === "TEACHER") {
            const isAdmin = profile.isAdmin === true;
            if (isAdmin) {
              return NextResponse.redirect(new URL("/admin", req.url));
            } else if (profile.role === "PARENT") {
              return NextResponse.redirect(new URL("/portal/parent", req.url));
            } else if (profile.role === "TEACHER") {
              return NextResponse.redirect(new URL("/portal/teacher", req.url));
            }
          }
          // If profile exists but role is invalid/missing, let them stay on onboarding
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
        .select("id, role, isAdmin")
        .eq("clerkId", userId)
        .single();

      // If no profile exists, redirect to onboarding
      if (error || !userProfile) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }

      // For admin routes, verify admin status
      if (pathname.startsWith("/admin")) {
        const profile = userProfile as { isAdmin?: boolean };
        if (profile.isAdmin !== true) {
          return NextResponse.redirect(new URL("/", req.url));
        }
      }

      // For teacher routes, verify teacher status
      const profile = userProfile as { role: string };
      if (profile.role === "TEACHER") {
        // Check verification for teacher portal and protected teacher routes
        // Skip check for application page and public teacher pages
        if ((pathname.startsWith("/portal/teacher") || 
            pathname.startsWith("/teachers/find-students") || 
            (pathname.startsWith("/jobs/") && pathname.includes("/apply"))) &&
            !pathname.startsWith("/teachers/apply") &&
            !pathname.startsWith("/teachers/application-process") &&
            !pathname.startsWith("/teachers/benefits") &&
            !pathname.startsWith("/teachers/resources")) {
          try {
            const verificationResult = await checkTeacherVerification();
            console.log("Teacher verification check:", {
              pathname,
              success: verificationResult.success,
              data: verificationResult.data,
            });
            
            if (verificationResult.success && verificationResult.data) {
              const verification = verificationResult.data;
              
              // If not verified and no application, redirect to application page
              if (!verification.isVerified && !verification.hasApplication) {
                console.log("Redirecting teacher to application page - not verified and no application");
                return NextResponse.redirect(new URL("/teachers/apply", req.url));
              }
            } else {
              // If verification check failed, redirect to application page to be safe
              console.error("Teacher verification check failed, redirecting to application page");
              return NextResponse.redirect(new URL("/teachers/apply", req.url));
            }
          } catch (error) {
            console.error("Error checking teacher verification:", error);
            // On error, redirect to application page
            return NextResponse.redirect(new URL("/teachers/apply", req.url));
          }
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
