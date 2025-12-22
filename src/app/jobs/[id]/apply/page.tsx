"use client";

import { use, useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Container from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BsCurrencyDollar, BsCalendar, BsFileText } from "react-icons/bs";
import { createApplication } from "@/actions/applications/actions";
import { getCurrentTeacherProfile } from "@/actions/teachers/actions";
import { getCurrentUserProfile } from "@/actions/users/actions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ApplyToJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: jobId } = use(params);
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    proposedRate: "",
    availability: "",
    coverLetter: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push(`/sign-up?redirect_url=/jobs/${jobId}/apply`);
    }
  }, [isLoaded, userId, router, jobId]);

  // Check if user is a parent - parents cannot apply to jobs
  useEffect(() => {
    if (!userId || !isLoaded) return;

    const checkUserRole = async () => {
      try {
        const result = await getCurrentUserProfile();
        if (result.success && result.data) {
          const profile = result.data as { role?: string };
          if (profile.role === "PARENT") {
            toast.error("Parents cannot apply to jobs. This feature is for teachers only.");
            router.push(`/jobs/${jobId}`);
            return;
          }
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      } finally {
        setCheckingRole(false);
      }
    };
    checkUserRole();
  }, [userId, isLoaded, router, jobId]);

  // Get teacher profile on mount
  useEffect(() => {
    if (!userId || checkingRole) return;

    const fetchTeacherProfile = async () => {
      const result = await getCurrentTeacherProfile();
      if (result.success) {
        const data = result as { success: true; data: { id: string } };
        if (data.data) {
          setTeacherId(data.data.id);
        }
      } else {
        toast.error("Please complete your teacher profile first");
        router.push("/portal/teacher");
      }
    };
    fetchTeacherProfile();
  }, [userId, router, checkingRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacherId) {
      toast.error("Teacher profile not found");
      return;
    }

    setIsSubmitting(true);
    try {
      // Extract numeric value from proposedRate (e.g., "$150/month" -> 150)
      const rateMatch = formData.proposedRate.match(/\d+/);
      const proposedRate = rateMatch ? parseFloat(rateMatch[0]) : null;

      const result = await createApplication({
        jobId,
        teacherId,
        proposedRate,
        coverLetter: formData.coverLetter || formData.availability || null,
      });

      if (result.success) {
        toast.success("Application submitted successfully!");
        router.push(`/jobs/${jobId}`);
      } else {
        toast.error("error" in result ? result.error : "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("An error occurred while submitting the application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Show loading while checking role
  if (checkingRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12">
      <Container>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link
              href={`/jobs/${jobId}`}
              className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block"
            >
              ← Back to Job Details
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Apply to Job
            </h1>
            <p className="text-xl text-gray-600">
              Submit your application with your proposed rate and availability
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Proposed Rate */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Your Proposed Rate
              </h2>
              <div className="relative">
                <BsCurrencyDollar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="proposedRate"
                  value={formData.proposedRate}
                  onChange={handleChange}
                  placeholder="e.g., $150/month"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Enter your monthly rate for this position
              </p>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Your Availability
              </h2>
              <textarea
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                rows={4}
                placeholder="e.g., Monday-Friday: 3 PM - 7 PM GMT, Weekends: Flexible"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-600 mt-2">
                Describe your available hours and timezone
              </p>
            </div>

            {/* Cover Letter */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Cover Letter
              </h2>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleChange}
                rows={8}
                placeholder="Tell the parent why you're the right teacher for this position. Include your relevant experience, teaching approach, and how you can help their child succeed."
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-600 mt-2">
                This will be sent to the parent along with your profile
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting || !teacherId}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
              <Button
                type="button"
                variant="outline"
                asChild
                className="px-8 py-6 text-lg rounded-full"
              >
                <Link href={`/jobs/${jobId}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}

