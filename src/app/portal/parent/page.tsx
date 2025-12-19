"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Container from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BsPlusCircle,
  BsPeople,
  BsCalendar,
  BsBarChart,
  BsChatDots,
  BsFileText,
} from "react-icons/bs";
import { getCurrentParentProfile } from "@/actions/parents/actions";
import { getJobPostingsByParent } from "@/actions/jobs/actions";
import { getContractsByParent } from "@/actions/contracts/actions";
import { getClassesByContract } from "@/actions/classes/actions";
import { getApplicationsByJob } from "@/actions/applications/actions";
import toast from "react-hot-toast";

interface Job {
  id: string;
  title: string;
  applications: number;
  status: string;
}

interface HiredTeacher {
  id: string;
  name: string;
  subject: string;
  nextClass: string;
}

interface UpcomingClass {
  id: string;
  title: string;
  scheduledAt: string;
  teacherName: string;
}

export default function ParentDashboardPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [hiredTeachers, setHiredTeachers] = useState<HiredTeacher[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [stats, setStats] = useState({
    activeJobs: 0,
    hiredTeachers: 0,
    upcomingClasses: 0,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-up?redirect_url=/portal/parent");
    }
  }, [isLoaded, userId, router]);

  useEffect(() => {
    if (!userId) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Get parent profile
        const parentResult = await getCurrentParentProfile();
        if (!parentResult.success || !("data" in parentResult)) {
          toast.error("Please complete your parent profile");
          return;
        }

        const parentId = parentResult.data.id;

        // Fetch all data in parallel
        const [jobsResult, contractsResult] = await Promise.all([
          getJobPostingsByParent(parentId),
          getContractsByParent(parentId),
        ]);

        // Process jobs
        if (jobsResult.success && jobsResult.data) {
          const jobsWithApplications = await Promise.all(
            jobsResult.data.map(async (job: any) => {
              const applicationsResult = await getApplicationsByJob(job.id);
              return {
                id: job.id,
                title: job.title,
                applications:
                  applicationsResult.success && applicationsResult.data
                    ? applicationsResult.data.length
                    : 0,
                status: job.status.toLowerCase(),
              };
            })
          );
          setJobs(jobsWithApplications);
          setStats((prev) => ({
            ...prev,
            activeJobs: jobsWithApplications.filter((j) => j.status === "open").length,
          }));
        }

        // Process contracts (hired teachers)
        if (contractsResult.success && contractsResult.data) {
          const activeContracts = contractsResult.data.filter(
            (c: any) => c.status === "ACTIVE"
          );

          const teachersData = await Promise.all(
            activeContracts.map(async (contract: any) => {
              const teacherProfile = contract.TeacherProfile || {};
              const userProfile = teacherProfile.UserProfile || {};
              const name = `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() || "Teacher";

              // Get upcoming classes for this contract
              const classesResult = await getClassesByContract(contract.id);
              let nextClass = "No upcoming classes";
              if (classesResult.success && classesResult.data && classesResult.data.length > 0) {
                const upcoming = classesResult.data
                  .filter((c: any) => new Date(c.scheduledAt) > new Date())
                  .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
                
                if (upcoming) {
                  const classDate = new Date(upcoming.scheduledAt);
                  const now = new Date();
                  const diffTime = classDate.getTime() - now.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  if (diffDays === 0) nextClass = "Today";
                  else if (diffDays === 1) nextClass = "Tomorrow";
                  else if (diffDays < 7) nextClass = `${diffDays} days`;
                  else nextClass = classDate.toLocaleDateString();
                  
                  const time = classDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  nextClass += `, ${time}`;
                }
              }

              return {
                id: contract.teacherId,
                name,
                subject: contract.subject,
                nextClass,
              };
            })
          );

          setHiredTeachers(teachersData);
          setStats((prev) => ({
            ...prev,
            hiredTeachers: teachersData.length,
          }));

          // Get upcoming classes from all contracts
          const allClasses: UpcomingClass[] = [];
          for (const contract of activeContracts) {
            const classesResult = await getClassesByContract(contract.id);
            if (classesResult.success && classesResult.data) {
              const upcoming = classesResult.data
                .filter((c: any) => new Date(c.scheduledAt) > new Date())
                .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                .slice(0, 5);

              for (const classItem of upcoming) {
                const teacherProfile = contract.TeacherProfile || {};
                const userProfile = teacherProfile.UserProfile || {};
                const teacherName = `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() || "Teacher";
                
                const classDate = new Date(classItem.scheduledAt);
                const now = new Date();
                const diffTime = classDate.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let dateStr = "";
                if (diffDays === 0) dateStr = "Today";
                else if (diffDays === 1) dateStr = "Tomorrow";
                else if (diffDays < 7) dateStr = `${diffDays} days`;
                else dateStr = classDate.toLocaleDateString();
                
                const time = classDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                allClasses.push({
                  id: classItem.id,
                  title: classItem.title,
                  scheduledAt: `${dateStr}, ${time}`,
                  teacherName,
                });
              }
            }
          }

          allClasses.sort((a, b) => {
            // Sort by scheduled time (simplified)
            return a.scheduledAt.localeCompare(b.scheduledAt);
          });

          setUpcomingClasses(allClasses.slice(0, 5));
          setStats((prev) => ({
            ...prev,
            upcomingClasses: allClasses.length,
          }));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("An error occurred while loading dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Parent Dashboard
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Manage your children's education and teachers
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Button
            asChild
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-6 rounded-2xl shadow-lg h-auto flex-col gap-2"
          >
            <Link href="/parents/post-job">
              <BsPlusCircle className="w-8 h-8" />
              <span className="text-lg font-semibold">Post a Job</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 p-6 rounded-2xl h-auto flex-col gap-2"
          >
            <Link href="/parents/find-teachers">
              <BsPeople className="w-8 h-8" />
              <span className="text-lg font-semibold">Find Teachers</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 p-6 rounded-2xl h-auto flex-col gap-2"
          >
            <Link href="/parents/reports">
              <BsBarChart className="w-8 h-8" />
              <span className="text-lg font-semibold">View Reports</span>
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <BsFileText className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.activeJobs}</div>
                <div className="text-xs sm:text-sm text-gray-600">Active Jobs</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <BsPeople className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.hiredTeachers}</div>
                <div className="text-xs sm:text-sm text-gray-600">Hired Teachers</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <BsCalendar className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.upcomingClasses}</div>
                <div className="text-xs sm:text-sm text-gray-600">Upcoming Classes</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Jobs */}
          <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Active Jobs</h2>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-indigo-600 text-indigo-600 w-full sm:w-auto"
              >
                <Link href="/parents/post-job">Post New</Link>
              </Button>
            </div>
            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No active jobs yet</p>
                <Button asChild variant="outline" className="border-indigo-600 text-indigo-600">
                  <Link href="/parents/post-job">Post Your First Job</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        job.status === "open"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {job.applications} application{job.applications !== 1 ? "s" : ""}
                      </span>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hired Teachers */}
          <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Hired Teachers</h2>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-indigo-600 text-indigo-600 w-full sm:w-auto"
              >
                <Link href="/parents/find-teachers">Find More</Link>
              </Button>
            </div>
            {hiredTeachers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No hired teachers yet</p>
                <Button asChild variant="outline" className="border-indigo-600 text-indigo-600">
                  <Link href="/parents/find-teachers">Find Teachers</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {hiredTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="flex items-start gap-4 mb-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {teacher.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                        <p className="text-sm text-gray-600">{teacher.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BsCalendar className="w-4 h-4" />
                        <span>Next: {teacher.nextClass}</span>
                      </div>
                      <Link
                        href={`/teachers/${teacher.id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Classes */}
          <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              Upcoming Classes
            </h2>
            {upcomingClasses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No upcoming classes scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingClasses.map((classItem) => (
                  <div key={classItem.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{classItem.title}</h3>
                      <span className="text-sm text-gray-600">{classItem.scheduledAt}</span>
                    </div>
                    <p className="text-sm text-gray-600">Teacher: {classItem.teacherName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <BsFileText className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900">
                    New application received for Mathematics Tutor job
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BsBarChart className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900">
                    Progress report available for Mathematics
                  </p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BsChatDots className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900">
                    New message from Sarah Johnson
                  </p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
