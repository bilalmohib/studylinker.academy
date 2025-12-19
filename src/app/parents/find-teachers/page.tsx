"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Container from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BsSearch, BsPlusCircle } from "react-icons/bs";
import TeacherCard from "@/components/marketplace/TeacherCard";
import FilterSidebar from "@/components/marketplace/FilterSidebar";
import { BADGE_TYPES, BadgeType } from "@/components/marketplace/Badge";
import { searchTeachers } from "@/actions/teachers/actions";
import { getTeacherSubjects, getTeacherLevels } from "@/actions/teachers/subjects";
import toast from "react-hot-toast";

interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  level: string;
  rating: number;
  reviews: number;
  students: number;
  rate: string;
  location: string;
  badge?: BadgeType;
  avatar?: string;
}

export default function FindTeachersPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    subject: "",
    level: "",
    minRating: undefined as number | undefined,
    verified: undefined as boolean | undefined,
    maxRate: undefined as number | undefined,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-up?redirect_url=/parents/find-teachers");
    }
  }, [isLoaded, userId, router]);

  // Fetch teachers
  useEffect(() => {
    if (!userId) return;

    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const result = await searchTeachers({
          ...filters,
          page,
          limit: 20,
        });

        if (result.success && result.data) {
          // Transform database data to match TeacherCard props
          const transformedTeachers = await Promise.all(
            result.data.map(async (teacher: any) => {
              // Get subjects and levels
              const [subjectsResult, levelsResult] = await Promise.all([
                getTeacherSubjects(teacher.id),
                getTeacherLevels(teacher.id),
              ]);

              const subjects = subjectsResult.success && subjectsResult.data
                ? subjectsResult.data.map((s: any) => s.subject)
                : [];
              const levels = levelsResult.success && levelsResult.data
                ? levelsResult.data.map((l: any) => l.level).join(", ")
                : "";

              const userProfile = teacher.UserProfile || {};
              const name = `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() || "Teacher";

          // Map badge from database format to BadgeType
          let badge: BadgeType | undefined;
          if (teacher.badge === "TOP_RATED") badge = BADGE_TYPES.TOP_RATED;
          else if (teacher.badge === "RISING_TALENT") badge = BADGE_TYPES.RISING_TALENT;
          else if (teacher.badge === "VERIFIED") badge = BADGE_TYPES.VERIFIED;
          else if (teacher.badge === "NEW") badge = BADGE_TYPES.NEW;

              return {
                id: teacher.id,
                name,
                subjects,
                level: levels || "Not specified",
                rating: teacher.rating || 0,
                reviews: teacher.totalReviews || 0,
                students: teacher.totalStudents || 0,
                rate: teacher.hourlyRate
                  ? `$${teacher.hourlyRate}`
                  : "Contact for rate",
                location: teacher.location || "Not specified",
                badge,
                avatar: userProfile.avatar || undefined,
              };
            })
          );

          setTeachers(transformedTeachers);
          setTotalPages(result.pagination?.totalPages || 1);
        } else {
          toast.error("error" in result ? result.error : "Failed to load teachers");
          setTeachers([]);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
        toast.error("An error occurred while loading teachers");
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [userId, page, filters]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12">
      <Container>
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Find Qualified Teachers
              </h1>
              <p className="text-lg sm:text-xl text-gray-600">
                Browse our marketplace of vetted, qualified teachers
              </p>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-6 text-base sm:text-lg rounded-full shadow-xl w-full sm:w-auto"
            >
              <Link href="/parents/post-job" className="flex items-center justify-center">
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
          <div className="lg:col-span-1 order-2 lg:order-1">
            <FilterSidebar type="teachers" />
          </div>

          {/* Teachers Grid */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {loading ? "Loading..." : `${teachers.length} Teachers Found`}
              </h2>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base w-full sm:w-auto">
                <option>Sort by: Highest Rated</option>
                <option>Sort by: Most Reviews</option>
                <option>Sort by: Lowest Price</option>
                <option>Sort by: Highest Price</option>
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : teachers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No teachers found. Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {teachers.map((teacher) => (
                    <TeacherCard key={teacher.id} {...teacher} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                            page === pageNum
                              ? "bg-indigo-600 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

