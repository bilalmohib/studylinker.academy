"use client";

import { use, useEffect, useState } from "react";
import Container from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BsClock,
  BsPerson,
  BsBook,
  BsCurrencyDollar,
  BsCalendar,
  BsCheckCircle,
  BsChatDots,
} from "react-icons/bs";
import { getJobPosting } from "@/actions/jobs/actions";
import { getApplicationsByJob } from "@/actions/applications/actions";
import toast from "react-hot-toast";

interface JobData {
  id: string;
  title: string;
  subject: string;
  level: string;
  studentAge: number | null;
  hoursPerWeek: string;
  budget: string;
  postedDate: string;
  applications: number;
  status: string;
  curriculum: boolean;
  description: string;
  requirements: string[];
  parentName: string;
  parentLocation: string;
}

export default function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const [jobResult, applicationsResult] = await Promise.all([
          getJobPosting(id),
          getApplicationsByJob(id),
        ]);

        if (jobResult.success && jobResult.data) {
          const jobData = jobResult.data;
          const parentProfile = jobData.ParentProfile;
          const userProfile = parentProfile?.UserProfile || {};

          // Calculate posted date
          const postedDate = new Date(jobData.createdAt);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - postedDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          let postedDateStr = "";
          if (diffDays === 0) postedDateStr = "Today";
          else if (diffDays === 1) postedDateStr = "1 day ago";
          else if (diffDays < 7) postedDateStr = `${diffDays} days ago`;
          else if (diffDays < 30) postedDateStr = `${Math.floor(diffDays / 7)} weeks ago`;
          else postedDateStr = `${Math.floor(diffDays / 30)} months ago`;

          const parentName = `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() || "Parent";
          const parentLocation = userProfile.location || "Not specified";

          setJob({
            id: jobData.id,
            title: jobData.title,
            subject: jobData.subject,
            level: jobData.level,
            studentAge: jobData.studentAge,
            hoursPerWeek: jobData.hoursPerWeek,
            budget: jobData.budget,
            postedDate: postedDateStr,
            applications: applicationsResult.success ? applicationsResult.data.length : 0,
            status: jobData.status.toLowerCase(),
            curriculum: jobData.curriculum,
            description: jobData.description,
            requirements: jobData.requirements || [],
            parentName,
            parentLocation,
          });
        } else {
          toast.error(jobResult.error || "Failed to load job posting");
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("An error occurred while loading job posting");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12">
        <Container>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </Container>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12">
        <Container>
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Job posting not found.</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{job.title}</h1>
                  {job.status === "open" ? (
                    <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full bg-green-100 text-green-700 shrink-0">
                      Open
                    </span>
                  ) : (
                    <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full bg-gray-100 text-gray-700 shrink-0">
                      Closed
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base text-gray-600">
                  <span className="flex items-center gap-2">
                    <BsBook className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
                    <span>{job.subject}</span>
                  </span>
                  <span>{job.level}</span>
                  {job.studentAge && <span>Age: {job.studentAge}</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <BsClock className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="text-sm text-gray-600">Hours/Week</div>
                  <div className="font-semibold text-gray-900">{job.hoursPerWeek}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BsCurrencyDollar className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="text-sm text-gray-600">Budget</div>
                  <div className="font-semibold text-gray-900">{job.budget}/month</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BsPerson className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="text-sm text-gray-600">Applications</div>
                  <div className="font-semibold text-gray-900">{job.applications}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BsCalendar className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="text-sm text-gray-600">Posted</div>
                  <div className="font-semibold text-gray-900">{job.postedDate}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Job Description
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">{job.description}</p>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Requirements
              </h3>
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <BsCheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {job.curriculum && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <BsCheckCircle className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold text-indigo-900">
                    Platform Curriculum Enabled
                  </span>
                </div>
                <p className="text-sm text-indigo-700 mt-2">
                  This job includes StudyLinker's structured curriculum with
                  assessments and progress tracking.
                </p>
              </div>
            )}
          </div>

          {/* Parent Info */}
          <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">About the Parent</h2>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shrink-0">
                {job.parentName.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 truncate">{job.parentName}</div>
                <div className="text-sm sm:text-base text-gray-600 truncate">{job.parentLocation}</div>
              </div>
            </div>
          </div>

          {/* Apply Section */}
          {job.status === "open" && (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Ready to Apply?</h2>
              <p className="text-sm sm:text-base text-white/90 mb-6">
                Submit your application with your proposed rate and availability. The
                parent will review your profile and get in touch.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  asChild
                  className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full w-full sm:w-auto"
                >
                  <Link href={`/jobs/${id}/apply`} className="text-center">Apply Now</Link>
                </Button>
                <Button
                  asChild
                  className="border-2 border-white bg-transparent text-white hover:bg-white/10 font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full w-full sm:w-auto"
                >
                  <Link href={`/jobs/${id}/contact`} className="flex items-center justify-center">
                    <BsChatDots className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Message Parent
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

