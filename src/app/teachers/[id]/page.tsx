"use client";

import { use } from "react";
import Container from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BsStarFill,
  BsPeople,
  BsGlobe,
  BsAward,
  BsCalendar,
  BsChatDots,
  BsBook,
  BsCheckCircle,
} from "react-icons/bs";
import Image from "next/image";
import Badge, { BADGE_TYPES } from "@/components/marketplace/Badge";

// Mock data - replace with API call
const getTeacherData = (id: string) => {
  return {
    id,
    name: "Sarah Johnson",
    location: "United Kingdom",
    rating: 4.9,
    reviews: 127,
    students: 45,
    rate: "$150/month",
    badge: "Top Rated",
    subjects: ["Mathematics", "Physics", "Chemistry"],
    levels: ["O-Level", "A-Level"],
    bio: "Experienced mathematics and science tutor with over 10 years of teaching experience. Specialized in O-Level and A-Level curriculum. Passionate about helping students achieve their academic goals.",
    qualifications: [
      "MSc in Mathematics, University of Cambridge",
      "BSc in Physics, University of Oxford",
      "Teaching Certificate (PGCE)",
    ],
    experience: "10+ years",
    availability: "Monday - Friday: 2 PM - 8 PM GMT",
    languages: ["English"],
    verified: true,
    badge: BADGE_TYPES.TOP_RATED,
    avatar: "https://i.pravatar.cc/300?img=47",
  };
};

export default function TeacherProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const teacher = getTeacherData(id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12">
      <Container>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg mb-6">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
              <div className="shrink-0 relative mx-auto md:mx-0">
                {teacher.avatar ? (
                  <Image
                    src={teacher.avatar}
                    alt={teacher.name}
                    width={128}
                    height={128}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
                    {teacher.name.charAt(0)}
                  </div>
                )}
                {teacher.badge && (
                  <div className="absolute -top-1 -right-1">
                    <Badge type={teacher.badge as any} />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 mb-2 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {teacher.name}
                      </h1>
                      {teacher.verified && (
                        <BsCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <BsGlobe className="w-5 h-5" />
                      <span>{teacher.location}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <BsStarFill
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(teacher.rating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-gray-600">
                        {teacher.rating} ({teacher.reviews} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-indigo-600 mb-1">
                      {teacher.rate}
                    </div>
                    <Button
                      asChild
                      className="bg-indigo-600 hover:bg-indigo-700 text-white mt-4"
                    >
                      <Link href={`/teachers/${id}/contact`}>Contact Teacher</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{teacher.bio}</p>
              </div>

              {/* Qualifications */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Qualifications
                </h2>
                <ul className="space-y-3">
                  {teacher.qualifications.map((qual, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <BsAward className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subjects & Levels */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Subjects & Levels
                </h2>
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Subjects:</h3>
                  <div className="flex flex-wrap gap-2">
                    {teacher.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Levels:</h3>
                  <div className="flex flex-wrap gap-2">
                    {teacher.levels.map((level) => (
                      <span
                        key={level}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold"
                      >
                        {level}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Reviews ({teacher.reviews})
                </h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        P
                      </div>
                        <div>
                          <div className="font-semibold text-gray-900">Parent Name</div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <BsStarFill
                                key={i}
                                className="w-4 h-4 text-yellow-400"
                              />
                            ))}
                            <span className="text-sm text-gray-500 ml-2">2 weeks ago</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">
                        Excellent teacher! My child's grades improved significantly.
                        Very patient and understanding.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <BsPeople className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-700">{teacher.students} students</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BsCalendar className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-700">{teacher.experience} experience</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BsBook className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-700">{teacher.subjects.length} subjects</span>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Availability</h3>
                <p className="text-gray-700">{teacher.availability}</p>
              </div>

              {/* Languages */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {teacher.languages.map((lang) => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

