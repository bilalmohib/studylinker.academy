"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Container from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { BsBook, BsCalendar, BsCurrencyDollar, BsInfoCircle, BsStars } from "react-icons/bs";
import toast from "react-hot-toast";
import { createJobPosting } from "@/actions/jobs/actions";
import { getCurrentParentProfile } from "@/actions/parents/actions";
import { useRouter } from "next/navigation";

export default function PostJobPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    level: "",
    studentAge: "",
    hoursPerWeek: "",
    budget: "",
    description: "",
    curriculum: false,
    applicationMode: "open", // "open" or "curated"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-up?redirect_url=/parents/post-job");
    }
  }, [isLoaded, userId, router]);

  // Get parent profile on mount
  useEffect(() => {
    if (!userId) return;

    const fetchParentProfile = async () => {
      const result = await getCurrentParentProfile();
      if (result.success && "data" in result && result.data) {
        setParentId(result.data.id);
      } else {
        toast.error("Please complete your parent profile first");
        router.push("/portal/parent");
      }
    };
    fetchParentProfile();
  }, [userId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!parentId) {
      toast.error("Parent profile not found");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createJobPosting({
        parentId,
        title: formData.title,
        subject: formData.subject,
        level: formData.level,
        studentAge: formData.studentAge ? parseInt(formData.studentAge) : null,
        hoursPerWeek: formData.hoursPerWeek,
        budget: formData.budget,
        description: formData.description,
        requirements: [], // TODO: Add requirements field
        curriculum: formData.curriculum,
        applicationMode: formData.applicationMode.toUpperCase() as "OPEN" | "CURATED",
      });

      if (result.success && "data" in result) {
        toast.success("Job posted successfully!");
        router.push(`/jobs/${result.data.id}`);
      } else {
        toast.error("error" in result ? result.error : "Failed to post job");
      }
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error("An error occurred while posting the job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.subject) {
      alert("Please select a Subject before generating a description.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-job-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: formData.subject,
          level: formData.level,
          studentAge: formData.studentAge,
          hoursPerWeek: formData.hoursPerWeek,
          budget: formData.budget,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate description");
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        description: data.description,
      }));
    } catch (error) {
      console.error("Error generating description:", error);
      alert("Failed to generate job description. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Post a Tuition Job
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              Create a job posting to find qualified teachers for your child
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Mathematics Tutor Needed for O-Level Student"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select Subject</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="English">English</option>
                      <option value="Science">Science</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="History">History</option>
                      <option value="Geography">Geography</option>
                      <option value="Economics">Economics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Education Level *
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select Level</option>
                      <option value="Primary School">Primary School</option>
                      <option value="Middle School">Middle School</option>
                      <option value="Secondary School">Secondary School</option>
                      <option value="O-Level">O-Level</option>
                      <option value="A-Level">A-Level</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Student Age
                  </label>
                  <input
                    type="number"
                    name="studentAge"
                    value={formData.studentAge}
                    onChange={handleChange}
                    placeholder="e.g., 16"
                    min="5"
                    max="18"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Schedule & Budget */}
            <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                Schedule & Budget
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hours Per Week *
                  </label>
                  <input
                    type="text"
                    name="hoursPerWeek"
                    value={formData.hoursPerWeek}
                    onChange={handleChange}
                    placeholder="e.g., 5-8"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Budget (Monthly) *
                  </label>
                  <div className="relative">
                    <BsCurrencyDollar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      placeholder="e.g., $150-200"
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                Additional Details
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Job Description *
                    </label>
                    <Button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={isGenerating || !formData.subject}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 text-sm rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                      title={!formData.subject ? "Please select a Subject first" : "Generate job description using AI"}
                    >
                      <BsStars className="w-4 h-4" />
                      {isGenerating ? "Generating..." : "Generate with AI"}
                    </Button>
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Describe what you're looking for in a teacher, specific requirements, learning goals, etc. Or click 'Generate with AI' to create one automatically."
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {!formData.subject ? (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <span>💡</span>
                      <span>Select a Subject above to enable AI generation</span>
                    </p>
                  ) : null}
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="curriculum"
                    id="curriculum"
                    checked={formData.curriculum}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="curriculum" className="text-sm text-gray-700">
                    <span className="font-semibold">Enable Platform Curriculum</span>
                    <p className="text-gray-600 mt-1">
                      Use StudyLinker's structured curriculum with assessments and
                      standardized reports
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {/* Application Mode */}
            <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                Application Mode
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 border-2 border-indigo-200 rounded-lg bg-indigo-50">
                  <input
                    type="radio"
                    name="applicationMode"
                    id="open"
                    value="open"
                    checked={formData.applicationMode === "open"}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="open" className="flex-1">
                    <span className="font-semibold text-gray-900 block">
                      Open Applications
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Any approved teacher can apply to your job posting
                    </p>
                  </label>
                </div>

                <div className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg">
                  <input
                    type="radio"
                    name="applicationMode"
                    id="curated"
                    value="curated"
                    checked={formData.applicationMode === "curated"}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="curated" className="flex-1">
                    <span className="font-semibold text-gray-900 block">
                      Curated Applications
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Only qualified, high-scoring teachers can apply
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !parentId}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Posting..." : "Post Job"}
                  </Button>
              <Button
                type="button"
                variant="outline"
                className="px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full w-full sm:w-auto"
              >
                Save as Draft
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}

