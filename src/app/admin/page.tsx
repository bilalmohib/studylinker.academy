"use client";

import { useEffect, useState } from "react";
import Container from "@/components/common/Container";
import {
  BsPeople,
  BsEnvelope,
  BsBriefcase,
  BsCheckCircle,
  BsClock,
  BsBarChart,
} from "react-icons/bs";
import { getAllTeacherApplications } from "@/actions/teacher-applications/actions";
import { getAllContactSubmissions } from "@/actions/contacts/actions";
import toast from "react-hot-toast";
import { useRealtimeTeacherApplications, useRealtimeContacts } from "@/hooks/useRealtime";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    pendingApplications: 0,
    totalApplications: 0,
    newContacts: 0,
    totalContacts: 0,
    activeJobs: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  // Realtime subscriptions for live updates
  useRealtimeTeacherApplications((application) => {
    // Update stats when applications change
    setStats((prev) => {
      const newPending = application.status === "PENDING" || application.status === "UNDER_REVIEW"
        ? prev.pendingApplications + 1
        : prev.pendingApplications;
      return {
        ...prev,
        pendingApplications: newPending,
        totalApplications: prev.totalApplications + 1,
      };
    });
  }, true);

  useRealtimeContacts((contact) => {
    // Update stats when contacts change
    setStats((prev) => {
      const newContacts = contact.status === "NEW" ? prev.newContacts + 1 : prev.newContacts;
      return {
        ...prev,
        newContacts,
        totalContacts: prev.totalContacts + 1,
      };
    });
  }, true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [applicationsResult, contactsResult] = await Promise.all([
          getAllTeacherApplications({ limit: 1000 }),
          getAllContactSubmissions(),
        ]);

        if (applicationsResult.success && "data" in applicationsResult) {
          const apps = (applicationsResult as { success: true; data: any[] }).data;
          if (apps) {
            setStats((prev) => ({
              ...prev,
              pendingApplications: apps.filter(
                (app: any) => app.status === "PENDING" || app.status === "UNDER_REVIEW"
              ).length,
              totalApplications: apps.length,
            }));
          }
        }

        if (contactsResult.success && "data" in contactsResult && contactsResult.data) {
          const contacts = contactsResult.data;
          setStats((prev) => ({
            ...prev,
            newContacts: contacts.filter((c: any) => c.status === "NEW").length,
            totalContacts: contacts.length,
          }));
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Pending Applications",
      value: stats.pendingApplications,
      total: stats.totalApplications,
      icon: BsClock,
      color: "from-yellow-500 to-orange-500",
      href: "/admin/teacher-applications?status=PENDING",
    },
    {
      title: "New Contacts",
      value: stats.newContacts,
      total: stats.totalContacts,
      icon: BsEnvelope,
      color: "from-blue-500 to-cyan-500",
      href: "/admin/contacts?status=NEW",
    },
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      total: 0,
      icon: BsBriefcase,
      color: "from-green-500 to-emerald-500",
      href: "/admin/jobs",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      total: 0,
      icon: BsPeople,
      color: "from-purple-500 to-pink-500",
      href: "/admin/users",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Overview of platform activity and management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <a
                key={stat.title}
                href={stat.href}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center text-white`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  {stat.total > 0 && (
                    <span className="text-sm text-gray-500">
                      {stat.value} / {stat.total}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </a>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <BsCheckCircle className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Teacher application reviewed
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <BsEnvelope className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    New contact submission
                  </p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <BsPeople className="w-5 h-5 text-purple-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    New user registered
                  </p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Services</span>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Authentication</span>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

