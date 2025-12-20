"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  BsBarChart,
  BsPeople,
  BsBriefcase,
  BsEnvelope,
  BsCheckCircle,
  BsClock,
  BsCalendar,
  BsGraphUp,
  BsGraphDown,
  BsDownload,
} from "react-icons/bs";
import toast from "react-hot-toast";
import { getAllUsers } from "@/actions/users/actions";
import { getAllTeacherApplications } from "@/actions/teacher-applications/actions";
import { getAllContactSubmissions } from "@/actions/contacts/actions";
import { searchJobPostings } from "@/actions/jobs/actions";

interface ReportStats {
  totalUsers: number;
  totalTeachers: number;
  totalParents: number;
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  totalContacts: number;
  newContacts: number;
  usersThisMonth: number;
  jobsThisMonth: number;
  applicationsThisMonth: number;
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<ReportStats>({
    totalUsers: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalJobs: 0,
    activeJobs: 0,
    closedJobs: 0,
    totalApplications: 0,
    approvedApplications: 0,
    pendingApplications: 0,
    totalContacts: 0,
    newContacts: 0,
    usersThisMonth: 0,
    jobsThisMonth: 0,
    applicationsThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"week" | "month" | "year" | "all">("month");

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [usersResult, applicationsResult, contactsResult, jobsResult] = await Promise.all([
        getAllUsers({ page: 1, limit: 1000 }),
        getAllTeacherApplications({ page: 1, limit: 1000 }),
        getAllContactSubmissions(),
        searchJobPostings({ page: 1, limit: 1000 }),
      ]);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Process users
      if (usersResult.success && "data" in usersResult && usersResult.data) {
        const users = usersResult.data as any[];
        const teachers = users.filter((u: any) => u.role === "TEACHER");
        const parents = users.filter((u: any) => u.role === "PARENT");
        const usersThisMonth = users.filter(
          (u: any) => new Date(u.createdAt) >= startOfMonth
        ).length;

        setStats((prev) => ({
          ...prev,
          totalUsers: users.length,
          totalTeachers: teachers.length,
          totalParents: parents.length,
          usersThisMonth,
        }));
      }

      // Process applications
      if (applicationsResult.success && "data" in applicationsResult) {
        const apps = (applicationsResult as { success: true; data: any[] }).data;
        if (apps) {
          const approved = apps.filter((a: any) => a.status === "APPROVED").length;
          const pending = apps.filter(
            (a: any) => a.status === "PENDING" || a.status === "UNDER_REVIEW"
          ).length;
          const applicationsThisMonth = apps.filter(
            (a: any) => new Date(a.createdAt) >= startOfMonth
          ).length;

          setStats((prev) => ({
            ...prev,
            totalApplications: apps.length,
            approvedApplications: approved,
            pendingApplications: pending,
            applicationsThisMonth,
          }));
        }
      }

      // Process contacts
      if (contactsResult.success && "data" in contactsResult && contactsResult.data) {
        const contacts = contactsResult.data;
        const newContacts = contacts.filter((c: any) => c.status === "NEW").length;

        setStats((prev) => ({
          ...prev,
          totalContacts: contacts.length,
          newContacts,
        }));
      }

      // Process jobs
      if (jobsResult.success && "data" in jobsResult && jobsResult.data) {
        const jobs = jobsResult.data as any[];
        const active = jobs.filter((j: any) => j.status === "OPEN").length;
        const closed = jobs.filter((j: any) => j.status === "CLOSED" || j.status === "FILLED").length;
        const jobsThisMonth = jobs.filter(
          (j: any) => new Date(j.createdAt) >= startOfMonth
        ).length;

        setStats((prev) => ({
          ...prev,
          totalJobs: jobs.length,
          activeJobs: active,
          closedJobs: closed,
          jobsThisMonth,
        }));
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange,
      stats,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-report-${dateRange}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Report exported successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">Platform statistics and insights</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) =>
                setDateRange(e.target.value as "week" | "month" | "year" | "all")
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
            <Button onClick={exportReport} variant="outline">
              <BsDownload className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <BsPeople className="w-6 h-6 text-white" />
              </div>
              <BsGraphUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalUsers}</h3>
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.usersThisMonth} this month
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <BsBriefcase className="w-6 h-6 text-white" />
              </div>
              <BsGraphUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalJobs}</h3>
            <p className="text-sm text-gray-600">Total Jobs</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.jobsThisMonth} this month
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <BsCheckCircle className="w-6 h-6 text-white" />
              </div>
              <BsGraphUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalApplications}
            </h3>
            <p className="text-sm text-gray-600">Total Applications</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.applicationsThisMonth} this month
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <BsEnvelope className="w-6 h-6 text-white" />
              </div>
              <BsGraphUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalContacts}</h3>
            <p className="text-sm text-gray-600">Contact Submissions</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.newContacts} new
            </p>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Breakdown */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Breakdown</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BsPeople className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Total Users</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.totalUsers}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BsCheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Teachers</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.totalTeachers}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BsPeople className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Parents</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.totalParents}</span>
              </div>
            </div>
          </div>

          {/* Job Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Job Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BsBriefcase className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">Total Jobs</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.totalJobs}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BsCheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Active Jobs</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.activeJobs}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BsClock className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Closed Jobs</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.closedJobs}</span>
              </div>
            </div>
          </div>

          {/* Application Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Application Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BsBarChart className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Total Applications</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {stats.totalApplications}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BsCheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Approved</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {stats.approvedApplications}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BsClock className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {stats.pendingApplications}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BsEnvelope className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Total Contacts</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.totalContacts}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BsEnvelope className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">New Contacts</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.newContacts}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BsCheckCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Processed</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {stats.totalContacts - stats.newContacts}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Teacher Conversion Rate</h3>
            <p className="text-3xl font-bold mb-1">
              {stats.totalTeachers > 0
                ? Math.round((stats.approvedApplications / stats.totalTeachers) * 100)
                : 0}
              %
            </p>
            <p className="text-sm opacity-90">
              {stats.approvedApplications} approved / {stats.totalTeachers} teachers
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Job Fill Rate</h3>
            <p className="text-3xl font-bold mb-1">
              {stats.totalJobs > 0
                ? Math.round((stats.closedJobs / stats.totalJobs) * 100)
                : 0}
              %
            </p>
            <p className="text-sm opacity-90">
              {stats.closedJobs} closed / {stats.totalJobs} total jobs
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Application Approval Rate</h3>
            <p className="text-3xl font-bold mb-1">
              {stats.totalApplications > 0
                ? Math.round((stats.approvedApplications / stats.totalApplications) * 100)
                : 0}
              %
            </p>
            <p className="text-sm opacity-90">
              {stats.approvedApplications} approved / {stats.totalApplications} total
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

