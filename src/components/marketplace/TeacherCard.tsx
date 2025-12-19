"use client";

import Link from "next/link";
import Image from "next/image";
import { BsStarFill, BsPeople, BsGlobe } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import Badge, { BadgeType } from "./Badge";

interface TeacherCardProps {
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

export default function TeacherCard({
  id,
  name,
  subjects,
  level,
  rating,
  reviews,
  students,
  rate,
  location,
  badge,
  avatar,
}: TeacherCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-start gap-3 sm:gap-4 mb-4">
        <div className="relative shrink-0">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              width={64}
              height={64}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover shadow-md"
            />
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg sm:text-2xl font-bold shadow-md">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          {badge && (
            <div className="absolute -top-1 -right-1 z-10">
              <Badge type={badge} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">{name}</h3>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
            <BsGlobe className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-1 mb-2 flex-wrap">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <BsStarFill
                  key={i}
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${
                    i < Math.floor(rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-600">
              {rating} ({reviews})
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <BsPeople className="w-4 h-4" />
          <span>{students} students</span>
        </div>
        <div className="mb-3">
          <span className="text-sm font-semibold text-gray-700">Levels: </span>
          <span className="text-sm text-gray-600">{level}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {subjects.slice(0, 3).map((subject) => (
            <span
              key={subject}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold"
            >
              {subject}
            </span>
          ))}
          {subjects.length > 3 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
              +{subjects.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-200">
        <div>
          <span className="text-xl sm:text-2xl font-bold text-indigo-600">{rate}</span>
          <span className="text-xs sm:text-sm text-gray-600">/month</span>
        </div>
        <Button
          asChild
          className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto text-sm sm:text-base"
        >
          <Link href={`/teachers/${id}`} className="text-center">View Profile</Link>
        </Button>
      </div>
    </div>
  );
}

