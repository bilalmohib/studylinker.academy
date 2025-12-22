"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Container from "@/components/common/Container";
import { BsPeople, BsPersonCheck } from "react-icons/bs";
import toast from "react-hot-toast";
import { getCurrentUserProfile, updateUserProfile } from "@/actions/users/actions";
import { createUserProfile } from "@/actions/users/actions";
import { createParentProfile } from "@/actions/parents/actions";
import { createTeacherProfile } from "@/actions/teachers/actions";

export default function OnboardingPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const [role, setRole] = useState<"PARENT" | "TEACHER" | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    // If no userId, redirect to signup
    if (!userId) {
      router.push("/sign-up");
      return;
    }

    const checkProfile = async () => {
      try {
        const result = await getCurrentUserProfile();
        
        // Check if result is successful and has data
        if (result.success && "data" in result && result.data) {
          // User already has a profile, check if role is valid
          const profile = result.data as { role: string; isAdmin?: boolean; firstName?: string | null; lastName?: string | null };
          
          // If user has a valid role, redirect to appropriate portal
          if (profile.role === "PARENT" || profile.role === "TEACHER") {
            if (profile.isAdmin === true) {
              router.push("/admin");
              return;
            } else if (profile.role === "PARENT") {
              router.push("/portal/parent");
              return;
            } else if (profile.role === "TEACHER") {
              // Check teacher verification before redirecting
              try {
                const { checkTeacherVerification } = await import("@/actions/teachers/verification");
                const verificationResult = await checkTeacherVerification();
                
                if (verificationResult.success && verificationResult.data) {
                  const verification = verificationResult.data;
                  
                  // If not verified and no application, redirect to application page
                  if (!verification.isVerified && !verification.hasApplication) {
                    router.push("/teachers/apply");
                    return;
                  }
                }
                
                // Otherwise, redirect to teacher portal (will be checked again in middleware)
                router.push("/portal/teacher");
                return;
              } catch (error) {
                console.error("Error checking teacher verification:", error);
                // On error, still redirect to portal (middleware will handle it)
                router.push("/portal/teacher");
                return;
              }
            }
          }
          
          // User has profile but no valid role (or role is missing/null)
          // Show onboarding to complete their profile
          setChecking(false);
          setFirstName(profile.firstName || user?.firstName || "");
          setLastName(profile.lastName || user?.lastName || "");
          // If they already have a role set (but invalid), don't pre-select it
          // Let them choose again
          return;
        }
        
        // No profile exists (result.data is null or undefined)
        // Check if user object exists from Clerk
        if (!user) {
          // No Clerk user found, redirect to signup
          router.push("/sign-up");
          return;
        }
        
        // User exists in Clerk but no profile in database, show onboarding
        setChecking(false);
        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
      } catch (error) {
        console.error("Error checking profile:", error);
        // On error, show onboarding to be safe
        if (user) {
          setChecking(false);
          setFirstName(user.firstName || "");
          setLastName(user.lastName || "");
        } else {
          router.push("/sign-up");
        }
        return;
      }
    };

    checkProfile();
  }, [userId, isLoaded, router, user]);

  const handleRoleSelection = (selectedRole: "PARENT" | "TEACHER") => {
    setRole(selectedRole);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      toast.error("Please select whether you are a Parent or Teacher");
      return;
    }

    if (!userId || !user) {
      toast.error("Please sign in first");
      return;
    }

    setIsSubmitting(true);
    try {
      // Validate email
      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) {
        toast.error("Email address is required. Please add an email to your account.");
        setIsSubmitting(false);
        return;
      }

      // Check if user profile already exists (might have incomplete profile)
      const existingProfile = await getCurrentUserProfile();
      let userProfileId: string;

      if (existingProfile.success && "data" in existingProfile && existingProfile.data) {
        // Profile exists, update it with the role
        const existingData = existingProfile.data as { id: string; role?: string; clerkId?: string };
        userProfileId = existingData.id;
        
        // Verify this profile belongs to the current user
        if (existingData.clerkId && existingData.clerkId !== userId) {
          console.error("Profile ownership mismatch:", { existingClerkId: existingData.clerkId, currentUserId: userId });
          toast.error("Profile ownership error. Please contact support.");
          setIsSubmitting(false);
          return;
        }
        
        // Only update if role is missing or invalid
        if (!existingData.role || (existingData.role !== "PARENT" && existingData.role !== "TEACHER")) {
          try {
            // Update the profile with role and name
            const updateResult = await updateUserProfile({
              id: userProfileId,
              firstName: firstName.trim() || user.firstName || null,
              lastName: lastName.trim() || user.lastName || null,
              role: role,
            });

            if (!updateResult.success) {
              const errorMsg = "error" in updateResult ? updateResult.error : "Failed to update user profile";
              console.error("Profile update error:", updateResult);
              toast.error(errorMsg || "Failed to update user profile. Please try refreshing the page.");
              setIsSubmitting(false);
              return;
            }
          } catch (updateError) {
            console.error("Exception during profile update:", updateError);
            toast.error(updateError instanceof Error ? updateError.message : "An error occurred while updating your profile. Please try again.");
            setIsSubmitting(false);
            return;
          }
        } else {
          // Role already set, use existing profile
          // Still update name if needed
          if (firstName.trim() || lastName.trim()) {
            try {
              const updateResult = await updateUserProfile({
                id: userProfileId,
                firstName: firstName.trim() || user.firstName || null,
                lastName: lastName.trim() || user.lastName || null,
              });
              if (!updateResult.success) {
                console.warn("Failed to update name, but continuing with profile creation");
              }
            } catch (error) {
              console.warn("Error updating name:", error);
              // Continue anyway
            }
          }
        }
      } else {
        // Create new user profile
        const userProfileResult = await createUserProfile({
          clerkId: userId,
          email: email,
          firstName: firstName.trim() || user.firstName || null,
          lastName: lastName.trim() || user.lastName || null,
          role: role,
          avatar: user.imageUrl && user.imageUrl.trim() !== "" ? user.imageUrl : null,
        });

        if (!userProfileResult.success || !("data" in userProfileResult)) {
          const errorMessage = "error" in userProfileResult 
            ? userProfileResult.error 
            : "Failed to create user profile";
          console.error("Profile creation error:", userProfileResult);
          toast.error(errorMessage);
          setIsSubmitting(false);
          return;
        }

        userProfileId = (userProfileResult as { success: true; data: { id: string } }).data.id;
      }

      // Check if role-specific profile exists, create if missing
      if (role === "PARENT") {
        try {
          console.log("Onboarding: About to create parent profile for userProfileId:", userProfileId);
          
          // Try to create parent profile - it will return existing if already present
          const parentResult = await createParentProfile(userProfileId);
          console.log("Onboarding: Parent profile result:", JSON.stringify(parentResult));
          
          if (!parentResult) {
            console.error("Onboarding: parentResult is null or undefined");
            toast.error("Failed to create parent profile - no response from server");
            setIsSubmitting(false);
            return;
          }
          
          if (!parentResult.success) {
            const errorMsg = "error" in parentResult ? parentResult.error : "Failed to create parent profile";
            console.error("Onboarding: Parent profile creation failed:", JSON.stringify(parentResult));
            toast.error(errorMsg || "Failed to create parent profile");
            setIsSubmitting(false);
            return;
          }
          
          console.log("Onboarding: Parent profile created, redirecting to /portal/parent");
          toast.success("Profile created successfully!");
          router.push("/portal/parent");
        } catch (parentError) {
          console.error("Onboarding: Exception in parent profile creation:", parentError);
          console.error("Onboarding: Error details:", {
            message: parentError instanceof Error ? parentError.message : String(parentError),
            stack: parentError instanceof Error ? parentError.stack : undefined
          });
          toast.error("An error occurred while creating your profile. Please try again.");
          setIsSubmitting(false);
          return;
        }
      } else if (role === "TEACHER") {
        try {
          console.log("Onboarding: About to create teacher profile for userProfileId:", userProfileId);
          
          // Try to create teacher profile - it will return existing if already present
          const teacherResult = await createTeacherProfile({
            userId: userProfileId,
            currency: "USD",
          });
          console.log("Onboarding: Teacher profile result:", JSON.stringify(teacherResult));
          
          if (!teacherResult) {
            console.error("Onboarding: teacherResult is null or undefined");
            toast.error("Failed to create teacher profile - no response from server");
            setIsSubmitting(false);
            return;
          }
          
          if (!teacherResult.success) {
            const errorMsg = "error" in teacherResult ? teacherResult.error : "Failed to create teacher profile";
            console.error("Onboarding: Teacher profile creation failed:", JSON.stringify(teacherResult));
            toast.error(errorMsg || "Failed to create teacher profile");
            setIsSubmitting(false);
            return;
          }
          
          console.log("Onboarding: Teacher profile created, redirecting to /portal/teacher");
          toast.success("Profile created successfully!");
          router.push("/portal/teacher");
        } catch (teacherError) {
          console.error("Onboarding: Exception in teacher profile creation:", teacherError);
          console.error("Onboarding: Error details:", {
            message: teacherError instanceof Error ? teacherError.message : String(teacherError),
            stack: teacherError instanceof Error ? teacherError.stack : undefined
          });
          toast.error("An error occurred while creating your profile. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("An error occurred while creating your profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If no userId or user object, redirect to signup
  if (!userId || !user) {
    router.push("/sign-up");
    return null;
  }

  // Show role selection if not selected
  if (!role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center py-12 px-4">
        <Container>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Complete Your Profile
              </h1>
              <p className="text-lg sm:text-xl text-gray-600">
                Tell us who you are to get started
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Parent Option */}
              <button
                onClick={() => handleRoleSelection("PARENT")}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-indigo-500 text-left group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <BsPeople className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">I'm a Parent</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Find qualified teachers for your child's education
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-600">✓</span>
                    <span>Post tuition jobs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-600">✓</span>
                    <span>Browse qualified teachers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-600">✓</span>
                    <span>Track your child's progress</span>
                  </li>
                </ul>
              </button>

              {/* Teacher Option */}
              <button
                onClick={() => handleRoleSelection("TEACHER")}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-indigo-500 text-left group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <BsPersonCheck className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">I'm a Teacher</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Teach students and grow your tutoring business
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">✓</span>
                    <span>Find students who need help</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">✓</span>
                    <span>Set your own rates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">✓</span>
                    <span>Build your teaching profile</span>
                  </li>
                </ul>
              </button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // Show profile completion form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center py-12 px-4">
      <Container>
        <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-6">
            <button
              onClick={() => setRole(null)}
              className="text-sm text-indigo-600 hover:text-indigo-700 mb-4 inline-block"
            >
              ← Change account type
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h2>
            <p className="text-gray-600">
              Signing up as a <strong>{role === "PARENT" ? "Parent" : "Teacher"}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.emailAddresses[0]?.emailAddress || ""}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Email from your account</p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg rounded-full shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Profile..." : "Complete Setup"}
            </Button>
          </form>
        </div>
      </Container>
    </div>
  );
}

