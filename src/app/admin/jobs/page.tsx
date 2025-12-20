"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  BsBriefcase,
  BsEye,
  BsCheckCircle,
  BsXCircle,
  BsClock,
  BsSearch,
  BsFilter,
} from "react-icons/bs";
import toast from "react-hot-toast";
import { searchJobPostings, updateJobPosting } from "@/actions/jobs/actions";
import { useRealtime } from "@/hooks/useRealtime";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  subject: string;
  level: string;
  status: "OPEN" | "CLOSED" | "FILLED" | "CANCELLED";
  budget: string;
  hoursPerWeek: string;
  createdAt: string;
  ParentProfile: {
    UserProfile: {
      firstName: string;
      lastName: string;
      email: string;
    };
  } | null;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "" as "" | "OPEN" | "CLOSED" | "FILLED" | "CANCELLED",
    subject: "",
    level: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Realtime subscription for live updates
  useRealtime({
    table: "JobPosting",
    onInsert: (newJob: Job) => {
      setJobs((prev) => [newJob, ...prev]);
    },
    onUpdate: (updatedJob: Job) => {
      setJobs((prev) =>
        prev.map((job) => (job.id === updatedJob.id ? updatedJob : job))
      );
    },
    enabled: true,
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const result = await searchJobPostings({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status || undefined,
        subject: filters.subject || undefined,
        level: filters.level || undefined,
      });

      if (result.success && "data" in result && result.data) {
        setJobs(result.data as Job[]);
        if ("pagination" in result && result.pagination) {
          setPagination(result.pagination);
        }
      } else {
        toast.error("Failed to fetch jobs");
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("An error occurred while fetching jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [pagination.page, filters.status, filters.subject, filters.level]);

  const handleStatusChange = async (jobId: string, newStatus: "OPEN" | "CLOSED" | "FILLED" | "CANCELLED") => {
    try {
      const result = await updateJobPosting({
        id: jobId,
        status: newStatus,
      });

      if (result.success) {
        toast.success("Job status updated successfully");
        fetchJobs();
      } else {
        toast.error("Failed to update job status");
      }
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error("An error occurred while updating job status");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      OPEN: { color: "bg-green-100 text-green-800", icon: BsCheckCircle },
      CLOSED: { color: "bg-gray-100 text-gray-800", icon: BsXCircle },
      FILLED: { color: "bg-blue-100 text-blue-800", icon: BsCheckCircle },
      CANCELLED: { color: "bg-red-100 text-red-800", icon: BsXCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.CLOSED;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Postings</h1>
          <p className="text-gray-600">Manage all job postings on the platform</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value as typeof filters.status,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
                <option value="FILLED">Filled</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={filters.subject}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, subject: e.target.value }))
                }
                placeholder="Filter by subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <input
                type="text"
                value={filters.level}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, level: e.target.value }))
                }
                placeholder="Filter by level"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <Button onClick={fetchJobs} variant="outline">
              <BsSearch className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <BsBriefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No jobs found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject / Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {job.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {job.hoursPerWeek} hours/week
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{job.subject}</div>
                        <div className="text-xs text-gray-500">{job.level}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {job.ParentProfile?.UserProfile ? (
                          <div className="text-sm text-gray-900">
                            {job.ParentProfile.UserProfile.firstName}{" "}
                            {job.ParentProfile.UserProfile.lastName}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.budget}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link href={`/jobs/${job.id}`}>
                            <Button variant="ghost" size="sm">
                              <BsEye className="w-4 h-4" />
                            </Button>
                          </Link>
                          {job.status === "OPEN" && (
                            <select
                              value={job.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  job.id,
                                  e.target.value as typeof job.status
                                )
                              }
                              className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="OPEN">Open</option>
                              <option value="CLOSED">Closed</option>
                              <option value="FILLED">Filled</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} jobs
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                    }
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                    }
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

