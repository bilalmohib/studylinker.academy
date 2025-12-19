"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Container from "@/components/common/Container";
import { BsSearch } from "react-icons/bs";
import JobCard from "@/components/marketplace/JobCard";
import FilterSidebar from "@/components/marketplace/FilterSidebar";
import { searchJobPostings } from "@/actions/jobs/actions";
import { getApplicationsByJob } from "@/actions/applications/actions";
import toast from "react-hot-toast";

interface Job {
  id: string;
  title: string;
  subject: string;
  level: string;
  studentAge: number | null;
  hoursPerWeek: string;
  budget: string;
  postedDate: string;
  applications: number;
  status: "open" | "closed" | "filled" | "cancelled";
  curriculum: boolean;
}

export default function FindStudentsPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-up?redirect_url=/teachers/find-students");
    }
  }, [isLoaded, userId, router]);

  // Fetch jobs
  useEffect(() => {
    if (!userId) return;

    const fetchJobs = async () => {
      setLoading(true);
      try {
        const result = await searchJobPostings({
          status: "OPEN",
          page,
          limit: 20,
        });

        if (result.success && result.data) {
          const transformedJobs = await Promise.all(
            result.data.map(async (job: any) => {
              // Calculate posted date
              const postedDate = new Date(job.createdAt);
              const now = new Date();
              const diffTime = Math.abs(now.getTime() - postedDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              let postedDateStr = "";
              if (diffDays === 0) postedDateStr = "Today";
              else if (diffDays === 1) postedDateStr = "1 day ago";
              else if (diffDays < 7) postedDateStr = `${diffDays} days ago`;
              else if (diffDays < 30) postedDateStr = `${Math.floor(diffDays / 7)} weeks ago`;
              else postedDateStr = `${Math.floor(diffDays / 30)} months ago`;

              // Get application count
              const applicationsResult = await getApplicationsByJob(job.id);
              const applicationCount = applicationsResult.success && applicationsResult.data
                ? applicationsResult.data.length
                : 0;

              return {
                id: job.id,
                title: job.title,
                subject: job.subject,
                level: job.level,
                studentAge: job.studentAge,
                hoursPerWeek: job.hoursPerWeek,
                budget: job.budget,
                postedDate: postedDateStr,
                applications: applicationCount,
                status: job.status.toLowerCase() as "open" | "closed" | "filled" | "cancelled",
                curriculum: job.curriculum,
              };
            })
          );

          setJobs(transformedJobs);
          setTotalPages(result.pagination?.totalPages || 1);
        } else {
          toast.error(result.error || "Failed to load jobs");
          setJobs([]);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("An error occurred while loading jobs");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [userId, page]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12">
      <Container>
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Find Students
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              Browse job postings from parents and find students who need your expertise
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <BsSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by subject, level, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <FilterSidebar type="jobs" />
          </div>

          {/* Jobs Grid */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {loading ? "Loading..." : `${jobs.length} Jobs Available`}
              </h2>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base w-full sm:w-auto">
                <option>Sort by: Newest First</option>
                <option>Sort by: Highest Budget</option>
                <option>Sort by: Most Applications</option>
                <option>Sort by: Fewest Applications</option>
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No jobs found. Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <JobCard key={job.id} {...job} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                            page === pageNum
                              ? "bg-indigo-600 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

