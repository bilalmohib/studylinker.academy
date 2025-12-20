"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Container from "@/components/common/Container";
import {
  BsBriefcase,
  BsCalendar,
  BsBarChart,
  BsChatDots,
  BsCurrencyDollar,
  BsPeople,
} from "react-icons/bs";
import { getCurrentTeacherProfile } from "@/actions/teachers/actions";
import { getApplicationsByTeacher } from "@/actions/applications/actions";
import { getContractsByTeacher } from "@/actions/contracts/actions";
import { getUpcomingClassesForTeacher, getClassesByContract } from "@/actions/classes/actions";
import { checkTeacherVerification } from "@/actions/teachers/verification";

interface Application {
  id: string;
  jobTitle: string;
  status: string;
  appliedDate: string;
  jobId: string;
}

interface Student {
  id: string;
  name: string;
  subject: string;
  nextClass: string;
  progress: number;
  contractId: string;
}

interface UpcomingClass {
  id: string;
  title: string;
  scheduledAt: string;
  studentName: string;
}

export default function TeacherDashboardPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [stats, setStats] = useState({
    activeStudents: 0,
    applications: 0,
    earnings: 0,
    avgRating: 0,
  });
  const [verificationStatus, setVerificationStatus] = useState<{
    isVerified: boolean;
    hasApplication: boolean;
    applicationStatus: string | null;
  } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-up?redirect_url=/portal/teacher");
    }
  }, [isLoaded, userId, router]);

  useEffect(() => {
    if (!userId) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Check teacher verification status first
        const verificationResult = await checkTeacherVerification();
        if (!verificationResult.success || !verificationResult.data) {
          toast.error("Unable to verify teacher status");
          setLoading(false);
          return;
        }

        const verification = verificationResult.data;
        setVerificationStatus({
          isVerified: verification.isVerified,
          hasApplication: verification.hasApplication,
          applicationStatus: verification.applicationStatus,
        });

        // If not verified and no application, redirect to application page
        if (!verification.isVerified && !verification.hasApplication) {
          toast.error("Please submit your teacher application first");
          router.push("/teachers/apply");
          setLoading(false);
          return;
        }

        // If not verified but has application, show dashboard with application status
        if (!verification.isVerified && verification.hasApplication) {
          // Still load dashboard data but show application status banner
          setLoading(false);
          return;
        }

        // Get teacher profile (only if verified)
        const teacherResult = await getCurrentTeacherProfile();
        if (!teacherResult.success || !("data" in teacherResult)) {
          toast.error("Please complete your teacher profile");
          setLoading(false);
          return;
        }
        
        const teacherData = teacherResult.data as { id: string; rating?: number } | undefined;
        if (!teacherData) {
          toast.error("Please complete your teacher profile");
          setLoading(false);
          return;
        }

        const teacherId = teacherData.id;
        const teacherProfile = teacherData;

        // Fetch all data in parallel
        const [applicationsResult, contractsResult, classesResult] = await Promise.all([
          getApplicationsByTeacher(teacherId),
          getContractsByTeacher(teacherId),
          getUpcomingClassesForTeacher(teacherId),
        ]);

        // Process applications
        if (applicationsResult.success && applicationsResult.data) {
          const transformedApplications = applicationsResult.data.map((app: any) => {
            const job = app.JobPosting || {};
            const postedDate = new Date(app.createdAt);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - postedDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let appliedDate = "";
            if (diffDays === 0) appliedDate = "Today";
            else if (diffDays === 1) appliedDate = "1 day ago";
            else if (diffDays < 7) appliedDate = `${diffDays} days ago`;
            else if (diffDays < 30) appliedDate = `${Math.floor(diffDays / 7)} weeks ago`;
            else appliedDate = `${Math.floor(diffDays / 30)} months ago`;

            return {
              id: app.id,
              jobTitle: job.title || "Unknown Job",
              status: app.status.toLowerCase(),
              appliedDate,
              jobId: app.jobId,
            };
          });

          setApplications(transformedApplications);
          setStats((prev) => ({
            ...prev,
            applications: transformedApplications.length,
          }));
        }

        // Process contracts (students)
        if (contractsResult.success && contractsResult.data) {
          const activeContracts = contractsResult.data.filter(
            (c: any) => c.status === "ACTIVE"
          );

          const studentsData = await Promise.all(
            activeContracts.map(async (contract: any) => {
              const student = contract.Student || {};
              const name = `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student";

              // Get upcoming classes for this contract
              const classesResult = await getClassesByContract(contract.id);
              let nextClass = "No upcoming classes";
              if (classesResult.success && classesResult.data && classesResult.data.length > 0) {
                const classes = classesResult.data as Array<{ scheduledAt: string }>;
                const upcoming = classes
                  .filter((c) => new Date(c.scheduledAt) > new Date())
                  .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0] as { scheduledAt: string } | undefined;
                
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
                id: contract.studentId,
                name,
                subject: contract.subject,
                nextClass,
                progress: 0, // TODO: Calculate from progress reports
                contractId: contract.id,
              };
            })
          );

          setStudents(studentsData);
          setStats((prev) => ({
            ...prev,
            activeStudents: studentsData.length,
          }));
        }

        // Process upcoming classes
        if (classesResult.success && classesResult.data) {
          const transformedClasses = classesResult.data.map((classItem: any) => {
            const contract = classItem.Contract || {};
            const student = contract?.Student || {};
            const studentName = `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student";
            
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
            
            return {
              id: classItem.id,
              title: classItem.title || contract.subject || "Class",
              scheduledAt: `${dateStr}, ${time}`,
              studentName,
            };
          });

          setUpcomingClasses(transformedClasses);
        }

        // Calculate earnings (from active contracts)
        if (contractsResult.success && contractsResult.data) {
          const activeContracts = contractsResult.data.filter(
            (c: any) => c.status === "ACTIVE"
          );
          
          // TODO: Calculate actual earnings from payments
          const monthlyEarnings = activeContracts.reduce((sum: number, contract: any) => {
            return sum + (parseFloat(contract.rate) || 0);
          }, 0);

          setStats((prev) => ({
            ...prev,
            earnings: monthlyEarnings,
            avgRating: (teacherProfile?.rating || 0),
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
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-indigo-50 py-12">
        <Container>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </Container>
      </div>
    );
  }

  // Show application status banner if not verified
  const showApplicationBanner = verificationStatus && !verificationStatus.isVerified && verificationStatus.hasApplication;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-indigo-50 py-12">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Teacher Dashboard
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Manage your teaching schedule and students
          </p>
        </div>

        {/* Application Status Banner */}
        {showApplicationBanner && (
          <div className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  Application Under Review
                </h3>
                <p className="text-sm sm:text-base text-gray-700 mb-4 break-words">
                  {verificationStatus.applicationStatus === "PENDING" && 
                    "Your teacher application has been submitted and is pending review. We'll notify you once it's been reviewed."}
                  {verificationStatus.applicationStatus === "UNDER_REVIEW" && 
                    "Your teacher application is currently under review by our team. We'll notify you of the outcome soon."}
                  {verificationStatus.applicationStatus === "INTERVIEW_SCHEDULED" && 
                    "An interview has been scheduled for your application. Please check your email for details."}
                  {verificationStatus.applicationStatus === "INTERVIEW_COMPLETED" && 
                    "Your interview has been completed. We're finalizing the review of your application."}
                  {verificationStatus.applicationStatus === "REJECTED" && 
                    "Your application was not approved. Please contact support if you have questions."}
                  {!verificationStatus.applicationStatus && 
                    "Your teacher application is being processed. We'll notify you once it's been reviewed."}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="border-yellow-600 text-yellow-700 hover:bg-yellow-100 text-sm sm:text-base w-full sm:w-auto"
                  >
                    <Link href="/teachers/apply">View Application</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <BsPeople className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.activeStudents}</div>
                <div className="text-xs sm:text-sm text-gray-600">Active Students</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <BsBriefcase className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.applications}</div>
                <div className="text-xs sm:text-sm text-gray-600">Applications</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <BsCurrencyDollar className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">${stats.earnings.toLocaleString()}</div>
                <div className="text-xs sm:text-sm text-gray-600">Monthly Earnings</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <BsBarChart className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</div>
                <div className="text-xs sm:text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Button
            asChild
            className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-4 sm:p-6 rounded-2xl shadow-lg h-auto flex-col gap-2"
          >
            <Link href="/teachers/find-students" className="flex flex-col items-center gap-2">
              <BsBriefcase className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="text-base sm:text-lg font-semibold">Find Students</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 p-4 sm:p-6 rounded-2xl h-auto flex-col gap-2"
          >
            <Link href="/portal/teacher/schedule" className="flex flex-col items-center gap-2">
              <BsCalendar className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="text-base sm:text-lg font-semibold">View Schedule</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 p-4 sm:p-6 rounded-2xl h-auto flex-col gap-2"
          >
            <Link href="/portal/teacher/earnings" className="flex flex-col items-center gap-2">
              <BsCurrencyDollar className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="text-base sm:text-lg font-semibold">Earnings</span>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* My Students */}
          <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Students</h2>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-indigo-600 text-indigo-600 w-full sm:w-auto"
              >
                <Link href="/teachers/find-students">Find More</Link>
              </Button>
            </div>
            {students.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No active students yet</p>
                <Button asChild variant="outline" className="border-indigo-600 text-indigo-600">
                  <Link href="/teachers/find-students">Find Students</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="flex items-start gap-3 sm:gap-4 mb-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 break-words">{student.name}</h3>
                        <p className="text-sm text-gray-600 break-words">{student.subject}</p>
                      </div>
                      {student.progress > 0 && (
                        <div className="text-right shrink-0">
                          <div className="text-sm font-semibold text-indigo-600">
                            {student.progress}%
                          </div>
                          <div className="text-xs text-gray-500">Progress</div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BsCalendar className="w-4 h-4 shrink-0" />
                        <span className="break-words">Next: {student.nextClass}</span>
                      </div>
                      <Link
                        href={`/portal/teacher/students/${student.id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold shrink-0"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Applications */}
          <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Applications</h2>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-indigo-600 text-indigo-600 w-full sm:w-auto"
              >
                <Link href="/teachers/find-students">Browse Jobs</Link>
              </Button>
            </div>
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No applications yet</p>
                <Button asChild variant="outline" className="border-indigo-600 text-indigo-600">
                  <Link href="/teachers/find-students">Browse Jobs</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 break-words flex-1 min-w-0">{app.jobTitle}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full shrink-0 ${
                          app.status === "accepted"
                            ? "bg-green-100 text-green-700"
                            : app.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-sm text-gray-600">
                        Applied {app.appliedDate}
                      </span>
                      <Link
                        href={`/jobs/${app.jobId}`}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold shrink-0"
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 break-words flex-1">{classItem.title}</h3>
                      <span className="text-sm text-gray-600 shrink-0">{classItem.scheduledAt}</span>
                    </div>
                    <p className="text-sm text-gray-600 break-words">Student: {classItem.studentName}</p>
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
                <BsChatDots className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900">
                    New message from Emma's parent
                  </p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BsBriefcase className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900">
                    Application accepted for Primary English Tutor
                  </p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BsBarChart className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900">
                    Progress report submitted for James
                  </p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
