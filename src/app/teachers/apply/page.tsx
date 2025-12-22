"use client";

import { useState, useEffect } from "react";
import Container from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { BsCheckCircle, BsFileText, BsAward, BsUpload, BsX, BsFileEarmark, BsCloudUpload } from "react-icons/bs";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  createTeacherApplication,
  getCurrentTeacherApplication,
} from "@/actions/teacher-applications/actions";
import { getCurrentUserProfile } from "@/actions/users/actions";
import { uploadFile, deleteFile } from "@/actions/storage/actions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    qualifications: [] as Array<{ title: string; institution: string; year: number | null }>,
    experience: "",
    resume: "",
    resumeFile: null as { url: string; path: string; name: string } | null,
    certificates: [] as string[],
    certificateFiles: [] as Array<{ url: string; path: string; name: string }>,
    coverLetter: "",
    age: null as number | null,
    photo: "",
    photoPath: "", // Store the storage path for deletion
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingCertificates, setUploadingCertificates] = useState(false);
  const [dragActiveResume, setDragActiveResume] = useState(false);
  const [dragActiveCertificates, setDragActiveCertificates] = useState(false);

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

        // Check if user is a parent - parents cannot apply as teachers
        const profile = userResult.data as { role?: string };
        if (profile.role === "PARENT") {
          toast.error("This page is for teachers only. Parents cannot apply as teachers.");
          router.push("/portal/parent");
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
              
              // Convert qualifications from object to array if needed
              let qualificationsArray: Array<{ title: string; institution: string; year: number | null }> = [];
              if (app.qualifications) {
                if (Array.isArray(app.qualifications)) {
                  qualificationsArray = app.qualifications as Array<{ title: string; institution: string; year: number | null }>;
                } else if (typeof app.qualifications === 'object' && app.qualifications !== null) {
                  // Convert object to array
                  const values = Object.values(app.qualifications) as any[];
                  qualificationsArray = values
                    .filter((q: any) => q && typeof q === 'object' && 'title' in q)
                    .map((q: any) => ({
                      title: q.title || '',
                      institution: q.institution || '',
                      year: q.year || null
                    })) as Array<{ title: string; institution: string; year: number | null }>;
                }
              }
              
              setFormData({
                subjects: app.subjects || [],
                levels: app.levels || [],
                qualifications: qualificationsArray,
                experience: app.experience || "",
                resume: app.resume || "",
                resumeFile: app.resume ? { url: app.resume, path: "", name: "Resume" } : null,
                certificates: app.certificates || [],
                certificateFiles: (app.certificates || []).map((url: string) => ({
                  url,
                  path: "",
                  name: "Certificate",
                })),
                coverLetter: app.coverLetter || "",
                age: app.age || null,
                photo: app.photo || "",
                photoPath: "", // We don't store path in DB, just URL
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
        { title: "", institution: "", year: null },
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
    field: "title" | "institution" | "year",
    value: string | number | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploadingPhoto(true);

    try {
      // Delete old photo if exists
      if (formData.photoPath) {
        await deleteFile(formData.photoPath);
      }

      // Upload new photo
      const result = await uploadFile(file, "teacher-photos");

      if ("success" in result && result.success && "url" in result) {
        setFormData((prev) => ({
          ...prev,
          photo: result.url,
          photoPath: result.path || "",
        }));
        toast.success("Photo uploaded successfully!");
      } else {
        const errorMessage = "error" in result ? result.error : "Failed to upload photo";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handlePhotoRemove = async () => {
    if (formData.photoPath) {
      try {
        await deleteFile(formData.photoPath);
      } catch (error) {
        // Continue even if deletion fails
        console.error("Failed to delete photo from storage:", error);
      }
    }

    setFormData((prev) => ({
      ...prev,
      photo: "",
      photoPath: "",
    }));
    toast.success("Photo removed");
  };

  const handleResumeUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF, Word document, or text file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploadingResume(true);

    try {
      // Delete old resume file if exists
      if (formData.resumeFile?.path) {
        await deleteFile(formData.resumeFile.path, "teacher-documents");
      }

      // Upload new resume
      const result = await uploadFile(file, "teacher-documents", "resumes", true);

      if ("success" in result && result.success && "url" in result) {
        setFormData((prev) => ({
          ...prev,
          resume: result.url,
          resumeFile: {
            url: result.url,
            path: result.path || "",
            name: file.name,
          },
        }));
        toast.success("Resume uploaded successfully!");
      } else {
        const errorMessage = "error" in result ? result.error : "Failed to upload resume";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("Failed to upload resume. Please try again.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleResumeRemove = async () => {
    if (formData.resumeFile?.path) {
      try {
        await deleteFile(formData.resumeFile.path, "teacher-documents");
      } catch (error) {
        console.error("Failed to delete resume from storage:", error);
      }
    }

    setFormData((prev) => ({
      ...prev,
      resume: "",
      resumeFile: null,
    }));
    toast.success("Resume removed");
  };

  const handleCertificateUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Validate all files
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "image/jpeg", "image/jpg", "image/png"];
    
    for (const file of fileArray) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: File size must be less than 10MB`);
        return;
      }
    }

    setUploadingCertificates(true);

    try {
      const uploadPromises = fileArray.map((file) =>
        uploadFile(file, "teacher-documents", "certificates", true)
      );

      const results = await Promise.all(uploadPromises);
      const successfulUploads: Array<{ url: string; path: string; name: string }> = [];

      results.forEach((result, index) => {
        if ("success" in result && result.success && "url" in result) {
          successfulUploads.push({
            url: result.url,
            path: result.path || "",
            name: fileArray[index].name,
          });
        }
      });

      if (successfulUploads.length > 0) {
        setFormData((prev) => ({
          ...prev,
          certificates: [...prev.certificates, ...successfulUploads.map((f) => f.url)],
          certificateFiles: [...prev.certificateFiles, ...successfulUploads],
        }));
        toast.success(`${successfulUploads.length} certificate(s) uploaded successfully!`);
      }
    } catch (error) {
      toast.error("Failed to upload certificates. Please try again.");
    } finally {
      setUploadingCertificates(false);
    }
  };

  const handleCertificateRemove = async (index: number) => {
    const fileToRemove = formData.certificateFiles[index];
    
    if (fileToRemove?.path) {
      try {
        await deleteFile(fileToRemove.path, "teacher-documents");
      } catch (error) {
        console.error("Failed to delete certificate from storage:", error);
      }
    }

    setFormData((prev) => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index),
      certificateFiles: prev.certificateFiles.filter((_, i) => i !== index),
    }));
    toast.success("Certificate removed");
  };

  const handleDrag = (e: React.DragEvent, type: "resume" | "certificates") => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "resume") {
      setDragActiveResume(true);
    } else {
      setDragActiveCertificates(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent, type: "resume" | "certificates") => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "resume") {
      setDragActiveResume(false);
    } else {
      setDragActiveCertificates(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: "resume" | "certificates") => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === "resume") {
      setDragActiveResume(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleResumeUpload(e.dataTransfer.files[0]);
      }
    } else {
      setDragActiveCertificates(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleCertificateUpload(e.dataTransfer.files);
      }
    }
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

    if (!formData.age || formData.age < 18) {
      toast.error("Please enter a valid age (18 or older)");
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
        qualifications: (Array.isArray(formData.qualifications) && formData.qualifications.length > 0)
          ? formData.qualifications.reduce((acc, q, i) => {
              acc[i] = q;
              return acc;
            }, {} as Record<string, any>)
          : null,
        experience: formData.experience || null,
        resume: formData.resume || null,
        certificates: formData.certificates.length > 0 ? formData.certificates : null,
        coverLetter: formData.coverLetter,
        age: formData.age || null,
        photo: formData.photo && formData.photo.trim() !== "" ? formData.photo : null,
      });

      if (result.success) {
        toast.success("Application submitted successfully! We'll review it soon.");
        // Redirect to dashboard - it will show the pending application status
        router.push("/portal/teacher?application=submitted");
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

  // Check if form should be disabled (when application is pending or under review)
  const isFormDisabled = existingApplication && (existingApplication.status === "PENDING" || existingApplication.status === "UNDER_REVIEW");

  // Get professional status message
  const getStatusMessage = (status: string) => {
    const statusMessages: Record<string, { title: string; description: string; statusLabel: string }> = {
      PENDING: {
        title: "Application Submitted",
        statusLabel: "Pending",
        description: "Your application has been successfully submitted and is awaiting review by our team. You can expect to hear from us within 2-3 business days. We will notify you via email once the review process begins."
      },
      UNDER_REVIEW: {
        title: "Under Review",
        statusLabel: "Under Review",
        description: "Your application is currently being reviewed by our team. This process typically takes 2-3 business days. We will notify you of the outcome via email."
      },
      INTERVIEW_SCHEDULED: {
        title: "Interview Scheduled",
        statusLabel: "Interview Scheduled",
        description: "An interview has been scheduled for your application. Please check your email for details regarding the interview date, time, and meeting link."
      },
      INTERVIEW_COMPLETED: {
        title: "Interview Completed",
        statusLabel: "Interview Completed",
        description: "Your interview has been completed. Our team is finalizing the review of your application. You can expect to hear from us within 2-3 business days. We will notify you of the final decision via email."
      },
      APPROVED: {
        title: "Application Approved",
        statusLabel: "Approved",
        description: "Congratulations! Your application has been approved. You can now access your teacher dashboard and start teaching on StudyLinker."
      },
      REJECTED: {
        title: "Application Not Approved",
        statusLabel: "Rejected",
        description: "We regret to inform you that your application was not approved at this time. If you have questions, please contact our support team."
      }
    };

    return statusMessages[status] || {
      title: status.replace(/_/g, " "),
      statusLabel: status.replace(/_/g, " "),
      description: "Your application status is being processed."
    };
  };

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

          {existingApplication && (() => {
            const statusInfo = getStatusMessage(existingApplication.status);
            return (
              <div className={`rounded-lg p-5 sm:p-6 mb-6 shadow-sm ${
                existingApplication.status === "PENDING" || existingApplication.status === "UNDER_REVIEW"
                  ? "bg-yellow-50 border-2 border-yellow-200"
                  : existingApplication.status === "APPROVED"
                  ? "bg-green-50 border-2 border-green-200"
                  : existingApplication.status === "REJECTED"
                  ? "bg-red-50 border-2 border-red-200"
                  : "bg-blue-50 border-2 border-blue-200"
              }`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {existingApplication.status === "PENDING" || existingApplication.status === "UNDER_REVIEW" ? (
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : existingApplication.status === "APPROVED" ? (
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : existingApplication.status === "REJECTED" ? (
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <span className={`text-sm font-semibold uppercase tracking-wide ${
                        existingApplication.status === "PENDING" || existingApplication.status === "UNDER_REVIEW"
                          ? "text-yellow-700"
                          : existingApplication.status === "APPROVED"
                          ? "text-green-700"
                          : existingApplication.status === "REJECTED"
                          ? "text-red-700"
                          : "text-blue-700"
                      }`}>
                        Application Status:
                      </span>
                      <span className={`ml-2 text-base font-bold ${
                        existingApplication.status === "PENDING" || existingApplication.status === "UNDER_REVIEW"
                          ? "text-yellow-800"
                          : existingApplication.status === "APPROVED"
                          ? "text-green-800"
                          : existingApplication.status === "REJECTED"
                          ? "text-red-800"
                          : "text-blue-800"
                      }`}>
                        {statusInfo.statusLabel}
                      </span>
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${
                      existingApplication.status === "PENDING" || existingApplication.status === "UNDER_REVIEW"
                        ? "text-yellow-800"
                        : existingApplication.status === "APPROVED"
                        ? "text-green-800"
                        : existingApplication.status === "REJECTED"
                        ? "text-red-800"
                        : "text-blue-800"
                    }`}>
                      {statusInfo.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${
                      existingApplication.status === "PENDING" || existingApplication.status === "UNDER_REVIEW"
                        ? "text-yellow-700"
                        : existingApplication.status === "APPROVED"
                        ? "text-green-700"
                        : existingApplication.status === "REJECTED"
                        ? "text-red-700"
                        : "text-blue-700"
                    }`}>
                      {statusInfo.description}
                    </p>
                    {existingApplication.interviewScheduledAt && (
                      <p className={`text-sm font-medium mt-2 ${
                        existingApplication.status === "PENDING" || existingApplication.status === "UNDER_REVIEW"
                          ? "text-yellow-800"
                          : "text-blue-800"
                      }`}>
                        Interview scheduled: {new Date(existingApplication.interviewScheduledAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col justify-center">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age *
                  </label>
                  <div className="flex flex-col">
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={formData.age ?? ""}
                      onChange={(e) => {
                        const ageValue = e.target.value === "" ? null : parseInt(e.target.value, 10);
                        setFormData((prev) => ({ ...prev, age: ageValue }));
                      }}
                      placeholder="Enter your age"
                      required
                      disabled={existingApplication && (existingApplication.status === "PENDING" || existingApplication.status === "UNDER_REVIEW")}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Must be 18 or older</p>
                  </div>
                </div>
                <div className="flex flex-col justify-center -mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 flex items-center justify-center">
                      {formData.photo ? (
                        <div className="relative">
                          <img
                            src={formData.photo}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={handlePhotoRemove}
                            disabled={isFormDisabled}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Remove photo"
                          >
                            <BsX className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="relative cursor-pointer group block">
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handlePhotoUpload}
                            disabled={uploadingPhoto || isFormDisabled}
                            className="hidden"
                          />
                          <div className="w-20 h-20 rounded-full border-2 border-dashed border-indigo-300 bg-indigo-50 flex flex-col items-center justify-center transition-all group-hover:border-indigo-400 group-hover:bg-indigo-100">
                            {uploadingPhoto ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                            ) : (
                              <>
                                <BsUpload className="w-6 h-6 text-indigo-600 mb-0.5" />
                                <span className="text-[10px] text-indigo-600 font-medium">Upload</span>
                              </>
                            )}
                          </div>
                        </label>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex items-center">
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {formData.photo
                          ? "Click the X to remove and upload a new photo"
                          : "Upload your professional photo (max 5MB)"}
                      </p>
                      {formData.photo && (
                        <p className="text-xs text-green-600 mt-1 font-medium">✓ Photo uploaded</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
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
                      disabled={isFormDisabled}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm font-medium text-gray-700">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Levels */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
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
                      disabled={isFormDisabled}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isFormDisabled}
                >
                  <BsAward className="w-4 h-4 mr-2" />
                  Add Qualification
                </Button>
              </div>
              <div className="space-y-4">
                {(Array.isArray(formData.qualifications) ? formData.qualifications : []).map((qual, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <input
                      type="text"
                      placeholder="Title (e.g., BSc, MSc)"
                      value={qual.title}
                      onChange={(e) =>
                        handleQualificationChange(index, "title", e.target.value)
                      }
                      disabled={isFormDisabled}
                      className="sm:col-span-4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <input
                      type="text"
                      placeholder="Institution"
                      value={qual.institution}
                      onChange={(e) =>
                        handleQualificationChange(index, "institution", e.target.value)
                      }
                      disabled={isFormDisabled}
                      className="sm:col-span-4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <div className="sm:col-span-4 flex gap-2">
                      <input
                        type="number"
                        placeholder="Year"
                        min="1900"
                        max="2100"
                        value={qual.year ?? ""}
                        onChange={(e) => {
                          const yearValue = e.target.value === "" ? null : parseInt(e.target.value, 10);
                          if (e.target.value === "" || (!isNaN(yearValue as number) && yearValue !== null)) {
                            handleQualificationChange(index, "year", yearValue);
                          }
                        }}
                        disabled={isFormDisabled}
                        className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveQualification(index)}
                        disabled={isFormDisabled}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Remove qualification"
                      >
                        <BsX className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {(!Array.isArray(formData.qualifications) || formData.qualifications.length === 0) && (
                  <p className="text-gray-500 text-sm">No qualifications added yet</p>
                )}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                Teaching Experience
              </h2>
              <textarea
                value={formData.experience}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, experience: e.target.value }))
                }
                placeholder="Describe your teaching experience, years of experience, notable achievements, etc."
                rows={6}
                disabled={isFormDisabled}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Resume & Certificates */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                Documents
              </h2>
              <div className="space-y-6">
                {/* Resume Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Resume
                  </label>
                  
                  {/* Upload Area */}
                  <div
                    onDragEnter={(e) => !isFormDisabled && handleDrag(e, "resume")}
                    onDragLeave={(e) => !isFormDisabled && handleDragLeave(e, "resume")}
                    onDragOver={(e) => !isFormDisabled && handleDrag(e, "resume")}
                    onDrop={(e) => !isFormDisabled && handleDrop(e, "resume")}
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                      dragActiveResume
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-300 bg-gray-50"
                    } ${isFormDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {formData.resumeFile ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BsFileEarmark className="w-8 h-8 text-indigo-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{formData.resumeFile.name}</p>
                            <p className="text-xs text-gray-500">Resume uploaded</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleResumeRemove}
                          disabled={isFormDisabled}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Remove resume"
                        >
                          <BsX className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleResumeUpload(e.target.files[0]);
                            }
                          }}
                          disabled={uploadingResume || isFormDisabled}
                          className="hidden"
                          id="resume-upload"
                        />
                        <label
                          htmlFor="resume-upload"
                          className="flex flex-col items-center justify-center cursor-pointer"
                        >
                          {uploadingResume ? (
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                          ) : (
                            <>
                              <BsCloudUpload className="w-10 h-10 text-indigo-600 mb-2" />
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">PDF, DOC, DOCX, or TXT (max 10MB)</p>
                            </>
                          )}
                        </label>
                      </>
                    )}
                  </div>

                  {/* URL Input */}
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Or enter a URL:</p>
                    <input
                      type="url"
                      value={formData.resume}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, resume: e.target.value }))
                      }
                      placeholder="https://drive.google.com/..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Certificates Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Certificates
                  </label>
                  
                  {/* Upload Area */}
                  <div
                    onDragEnter={(e) => !isFormDisabled && handleDrag(e, "certificates")}
                    onDragLeave={(e) => !isFormDisabled && handleDragLeave(e, "certificates")}
                    onDragOver={(e) => !isFormDisabled && handleDrag(e, "certificates")}
                    onDrop={(e) => !isFormDisabled && handleDrop(e, "certificates")}
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                      dragActiveCertificates
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-300 bg-gray-50"
                    } ${isFormDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      multiple
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleCertificateUpload(e.target.files);
                        }
                      }}
                      disabled={uploadingCertificates || isFormDisabled}
                      className="hidden"
                      id="certificates-upload"
                    />
                    <label
                      htmlFor="certificates-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      {uploadingCertificates ? (
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                      ) : (
                        <>
                          <BsCloudUpload className="w-10 h-10 text-indigo-600 mb-2" />
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT, or Images (max 10MB each)</p>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Uploaded Certificates List */}
                  {formData.certificateFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.certificateFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <BsFileEarmark className="w-5 h-5 text-indigo-600" />
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCertificateRemove(index)}
                            disabled={isFormDisabled}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Remove certificate"
                          >
                            <BsX className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* URL Input */}
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Or enter URLs (one per line or comma-separated):</p>
                    <textarea
                      value={formData.certificates.filter((url) => 
                        !formData.certificateFiles.some((f) => f.url === url)
                      ).join("\n")}
                      onChange={(e) => {
                        const urlArray = e.target.value
                          .split(/[,\n]/)
                          .map((s) => s.trim())
                          .filter((s) => s.length > 0);
                        setFormData((prev) => ({
                          ...prev,
                          certificates: [...prev.certificateFiles.map((f) => f.url), ...urlArray],
                        }));
                      }}
                      placeholder="https://drive.google.com/...&#10;https://dropbox.com/..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
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
                disabled={isFormDisabled}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <p className="text-sm text-gray-500 mt-2">
                {formData.coverLetter.length}/50 characters minimum
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              {existingApplication && (existingApplication.status === "PENDING" || existingApplication.status === "UNDER_REVIEW") ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-1">
                      <Button
                        type="button"
                        disabled={true}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Application Already Submitted
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-sm">
                      {existingApplication.status === "PENDING" 
                        ? "Your application is pending review. We'll notify you once it's been reviewed."
                        : "Your application is currently under review. We'll notify you of the outcome soon."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}
