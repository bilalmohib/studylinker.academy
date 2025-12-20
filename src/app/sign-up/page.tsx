"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Container from "@/components/common/Container";
import { BsPeople, BsPersonCheck } from "react-icons/bs";
import toast from "react-hot-toast";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [role, setRole] = useState<"PARENT" | "TEACHER" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const redirectUrl = searchParams?.get("redirect_url") || "/portal/parent";

  const handleRoleSelection = (selectedRole: "PARENT" | "TEACHER") => {
    setRole(selectedRole);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role) {
      toast.error("Please select whether you are a Parent or Teacher");
      return;
    }

    if (!isLoaded) return;

    setIsSubmitting(true);
    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
        unsafeMetadata: {
          role: role,
        },
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
      toast.success("Verification code sent to your email!");
    } catch (err: any) {
      console.error("Error during signup:", err);
      toast.error(err.errors?.[0]?.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) return;

    setIsSubmitting(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status !== "complete") {
        toast.error("Verification failed. Please try again.");
        return;
      }

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        
        // Create user profile with role
        const response = await fetch("/api/create-user-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: role,
            firstName,
            lastName,
            email,
          }),
        });

        if (response.ok) {
          toast.success("Account created successfully!");
          // Redirect to onboarding which will check profile and redirect appropriately
          router.push("/onboarding");
        } else {
          toast.error("Account created but profile setup failed. Please complete your profile.");
          router.push("/onboarding");
        }
      }
    } catch (err: any) {
      console.error("Error during verification:", err);
      toast.error(err.errors?.[0]?.message || "Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show role selection if not selected
  if (!role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center py-12 px-4">
        <Container>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Join StudyLinker
              </h1>
              <p className="text-lg sm:text-xl text-gray-600">
                First, tell us who you are
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

  // Show verification form if pending
  if (pendingVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center py-12 px-4">
        <Container>
          <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verify Your Email
              </h2>
              <p className="text-gray-600">
                We sent a verification code to <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerification} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !code}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg rounded-full shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Verifying..." : "Verify Email"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setPendingVerification(false);
                  setCode("");
                }}
                className="w-full text-sm text-gray-600 hover:text-indigo-600"
              >
                ← Back to sign up
              </button>
            </form>
          </div>
        </Container>
      </div>
    );
  }

  // Show sign-up form
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
              Create Your Account
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
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !isLoaded}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg rounded-full shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-xs text-center text-gray-500">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>
      </Container>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}

