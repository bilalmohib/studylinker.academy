"use client";

import { useState, useEffect } from "react";
import Container from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { BsCheckCircle, BsFileText, BsAward, BsUpload, BsX } from "react-icons/bs";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  createTeacherApplication,
  getCurrentTeacherApplication,
} from "@/actions/teacher-applications/actions";
import { getCurrentUserProfile } from "@/actions/users/actions";

const SUBJECTS = [
  "Mathematics",
  "English",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Economics",
  "Computer Science",
  "Art",
  "Music",
];

const LEVELS = [
  "Primary School",
  "Middle School",
  "Secondary School",
  "O-Level",
  "A-Level",
];

export default function ApplyPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [formData, setFormData] = useState({
    subjects: [] as string[],
    levels: [] as string[],
    qualifications: [] as Array<{ title: string; institution: string; year: string }>,
    experience: "",
    resume: "",
    certificates: [] as string[],
    coverLetter: "",
  });

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      router.push("/sign-up?redirect_url=/teachers/apply");
      return;
    }

    const fetchData = async () => {
      try {
        const [userResult, applicationResult] = await Promise.all([
          getCurrentUserProfile(),
          getCurrentTeacherApplication(),
        ]);

        if (!userResult.success || !("data" in userResult)) {
          toast.error("Please complete your profile first");
          router.push("/sign-up");
          return;
        }

        if (applicationResult.success && "data" in applicationResult) {
          const app = applicationResult.data as any;
          if (app) {
            setExistingApplication(app);
            
            if (app.status === "APPROVED") {
              toast.success("You are already approved as a teacher!");
              router.push("/portal/teacher");
              return;
            }

            if (app.status === "PENDING" || app.status === "UNDER_REVIEW") {
              toast("You already have a pending application", { icon: "ℹ️" });
              setFormData({
                subjects: app.subjects || [],
                levels: app.levels || [],
                qualifications: app.qualifications || [],
                experience: app.experience || "",
                resume: app.resume || "",
                certificates: app.certificates || [],
                coverLetter: app.coverLetter || "",
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, isLoaded, router]);

  const handleSubjectToggle = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const handleLevelToggle = (level: string) => {
    setFormData((prev) => ({
      ...prev,
      levels: prev.levels.includes(level)
        ? prev.levels.filter((l) => l !== level)
        : [...prev.levels, level],
    }));
  };

  const handleAddQualification = () => {
    setFormData((prev) => ({
      ...prev,
      qualifications: [
        ...prev.qualifications,
        { title: "", institution: "", year: "" },
      ],
    }));
  };

  const handleRemoveQualification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));
  };

  const handleQualificationChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.subjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }

    if (formData.levels.length === 0) {
      toast.error("Please select at least one level");
      return;
    }

    if (formData.coverLetter.length < 50) {
      toast.error("Cover letter must be at least 50 characters");
      return;
    }

    setSubmitting(true);
    try {
      const userResult = await getCurrentUserProfile();
      if (!userResult.success || !("data" in userResult)) {
        toast.error("User profile not found");
        return;
      }

      const userData = (userResult as { success: true; data: { id: string } }).data;
      if (!userData) {
        toast.error("User profile not found");
        return;
      }

      const result = await createTeacherApplication({
        userId: userData.id,
        subjects: formData.subjects,
        levels: formData.levels,
        qualifications: formData.qualifications.length > 0 
          ? formData.qualifications.reduce((acc, q, i) => {
              acc[i] = q;
              return acc;
            }, {} as Record<string, any>)
          : null,
        experience: formData.experience || null,
        resume: formData.resume || null,
        certificates: formData.certificates.length > 0 ? formData.certificates : null,
        coverLetter: formData.coverLetter,
      });

      if (result.success) {
        toast.success("Application submitted successfully! We'll review it soon.");
        router.push("/portal/teacher");
      } else {
        toast.error("error" in result ? result.error : "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("An error occurred while submitting your application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !isLoaded || !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (existingApplication?.status === "APPROVED") {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Apply to Become a Teacher
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              Join our global network of qualified educators and start making a difference in students' lives.
            </p>
          </div>

          {existingApplication && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                <strong>Status:</strong> {existingApplication.status.replace(/_/g, " ")}
                {existingApplication.interviewScheduledAt && (
                  <span className="block mt-1">
                    Interview scheduled: {new Date(existingApplication.interviewScheduledAt).toLocaleString()}
                  </span>
                )}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subjects */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Subjects You Teach *
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SUBJECTS.map((subject) => (
                  <label
                    key={subject}
                    className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-indigo-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject)}
                      onChange={() => handleSubjectToggle(subject)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Levels */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Education Levels You Teach *
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LEVELS.map((level) => (
                  <label
                    key={level}
                    className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-indigo-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.levels.includes(level)}
                      onChange={() => handleLevelToggle(level)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Qualifications */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Qualifications
                </h2>
                <Button
                  type="button"
                  onClick={handleAddQualification}
                  variant="outline"
                  size="sm"
                >
                  <BsAward className="w-4 h-4 mr-2" />
                  Add Qualification
                </Button>
              </div>
              <div className="space-y-4">
                {formData.qualifications.map((qual, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <input
                      type="text"
                      placeholder="Title (e.g., BSc, MSc)"
                      value={qual.title}
                      onChange={(e) =>
                        handleQualificationChange(index, "title", e.target.value)
                      }
                      className="sm:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Institution"
                      value={qual.institution}
                      onChange={(e) =>
                        handleQualificationChange(index, "institution", e.target.value)
                      }
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Year"
                        value={qual.year}
                        onChange={(e) =>
                          handleQualificationChange(index, "year", e.target.value)
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <Button
                        type="button"
                        onClick={() => handleRemoveQualification(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <BsX className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
                {formData.qualifications.length === 0 && (
                  <p className="text-gray-500 text-sm">No qualifications added yet</p>
                )}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Teaching Experience
              </h2>
              <textarea
                value={formData.experience}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, experience: e.target.value }))
                }
                placeholder="Describe your teaching experience, years of experience, notable achievements, etc."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Resume & Certificates */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Documents
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Resume URL (Google Drive, Dropbox, etc.)
                  </label>
                  <input
                    type="url"
                    value={formData.resume}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, resume: e.target.value }))
                    }
                    placeholder="https://..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Certificate URLs (one per line or comma-separated)
                  </label>
                  <textarea
                    value={formData.certificates.join("\n")}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        certificates: e.target.value
                          .split(/[,\n]/)
                          .map((s) => s.trim())
                          .filter((s) => s.length > 0),
                      }))
                    }
                    placeholder="https://...&#10;https://..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Cover Letter *
              </h2>
              <textarea
                value={formData.coverLetter}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, coverLetter: e.target.value }))
                }
                placeholder="Tell us why you want to teach on StudyLinker, what makes you a great teacher, and how you can help students succeed. (Minimum 50 characters)"
                rows={8}
                required
                minLength={50}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">
                {formData.coverLetter.length}/50 characters minimum
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}
