"use client";

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

// Mock data
const mockJobs = [
  {
    id: "1",
    title: "Mathematics Tutor for O-Level",
    applications: 12,
    status: "open",
  },
  {
    id: "2",
    title: "English Tutor for Primary",
    applications: 5,
    status: "open",
  },
];

const mockHiredTeachers = [
  {
    id: "1",
    name: "Sarah Johnson",
    subject: "Mathematics",
    nextClass: "Tomorrow, 3:00 PM",
  },
  {
    id: "2",
    name: "David Chen",
    subject: "Physics",
    nextClass: "Friday, 4:00 PM",
  },
];

export default function ParentDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12">
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Parent Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Manage your children's education and teachers
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Jobs */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Active Jobs</h2>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-indigo-600 text-indigo-600"
              >
                <Link href="/parents/post-job">Post New</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {mockJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                      {job.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {job.applications} applications
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
          </div>

          {/* Hired Teachers */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Hired Teachers</h2>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-indigo-600 text-indigo-600"
              >
                <Link href="/parents/find-teachers">Find More</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {mockHiredTeachers.map((teacher) => (
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
                <p className="text-sm text-gray-600">Teacher: Sarah Johnson</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Physics</h3>
                  <span className="text-sm text-gray-600">Friday, 4:00 PM</span>
                </div>
                <p className="text-sm text-gray-600">Teacher: David Chen</p>
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
