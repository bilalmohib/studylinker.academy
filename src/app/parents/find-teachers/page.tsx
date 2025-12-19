"use client";

import { useState } from "react";
import { Metadata } from "next";
import Container from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BsSearch, BsPlusCircle } from "react-icons/bs";
import TeacherCard from "@/components/marketplace/TeacherCard";
import FilterSidebar from "@/components/marketplace/FilterSidebar";
import { BADGE_TYPES } from "@/components/marketplace/Badge";

// Mock data - replace with API calls later
const mockTeachers = [
  {
    id: "1",
    name: "Sarah Johnson",
    subjects: ["Mathematics", "Physics", "Chemistry"],
    level: "O-Level, A-Level",
    rating: 4.9,
    reviews: 127,
    students: 45,
    rate: "$150",
    location: "United Kingdom",
    badge: BADGE_TYPES.TOP_RATED,
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: "2",
    name: "Ahmed Hassan",
    subjects: ["Mathematics", "English", "Science"],
    level: "Primary, Middle School",
    rating: 4.8,
    reviews: 89,
    students: 32,
    rate: "$120",
    location: "Egypt",
    badge: BADGE_TYPES.RISING_TALENT,
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "3",
    name: "Maria Rodriguez",
    subjects: ["Spanish", "History", "Geography"],
    level: "Secondary School, O-Level",
    rating: 4.7,
    reviews: 56,
    students: 28,
    rate: "$130",
    location: "Spain",
    avatar: "https://i.pravatar.cc/150?img=33",
  },
  {
    id: "4",
    name: "David Chen",
    subjects: ["Mathematics", "Computer Science"],
    level: "A-Level",
    rating: 5.0,
    reviews: 203,
    students: 67,
    rate: "$180",
    location: "Singapore",
    badge: BADGE_TYPES.TOP_RATED,
    avatar: "https://i.pravatar.cc/150?img=68",
  },
];

export default function FindTeachersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12">
      <Container>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Find Qualified Teachers
              </h1>
              <p className="text-xl text-gray-600">
                Browse our marketplace of vetted, qualified teachers
              </p>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-6 text-lg rounded-full shadow-xl"
            >
              <Link href="/parents/post-job">
                <BsPlusCircle className="w-5 h-5 mr-2" />
                Post a Job
              </Link>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <BsSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by subject, teacher name, or keywords..."
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
            <FilterSidebar type="teachers" />
          </div>

          {/* Teachers Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {mockTeachers.length} Teachers Found
              </h2>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option>Sort by: Highest Rated</option>
                <option>Sort by: Most Reviews</option>
                <option>Sort by: Lowest Price</option>
                <option>Sort by: Highest Price</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockTeachers.map((teacher) => (
                <TeacherCard key={teacher.id} {...teacher} />
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
                3
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

