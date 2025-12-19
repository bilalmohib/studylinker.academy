"use client";

import { useState } from "react";
import Container from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { BsBook, BsCalendar, BsCurrencyDollar, BsInfoCircle } from "react-icons/bs";

export default function PostJobPage() {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Job posted:", formData);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Post a Tuition Job
            </h1>
            <p className="text-xl text-gray-600">
              Create a job posting to find qualified teachers for your child
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Additional Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Describe what you're looking for in a teacher, specific requirements, learning goals, etc."
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
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
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-xl"
              >
                Post Job
              </Button>
              <Button
                type="button"
                variant="outline"
                className="px-8 py-6 text-lg rounded-full"
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

