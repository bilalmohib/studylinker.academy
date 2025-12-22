"use client";

import { useState, useEffect } from "react";
import Container from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import {
  BsCheckCircle,
  BsXCircle,
  BsClock,
  BsCalendar,
  BsStar,
  BsEye,
  BsCheck,
  BsX,
  BsPencil,
  BsSave,
  BsEnvelope,
} from "react-icons/bs";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  getAllTeacherApplications,
  updateApplicationStatus,
  scheduleInterview,
  scoreInterview,
  getTeacherApplication,
  sendInterviewEmail,
} from "@/actions/teacher-applications/actions";
import { useRealtimeTeacherApplications } from "@/hooks/useRealtime";

interface Application {
  id: string;
  userId: string;
  subjects: string[];
  levels: string[];
  qualifications: any;
  experience: string;
  resume: string;
  certificates: string[];
  coverLetter: string;
  status: string;
  interviewScheduledAt: string | null;
  interviewLink: string | null;
  interviewNotes: string | null;
  interviewScore: number | null;
  maxInterviewScore: number | null;
  adminNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  UserProfile: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
  };
  Reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export default function AdminTeacherApplicationsPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [interviewData, setInterviewData] = useState({
    interviewScheduledAt: "",
    interviewLink: "",
    interviewNotes: "",
  });
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [scoreData, setScoreData] = useState({
    interviewScore: "",
    maxInterviewScore: "100",
    interviewNotes: "",
  });
  const [rejectData, setRejectData] = useState({
    rejectionReason: "",
    adminNotes: "",
  });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isEditingInterview, setIsEditingInterview] = useState(false);
  const [editInterviewData, setEditInterviewData] = useState({
    interviewScheduledAt: "",
    interviewLink: "",
    interviewNotes: "",
  });

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      router.push("/sign-in");
      return;
    }

    fetchApplications();
  }, [userId, isLoaded, statusFilter, page, router]);

  // Realtime subscription for teacher applications
  useRealtimeTeacherApplications(
    (application) => {
      // Update the applications list when a new application is created or updated
      setApplications((prev) => {
        const existingIndex = prev.findIndex((app) => app.id === application.id);
        if (existingIndex >= 0) {
          // Update existing application
          const updated = [...prev];
          updated[existingIndex] = { ...prev[existingIndex], ...application };
          return updated;
        } else {
          // Add new application at the beginning
          return [application, ...prev];
        }
      });
      toast.success("Application updated in real-time!");
    },
    !!userId && isLoaded
  );

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const result = await getAllTeacherApplications({
        status: statusFilter || undefined,
        page,
        limit: 20,
      });

      if (result.success && "data" in result) {
        const apps = (result as { success: true; data: Application[] }).data;
        if (apps) {
          setApplications(apps);
          if (result.pagination) {
            setTotalPages(result.pagination.totalPages);
          }
        } else {
          setApplications([]);
        }
      } else {
        toast.error("error" in result ? result.error : "Failed to load applications");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("An error occurred while loading applications");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const result = await updateApplicationStatus({
        id: applicationId,
        status: newStatus as any,
      });

      if (result.success) {
        toast.success("Application status updated");
        fetchApplications();
        setSelectedApplication(null);
      } else {
        toast.error("error" in result ? result.error : "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("An error occurred");
    }
  };

  const handleGenerateDescription = async () => {
    if (!selectedApplication || !interviewData.interviewScheduledAt) {
      toast.error("Please select interview date and time first");
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const response = await fetch("/api/generate-meeting-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacherName: `${selectedApplication.UserProfile.firstName} ${selectedApplication.UserProfile.lastName}`,
          interviewDate: interviewData.interviewScheduledAt,
          subjects: selectedApplication.subjects,
          levels: selectedApplication.levels,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || "Failed to generate description");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.details || data.error);
      }
      
      setInterviewData((prev) => ({
        ...prev,
        interviewNotes: data.description,
      }));
      toast.success("Meeting description generated successfully!");
    } catch (error) {
      console.error("Error generating description:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate meeting description. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedApplication) return;

    if (!interviewData.interviewScheduledAt) {
      toast.error("Please select interview date and time");
      return;
    }

    if (!interviewData.interviewLink) {
      toast.error("Please provide a meeting link");
      return;
    }

    try {
      // Convert datetime-local format to ISO 8601 format
      const dateTimeValue = interviewData.interviewScheduledAt;
      const isoDateTime = dateTimeValue ? new Date(dateTimeValue).toISOString() : "";

      const result = await scheduleInterview({
        id: selectedApplication.id,
        interviewScheduledAt: isoDateTime,
        interviewLink: interviewData.interviewLink || null,
        interviewNotes: interviewData.interviewNotes || null,
      });

      if (result.success && "data" in result) {
        toast.success("Interview scheduled successfully!");
        setShowInterviewModal(false);
        setSelectedApplication(null);
        setInterviewData({ interviewScheduledAt: "", interviewLink: "", interviewNotes: "" });
        fetchApplications();
      } else {
        toast.error("error" in result ? result.error : "Failed to schedule interview");
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast.error("An error occurred");
    }
  };

  const handleScoreInterview = async () => {
    if (!selectedApplication) return;

    if (!scoreData.interviewScore) {
      toast.error("Please enter interview score");
      return;
    }

    try {
      const result = await scoreInterview({
        id: selectedApplication.id,
        interviewScore: parseFloat(scoreData.interviewScore),
        maxInterviewScore: parseFloat(scoreData.maxInterviewScore),
        interviewNotes: scoreData.interviewNotes || null,
      });

      if (result.success) {
        toast.success("Interview scored successfully");
        setShowScoreModal(false);
        setScoreData({ interviewScore: "", maxInterviewScore: "100", interviewNotes: "" });
        fetchApplications();
        setSelectedApplication(null);
      } else {
        toast.error("error" in result ? result.error : "Failed to score interview");
      }
    } catch (error) {
      console.error("Error scoring interview:", error);
      toast.error("An error occurred");
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;

    if (!rejectData.rejectionReason) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const result = await updateApplicationStatus({
        id: selectedApplication.id,
        status: "REJECTED",
        rejectionReason: rejectData.rejectionReason,
        adminNotes: rejectData.adminNotes || null,
      });

      if (result.success) {
        toast.success("Application rejected");
        setShowRejectModal(false);
        setRejectData({ rejectionReason: "", adminNotes: "" });
        fetchApplications();
        setSelectedApplication(null);
      } else {
        toast.error("error" in result ? result.error : "Failed to reject application");
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast.error("An error occurred");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; icon: any; label: string }> = {
      PENDING: { color: "bg-yellow-100 text-yellow-700", icon: BsClock, label: "Pending" },
      UNDER_REVIEW: { color: "bg-blue-100 text-blue-700", icon: BsEye, label: "Under Review" },
      INTERVIEW_SCHEDULED: { color: "bg-purple-100 text-purple-700", icon: BsCalendar, label: "Interview Scheduled" },
      INTERVIEW_COMPLETED: { color: "bg-indigo-100 text-indigo-700", icon: BsStar, label: "Interview Completed" },
      APPROVED: { color: "bg-green-100 text-green-700", icon: BsCheckCircle, label: "Approved" },
      REJECTED: { color: "bg-red-100 text-red-700", icon: BsXCircle, label: "Rejected" },
    };

    const config = statusMap[status] || statusMap.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  if (loading || !isLoaded || !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Teacher Applications
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Review and manage teacher applications
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="INTERVIEW_COMPLETED">Interview Completed</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {app.UserProfile.firstName?.charAt(0) || "T"}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {app.UserProfile.firstName} {app.UserProfile.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{app.UserProfile.email}</p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                  <div className="mt-4 space-y-2">
                    <div>
                      <span className="text-sm font-semibold text-gray-700">Subjects: </span>
                      <span className="text-sm text-gray-600">{app.subjects.join(", ")}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-700">Levels: </span>
                      <span className="text-sm text-gray-600">{app.levels.join(", ")}</span>
                    </div>
                    {app.interviewScore !== null && (
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Interview Score: </span>
                        <span className="text-sm text-gray-600">
                          {app.interviewScore}/{app.maxInterviewScore || 100}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-semibold text-gray-700">Applied: </span>
                      <span className="text-sm text-gray-600">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => setSelectedApplication(app)}
                    variant="outline"
                    size="sm"
                  >
                    <BsEye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  {app.status === "PENDING" && (
                    <Button
                      onClick={() => handleStatusChange(app.id, "UNDER_REVIEW")}
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600"
                    >
                      Start Review
                    </Button>
                  )}
                  {app.status === "UNDER_REVIEW" && (
                    <Button
                      onClick={() => {
                        setSelectedApplication(app);
                        setShowInterviewModal(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-purple-600 text-purple-600"
                    >
                      <BsCalendar className="w-4 h-4 mr-2" />
                      Schedule Interview
                    </Button>
                  )}
                  {app.status === "INTERVIEW_SCHEDULED" && (
                    <Button
                      onClick={() => {
                        setSelectedApplication(app);
                        setShowScoreModal(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-indigo-600 text-indigo-600"
                    >
                      <BsStar className="w-4 h-4 mr-2" />
                      Score Interview
                    </Button>
                  )}
                  {app.status === "INTERVIEW_COMPLETED" && (
                    <>
                      <Button
                        onClick={() => handleStatusChange(app.id, "APPROVED")}
                        variant="outline"
                        size="sm"
                        className="border-green-600 text-green-600"
                      >
                        <BsCheck className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedApplication(app);
                          setShowRejectModal(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-600"
                      >
                        <BsX className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}

        {/* Application Details Modal */}
        {selectedApplication && !showInterviewModal && !showScoreModal && !showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                <div className="flex items-center gap-2">
                  {selectedApplication.interviewScheduledAt && (
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isEditingInterview) {
                          setIsEditingInterview(false);
                          // Reset edit data
                          setEditInterviewData({
                            interviewScheduledAt: "",
                            interviewLink: "",
                            interviewNotes: "",
                          });
                        } else {
                          // Initialize edit data with current values
                          const date = selectedApplication.interviewScheduledAt
                            ? new Date(selectedApplication.interviewScheduledAt).toISOString().slice(0, 16)
                            : "";
                          setEditInterviewData({
                            interviewScheduledAt: date,
                            interviewLink: selectedApplication.interviewLink || "",
                            interviewNotes: selectedApplication.interviewNotes || "",
                          });
                          setIsEditingInterview(true);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap shrink-0"
                      style={{ overflow: 'clip' }}
                    >
                      {isEditingInterview ? (
                        <>
                          <BsX className="w-4 h-4 shrink-0" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <BsPencil className="w-4 h-4 shrink-0" />
                          Edit Interview
                        </>
                      )}
                    </Button>
                  )}
                  <Button 
                    onClick={() => {
                      setSelectedApplication(null);
                      setIsEditingInterview(false);
                    }} 
                    variant="ghost" 
                    size="sm"
                    className="shrink-0"
                  >
                    <BsX className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Applicant</h3>
                  <p className="text-gray-700">
                    {selectedApplication.UserProfile.firstName} {selectedApplication.UserProfile.lastName}
                  </p>
                  <p className="text-gray-600 text-sm">{selectedApplication.UserProfile.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Subjects</h3>
                  <p className="text-gray-700">{selectedApplication.subjects.join(", ")}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Levels</h3>
                  <p className="text-gray-700">{selectedApplication.levels.join(", ")}</p>
                </div>
                {selectedApplication.qualifications && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Qualifications</h3>
                    <div className="space-y-3">
                      {Object.values(selectedApplication.qualifications).map((qual: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 font-bold text-lg">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg mb-1">
                                {qual.title || "N/A"}
                              </h4>
                              <p className="text-gray-700 mb-1">
                                <span className="font-medium">Institution:</span> {qual.institution || "N/A"}
                              </p>
                              <p className="text-gray-600 text-sm">
                                <span className="font-medium">Year:</span> {qual.year || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedApplication.experience && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.experience}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cover Letter</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                </div>
                {selectedApplication.resume && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Resume</h3>
                    <a
                      href={selectedApplication.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 underline"
                    >
                      View Resume
                    </a>
                  </div>
                )}
                {selectedApplication.certificates && selectedApplication.certificates.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Certificates</h3>
                    <div className="space-y-2">
                      {selectedApplication.certificates.map((cert, i) => (
                        <a
                          key={i}
                          href={cert}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-indigo-600 hover:text-indigo-700 underline"
                        >
                          Certificate {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {selectedApplication.interviewScheduledAt && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Interview Scheduled</h3>
                    
                    {isEditingInterview ? (
                      // Edit Mode
                      <div className="space-y-4">
                        {/* Meeting Title */}
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Meeting Title:</p>
                          <p className="text-gray-900 font-medium">
                            Interview - {selectedApplication.UserProfile.firstName} {selectedApplication.UserProfile.lastName}
                          </p>
                        </div>

                        {/* Interview Date & Time */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Date & Time *
                          </label>
                          <input
                            type="datetime-local"
                            value={editInterviewData.interviewScheduledAt}
                            onChange={(e) =>
                              setEditInterviewData((prev) => ({
                                ...prev,
                                interviewScheduledAt: e.target.value,
                              }))
                            }
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        {/* Meeting Description */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Meeting Description
                          </label>
                          <textarea
                            value={editInterviewData.interviewNotes}
                            onChange={(e) =>
                              setEditInterviewData((prev) => ({
                                ...prev,
                                interviewNotes: e.target.value,
                              }))
                            }
                            rows={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter meeting description..."
                          />
                        </div>

                        {/* Meeting Link */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Meeting Link
                          </label>
                          <input
                            type="url"
                            value={editInterviewData.interviewLink}
                            onChange={(e) =>
                              setEditInterviewData((prev) => ({
                                ...prev,
                                interviewLink: e.target.value,
                              }))
                            }
                            placeholder="https://meet.google.com/..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Enter a Google Meet link or any other meeting platform URL
                          </p>
                        </div>

                        {/* Save Button */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={async () => {
                              if (!selectedApplication) return;
                              if (!editInterviewData.interviewScheduledAt) {
                                toast.error("Please select interview date and time");
                                return;
                              }

                              try {
                                // Convert datetime-local format to ISO 8601 format
                                const isoDateTime = new Date(editInterviewData.interviewScheduledAt).toISOString();

                                const result = await scheduleInterview({
                                  id: selectedApplication.id,
                                  interviewScheduledAt: isoDateTime,
                                  interviewLink: editInterviewData.interviewLink || null,
                                  interviewNotes: editInterviewData.interviewNotes || null,
                                });

                                if (result.success) {
                                  toast.success("Interview details updated successfully!");
                                  setIsEditingInterview(false);
                                  fetchApplications();
                                  // Refresh the selected application
                                  const appResult = await getTeacherApplication(selectedApplication.id);
                                  if (appResult.success && "data" in appResult) {
                                    setSelectedApplication(appResult.data as Application);
                                  }
                                } else {
                                  toast.error("error" in result ? result.error : "Failed to update interview details");
                                }
                              } catch (error) {
                                console.error("Error updating interview:", error);
                                toast.error("An error occurred while updating interview details");
                              }
                            }}
                            className="flex-1"
                          >
                            <BsSave className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button
                            onClick={() => {
                              setIsEditingInterview(false);
                              setEditInterviewData({
                                interviewScheduledAt: "",
                                interviewLink: "",
                                interviewNotes: "",
                              });
                            }}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        {/* Meeting Title */}
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Meeting Title:</p>
                          <p className="text-gray-900 font-medium">
                            Interview - {selectedApplication.UserProfile.firstName} {selectedApplication.UserProfile.lastName}
                          </p>
                        </div>

                        {/* Interview Date & Time */}
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Date & Time:</p>
                          <p className="text-gray-700">
                            {new Date(selectedApplication.interviewScheduledAt).toLocaleString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {/* Meeting Description */}
                        {selectedApplication.interviewNotes && (
                          <div className="mb-3">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Meeting Description:</p>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                              <p className="text-gray-700 whitespace-pre-wrap text-sm">
                                {selectedApplication.interviewNotes}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Meeting Link */}
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Meeting Link:</p>
                          {selectedApplication.interviewLink ? (
                            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                              <a
                                href={selectedApplication.interviewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-700 underline break-all font-medium block mb-2"
                              >
                                {selectedApplication.interviewLink}
                              </a>
                              <p className="text-xs text-gray-500 mb-3">
                                Click the link above to join the meeting interview
                              </p>
                              {/* Send Email Button */}
                              <Button
                                onClick={async () => {
                                  if (!selectedApplication) return;
                                  
                                  if (!selectedApplication.interviewLink) {
                                    toast.error("Meeting link is required to send email");
                                    return;
                                  }
                                  
                                  if (!selectedApplication.interviewScheduledAt) {
                                    toast.error("Interview date and time must be set");
                                    return;
                                  }

                                  setIsSendingEmail(true);
                                  try {
                                    const result = await sendInterviewEmail(selectedApplication.id);
                                    
                                    if (result.success) {
                                      toast.success("Interview email sent successfully to teacher!");
                                    } else {
                                      toast.error("error" in result ? result.error : "Failed to send email");
                                    }
                                  } catch (error) {
                                    console.error("Error sending email:", error);
                                    toast.error("An error occurred while sending email");
                                  } finally {
                                    setIsSendingEmail(false);
                                  }
                                }}
                                disabled={isSendingEmail || !selectedApplication.interviewLink || !selectedApplication.interviewScheduledAt}
                                className="w-full"
                                variant="default"
                              >
                                <BsEnvelope className="w-4 h-4 mr-2" />
                                {isSendingEmail ? "Sending Email..." : "Send Interview Email"}
                              </Button>
                            </div>
                          ) : (
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                              <p className="text-yellow-800 text-sm mb-3">
                                ⚠️ Meeting link not available. Click "Edit Interview" to add a meeting link manually.
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
                {selectedApplication.interviewScore !== null && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Interview Score</h3>
                    <p className="text-gray-700">
                      {selectedApplication.interviewScore}/{selectedApplication.maxInterviewScore || 100}
                    </p>
                    {selectedApplication.interviewNotes && (
                      <p className="text-gray-600 text-sm mt-2">{selectedApplication.interviewNotes}</p>
                    )}
                  </div>
                )}
                {selectedApplication.adminNotes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Admin Notes</h3>
                    <p className="text-gray-700">{selectedApplication.adminNotes}</p>
                  </div>
                )}
                {selectedApplication.rejectionReason && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Rejection Reason</h3>
                    <p className="text-gray-700">{selectedApplication.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Interview Modal */}
        {showInterviewModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule Interview</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Interview Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={interviewData.interviewScheduledAt}
                    onChange={(e) =>
                      setInterviewData((prev) => ({
                        ...prev,
                        interviewScheduledAt: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meeting Link *
                  </label>
                  <input
                    type="url"
                    value={interviewData.interviewLink}
                    onChange={(e) =>
                      setInterviewData((prev) => ({
                        ...prev,
                        interviewLink: e.target.value,
                      }))
                    }
                    placeholder="https://meet.google.com/..."
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a Google Meet link or any other meeting platform URL
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Interview Notes / Description
                    </label>
                    <Button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={isGeneratingDescription || !interviewData.interviewScheduledAt}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {isGeneratingDescription ? "Generating..." : "✨ Generate with AI"}
                    </Button>
                  </div>
                  <textarea
                    value={interviewData.interviewNotes}
                    onChange={(e) =>
                      setInterviewData((prev) => ({
                        ...prev,
                        interviewNotes: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Enter interview notes or description. Click 'Generate with AI' to auto-generate."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleScheduleInterview} className="flex-1">
                    Schedule Interview
                  </Button>
                  <Button
                    onClick={() => {
                      setShowInterviewModal(false);
                      setInterviewData({ interviewScheduledAt: "", interviewLink: "", interviewNotes: "" });
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Score Interview Modal */}
        {showScoreModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Score Interview</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Interview Score *
                  </label>
                  <input
                    type="number"
                    value={scoreData.interviewScore}
                    onChange={(e) =>
                      setScoreData((prev) => ({
                        ...prev,
                        interviewScore: e.target.value,
                      }))
                    }
                    min="0"
                    max={scoreData.maxInterviewScore}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Score
                  </label>
                  <input
                    type="number"
                    value={scoreData.maxInterviewScore}
                    onChange={(e) =>
                      setScoreData((prev) => ({
                        ...prev,
                        maxInterviewScore: e.target.value,
                      }))
                    }
                    min="1"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Interview Notes
                  </label>
                  <textarea
                    value={scoreData.interviewNotes}
                    onChange={(e) =>
                      setScoreData((prev) => ({
                        ...prev,
                        interviewNotes: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleScoreInterview} className="flex-1">
                    Save Score
                  </Button>
                  <Button
                    onClick={() => {
                      setShowScoreModal(false);
                      setScoreData({ interviewScore: "", maxInterviewScore: "100", interviewNotes: "" });
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Application Modal */}
        {showRejectModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reject Application</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectData.rejectionReason}
                    onChange={(e) =>
                      setRejectData((prev) => ({
                        ...prev,
                        rejectionReason: e.target.value,
                      }))
                    }
                    rows={4}
                    required
                    placeholder="Explain why the application is being rejected..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={rejectData.adminNotes}
                    onChange={(e) =>
                      setRejectData((prev) => ({
                        ...prev,
                        adminNotes: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleReject} className="flex-1 bg-red-600 hover:bg-red-700">
                    Reject Application
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectData({ rejectionReason: "", adminNotes: "" });
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

