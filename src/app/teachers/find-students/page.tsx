"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Container from "@/components/common/Container";
import { BsSearch } from "react-icons/bs";
import JobCard from "@/components/marketplace/JobCard";
import FilterSidebar from "@/components/marketplace/FilterSidebar";
import { searchJobPostings } from "@/actions/jobs/actions";
import { getApplicationsByJob } from "@/actions/applications/actions";
import { checkTeacherVerification } from "@/actions/teachers/verification";
import { getCurrentUserProfile } from "@/actions/users/actions";
import toast from "react-hot-toast";

interface Job {
  id: string;
  title: string;
  subject: string;
  level: string;
  studentAge?: number;
  hoursPerWeek: string;
  budget: string;
  postedDate: string;
  applications: number;
  status: "open" | "closed" | "filled" | "cancelled";
  curriculum: boolean;
}

const subjects = [
  "Mathematics",
  "English",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Economics",
];

function FindStudentsPageContent() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [verificationChecked, setVerificationChecked] = useState(false);
  const [filters, setFilters] = useState<{
    subjects?: string[];
    levels?: string[];
    minPrice?: number;
    maxPrice?: number;
  }>({});

  // Initialize filters from URL on mount
  useEffect(() => {
    const urlSubjects = searchParams.get("subjects");
    const urlLevels = searchParams.get("levels");
    const urlMinPrice = searchParams.get("minPrice");
    const urlMaxPrice = searchParams.get("maxPrice");
    const urlPage = searchParams.get("page");

    const initialFilters: {
      subjects?: string[];
      levels?: string[];
      minPrice?: number;
      maxPrice?: number;
    } = {};

    if (urlSubjects) {
      initialFilters.subjects = urlSubjects.split(",").filter(Boolean);
    }
    if (urlLevels) {
      initialFilters.levels = urlLevels.split(",").filter(Boolean);
    }
    if (urlMinPrice) {
      initialFilters.minPrice = parseFloat(urlMinPrice);
    }
    if (urlMaxPrice) {
      initialFilters.maxPrice = parseFloat(urlMaxPrice);
    }
    if (urlPage) {
      setPage(parseInt(urlPage, 10));
    }

    if (Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
    }
  }, [searchParams]);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-up?redirect_url=/teachers/find-students");
    }
  }, [isLoaded, userId, router]);

  // Check teacher verification - only redirect teachers who aren't verified
  // Parents can browse jobs but won't be able to apply (handled on job detail page)
  useEffect(() => {
    if (!userId || !isLoaded) return;

    const checkVerification = async () => {
      try {
        const userResult = await getCurrentUserProfile();
        if (userResult.success && userResult.data) {
          const profile = userResult.data as { role?: string };
          
          // If user is a parent, allow them to browse (like Upwork - clients can see jobs)
          if (profile.role === "PARENT") {
            setVerificationChecked(true);
            return;
          }
        }

        // For teachers, check verification status
        const verificationResult = await checkTeacherVerification();
        console.log("Find Students - Verification check:", verificationResult);
        
        if (verificationResult.success && verificationResult.data) {
          const verification = verificationResult.data;
          
          // If not verified and no application, redirect to application page
          if (!verification.isVerified && !verification.hasApplication) {
            console.log("Redirecting: Not verified and no application");
            toast.error("Please submit your teacher application first");
            router.push("/teachers/apply");
            return;
          }
          
          // If verified or has application, allow access
          setVerificationChecked(true);
        } else {
          // If verification check failed, redirect to application page
          console.log("Redirecting: Verification check failed");
          toast.error("Unable to verify teacher status. Please submit your application.");
          router.push("/teachers/apply");
          return;
        }
      } catch (error) {
        console.error("Error checking teacher verification:", error);
        // Allow access if error (parents can browse, teachers will be blocked at apply stage)
        setVerificationChecked(true);
      }
    };

    checkVerification();
  }, [userId, isLoaded, router]);

  // Fetch jobs - only after verification is checked
  useEffect(() => {
    if (!userId || !verificationChecked) return;

    const fetchJobs = async () => {
      setLoading(true);
      try {
        // Check if user is a parent - parents can browse without verification
        const userResult = await getCurrentUserProfile();
        const isParent = userResult.success && userResult.data && 
          (userResult.data as { role?: string }).role === "PARENT";

        // Only check teacher verification if user is NOT a parent
        if (!isParent) {
          const verificationResult = await checkTeacherVerification();
          if (!verificationResult.success || !verificationResult.data) {
            toast.error("Unable to verify teacher status");
            setLoading(false);
            return;
          }

          const verification = verificationResult.data;

          // If not verified, redirect based on application status
          if (!verification.isVerified) {
            if (!verification.hasApplication) {
              toast.error("Please submit your teacher application first");
              router.push("/teachers/apply");
              setLoading(false);
              return;
            } else {
              // Has application but not verified
              const statusMessages: Record<string, string> = {
                PENDING: "Your application is pending review. You'll be able to browse jobs once approved.",
                UNDER_REVIEW: "Your application is under review. You'll be able to browse jobs once approved.",
                INTERVIEW_SCHEDULED: "An interview has been scheduled. You'll be able to browse jobs once approved.",
                INTERVIEW_COMPLETED: "Your interview is complete. You'll be able to browse jobs once approved.",
                REJECTED: "Your application was not approved. Please contact support.",
              };
              const message = statusMessages[verification.applicationStatus || ""] || 
                "Your application is being processed. You'll be able to browse jobs once approved.";
              toast.error(message);
              router.push("/portal/teacher");
              setLoading(false);
              return;
            }
          }
        }
        
        // Fetch jobs (for both parents and verified teachers)
        const searchFilters: any = {
          status: "OPEN", // Status must be uppercase to match database
          page,
          limit: 20,
        };

        // Apply subject filter (use first selected subject if multiple)
        if (filters.subjects && filters.subjects.length > 0) {
          searchFilters.subject = filters.subjects[0]; // API currently supports single subject
        }

        // Apply level filter (use first selected level if multiple)
        if (filters.levels && filters.levels.length > 0) {
          searchFilters.level = filters.levels[0]; // API currently supports single level
        }

        console.log("Fetching jobs with filters:", searchFilters);
        const result = await searchJobPostings(searchFilters);

        console.log("Search result:", result);
        if (result.success && result.data) {
          console.log("Jobs found:", result.data.length);
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
                studentAge: job.studentAge ?? undefined,
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
          const errorMessage = "error" in result ? result.error : "Failed to load jobs";
          toast.error(errorMessage);
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
  }, [userId, page, verificationChecked, filters]);

  // Show loading if verification hasn't been checked yet
  if (userId && !verificationChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      // For now, search by subject if query matches a subject
                      const matchingSubject = subjects.find(s => 
                        s.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                      if (matchingSubject) {
                        setFilters({ ...filters, subjects: [matchingSubject] });
                        setPage(1);
                      }
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Suspense fallback={
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg h-fit lg:sticky lg:top-4">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            }>
              <FilterSidebar 
                type="jobs" 
                onFilterChange={(newFilters) => {
                  setFilters(newFilters);
                  setPage(1); // Reset to first page when filters change
                  
                  // Update URL with new filters
                  const params = new URLSearchParams();
                  if (newFilters.subjects && newFilters.subjects.length > 0) {
                    params.set("subjects", newFilters.subjects.join(","));
                  }
                  if (newFilters.levels && newFilters.levels.length > 0) {
                    params.set("levels", newFilters.levels.join(","));
                  }
                  if (newFilters.minPrice !== undefined && newFilters.minPrice !== null) {
                    params.set("minPrice", newFilters.minPrice.toString());
                  }
                  if (newFilters.maxPrice !== undefined && newFilters.maxPrice !== null) {
                    params.set("maxPrice", newFilters.maxPrice.toString());
                  }
                  
                  // Update URL without page reload
                  const newUrl = params.toString() ? `/teachers/find-students?${params.toString()}` : "/teachers/find-students";
                  router.push(newUrl, { scroll: false });
                }}
              />
            </Suspense>
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
                    <JobCard 
                      key={job.id} 
                      {...job} 
                      status={job.status === "filled" || job.status === "cancelled" ? "closed" : job.status}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                    <button
                      onClick={() => {
                        const newPage = Math.max(1, page - 1);
                        setPage(newPage);
                        // Update URL with new page
                        const params = new URLSearchParams(searchParams.toString());
                        params.set("page", newPage.toString());
                        router.push(`/teachers/find-students?${params.toString()}`, { scroll: false });
                      }}
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
                          onClick={() => {
                            setPage(pageNum);
                            // Update URL with new page
                            const params = new URLSearchParams(searchParams.toString());
                            params.set("page", pageNum.toString());
                            router.push(`/teachers/find-students?${params.toString()}`, { scroll: false });
                          }}
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
                      onClick={() => {
                        const newPage = Math.min(totalPages, page + 1);
                        setPage(newPage);
                        // Update URL with new page
                        const params = new URLSearchParams(searchParams.toString());
                        params.set("page", newPage.toString());
                        router.push(`/teachers/find-students?${params.toString()}`, { scroll: false });
                      }}
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

export default function FindStudentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <FindStudentsPageContent />
    </Suspense>
  );
}

