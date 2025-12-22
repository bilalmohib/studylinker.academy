"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Container from "@/components/common/Container";
import { BsPeople, BsPersonCheck } from "react-icons/bs";
import toast from "react-hot-toast";
import { getCurrentUserProfile } from "@/actions/users/actions";
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
          // User already has a profile, redirect to appropriate portal
          const profile = result.data as { role: string; isAdmin?: boolean };
          if (profile.isAdmin === true) {
            router.push("/admin");
            return;
          } else if (profile.role === "PARENT") {
            router.push("/portal/parent");
            return;
          } else if (profile.role === "TEACHER") {
            router.push("/portal/teacher");
            return;
          } else {
            router.push("/");
            return;
          }
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
        // On error, redirect to signup to ensure proper signup flow
        router.push("/sign-up");
        return;
      }
    };

    checkProfile();
  }, [userId, isLoaded, router, user]);

  // Additional check: if no userId after loading, redirect to signup
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-up");
    }
  }, [isLoaded, userId, router]);

  // Redirect to signup if no user after loading
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-up");
    }
  }, [isLoaded, userId, router]);
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

      // Create user profile
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

      const userProfileId = (userProfileResult as { success: true; data: { id: string } }).data.id;

      // Create role-specific profile
      if (role === "PARENT") {
        const parentResult = await createParentProfile(userProfileId);
        if (!parentResult.success) {
          toast.error("Failed to create parent profile");
          return;
        }
        toast.success("Profile created successfully!");
        router.push("/portal/parent");
      } else if (role === "TEACHER") {
        const teacherResult = await createTeacherProfile({
          userId: userProfileId,
          currency: "USD",
        });
        if (!teacherResult.success) {
          toast.error("Failed to create teacher profile");
          return;
        }
        toast.success("Profile created successfully!");
        router.push("/portal/teacher");
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

