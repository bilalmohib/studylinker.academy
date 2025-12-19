"use client";

import { useState } from "react";
import Container from "@/components/common/Container";
import { BsSearch } from "react-icons/bs";
import JobCard from "@/components/marketplace/JobCard";
import FilterSidebar from "@/components/marketplace/FilterSidebar";

// Mock data - replace with API calls later
const mockJobs = [
  {
    id: "1",
    title: "Mathematics Tutor Needed for O-Level Student",
    subject: "Mathematics",
    level: "O-Level",
    studentAge: 16,
    hoursPerWeek: "5-8",
    budget: "$150-200",
    postedDate: "2 days ago",
    applications: 12,
    status: "open" as const,
    curriculum: true,
  },
  {
    id: "2",
    title: "Primary School English and Science Tutor",
    subject: "English, Science",
    level: "Primary School",
    studentAge: 9,
    hoursPerWeek: "3-5",
    budget: "$100-150",
    postedDate: "1 week ago",
    applications: 8,
    status: "open" as const,
    curriculum: false,
  },
  {
    id: "3",
    title: "A-Level Physics and Chemistry Tutor",
    subject: "Physics, Chemistry",
    level: "A-Level",
    studentAge: 17,
    hoursPerWeek: "6-10",
    budget: "$200-250",
    postedDate: "3 days ago",
    applications: 15,
    status: "open" as const,
    curriculum: true,
  },
  {
    id: "4",
    title: "Middle School Math Tutor",
    subject: "Mathematics",
    level: "Middle School",
    studentAge: 13,
    hoursPerWeek: "4-6",
    budget: "$120-180",
    postedDate: "5 days ago",
    applications: 6,
    status: "open" as const,
  },
];

export default function FindStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12">
      <Container>
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Find Students
            </h1>
            <p className="text-xl text-gray-600">
              Browse job postings from parents and find students who need your expertise
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <BsSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by subject, level, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar type="jobs" />
          </div>

          {/* Jobs Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {mockJobs.length} Jobs Available
              </h2>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option>Sort by: Newest First</option>
                <option>Sort by: Highest Budget</option>
                <option>Sort by: Most Applications</option>
                <option>Sort by: Fewest Applications</option>
              </select>
            </div>

            <div className="space-y-4">
              {mockJobs.map((job) => (
                <JobCard key={job.id} {...job} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Previous
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                2
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

