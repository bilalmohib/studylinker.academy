"use client";

import Link from "next/link";
import { BsClock, BsPerson, BsBook, BsCurrencyDollar } from "react-icons/bs";
import { Button } from "@/components/ui/button";

interface JobCardProps {
  id: string;
  title: string;
  subject: string;
  level: string;
  studentAge?: number;
  hoursPerWeek: string;
  budget: string;
  postedDate: string;
  applications: number;
  status: "open" | "closed";
  curriculum?: boolean;
}

export default function JobCard({
  id,
  title,
  subject,
  level,
  studentAge,
  hoursPerWeek,
  budget,
  postedDate,
  applications,
  status,
  curriculum,
}: JobCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            {status === "open" ? (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                Open
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                Closed
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <BsBook className="w-4 h-4" />
              {subject}
            </span>
            <span>{level}</span>
            {studentAge && <span>Age: {studentAge}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BsClock className="w-4 h-4 text-indigo-600" />
          <span>{hoursPerWeek} hours/week</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BsCurrencyDollar className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-gray-900">{budget}/month</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BsPerson className="w-4 h-4 text-indigo-600" />
          <span>{applications} applications</span>
        </div>
        {curriculum && (
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
              Curriculum ON
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className="text-sm text-gray-500">Posted {postedDate}</span>
        <Button
          asChild
          variant={status === "open" ? "default" : "outline"}
          className={status === "open" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""}
        >
          <Link href={`/jobs/${id}`}>
            {status === "open" ? "Apply Now" : "View Details"}
          </Link>
        </Button>
      </div>
    </div>
  );
}

