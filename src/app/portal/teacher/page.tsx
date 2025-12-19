"use client";

import Container from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BsBriefcase,
  BsCalendar,
  BsBarChart,
  BsChatDots,
  BsCurrencyDollar,
  BsPeople,
} from "react-icons/bs";

// Mock data
const mockApplications = [
  {
    id: "1",
    jobTitle: "Mathematics Tutor for O-Level",
    status: "pending",
    appliedDate: "2 days ago",
  },
  {
    id: "2",
    jobTitle: "Primary English Tutor",
    status: "accepted",
    appliedDate: "1 week ago",
  },
];

const mockStudents = [
  {
    id: "1",
    name: "Emma Smith",
    subject: "Mathematics",
    nextClass: "Tomorrow, 3:00 PM",
    progress: 85,
  },
  {
    id: "2",
    name: "James Wilson",
    subject: "Physics",
    nextClass: "Friday, 4:00 PM",
    progress: 92,
  },
];

export default function TeacherDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12">
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Teacher Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Manage your teaching schedule and students
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <BsPeople className="w-8 h-8 text-indigo-600" />
              <div>
                <div className="text-3xl font-bold text-gray-900">12</div>
                <div className="text-sm text-gray-600">Active Students</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <BsBriefcase className="w-8 h-8 text-indigo-600" />
              <div>
                <div className="text-3xl font-bold text-gray-900">5</div>
                <div className="text-sm text-gray-600">Applications</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <BsCurrencyDollar className="w-8 h-8 text-indigo-600" />
              <div>
                <div className="text-3xl font-bold text-gray-900">$1,800</div>
                <div className="text-sm text-gray-600">This Month</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <BsBarChart className="w-8 h-8 text-indigo-600" />
              <div>
                <div className="text-3xl font-bold text-gray-900">4.9</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Button
            asChild
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-6 rounded-2xl shadow-lg h-auto flex-col gap-2"
          >
            <Link href="/teachers/find-students">
              <BsBriefcase className="w-8 h-8" />
              <span className="text-lg font-semibold">Find Students</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 p-6 rounded-2xl h-auto flex-col gap-2"
          >
            <Link href="/portal/teacher/schedule">
              <BsCalendar className="w-8 h-8" />
              <span className="text-lg font-semibold">View Schedule</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 p-6 rounded-2xl h-auto flex-col gap-2"
          >
            <Link href="/portal/teacher/earnings">
              <BsCurrencyDollar className="w-8 h-8" />
              <span className="text-lg font-semibold">Earnings</span>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Students */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Students</h2>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-indigo-600 text-indigo-600"
              >
                <Link href="/teachers/find-students">Find More</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {mockStudents.map((student) => (
                <div
                  key={student.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {student.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.subject}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-indigo-600">
                        {student.progress}%
                      </div>
                      <div className="text-xs text-gray-500">Progress</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BsCalendar className="w-4 h-4" />
                      <span>Next: {student.nextClass}</span>
                    </div>
                    <Link
                      href={`/portal/teacher/students/${student.id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Applications */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-indigo-600 text-indigo-600"
              >
                <Link href="/teachers/find-students">Browse Jobs</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {mockApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{app.jobTitle}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        app.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Applied {app.appliedDate}
                    </span>
                    <Link
                      href={`/jobs/${app.id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Classes */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Upcoming Classes
            </h2>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Mathematics</h3>
                  <span className="text-sm text-gray-600">Tomorrow, 3:00 PM</span>
                </div>
                <p className="text-sm text-gray-600">Student: Emma Smith</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Physics</h3>
                  <span className="text-sm text-gray-600">Friday, 4:00 PM</span>
                </div>
                <p className="text-sm text-gray-600">Student: James Wilson</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <BsChatDots className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900">
                    New message from Emma's parent
                  </p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BsBriefcase className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900">
                    Application accepted for Primary English Tutor
                  </p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BsBarChart className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
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
