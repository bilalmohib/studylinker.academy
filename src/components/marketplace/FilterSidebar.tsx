"use client";

import { useState } from "react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";

interface FilterSidebarProps {
  type: "teachers" | "jobs";
  onFilterChange?: (filters: any) => void;
}

export default function FilterSidebar({ type, onFilterChange }: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const subjects = [
    "Mathematics",
    "English",
    "Science",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "Economics",
  ];

  const levels = [
    "Primary School",
    "Middle School",
    "Secondary School",
    "O-Level",
    "A-Level",
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg h-fit sticky top-4">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Filters</h2>

      {/* Subject Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("subject")}
          className="w-full flex items-center justify-between text-lg font-semibold text-gray-900 mb-3"
        >
          <span>Subject</span>
          {openSections.includes("subject") ? (
            <BsChevronUp className="w-5 h-5" />
          ) : (
            <BsChevronDown className="w-5 h-5" />
          )}
        </button>
        {openSections.includes("subject") && (
          <div className="space-y-2">
            {subjects.map((subject) => (
              <label
                key={subject}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{subject}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Level Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("level")}
          className="w-full flex items-center justify-between text-lg font-semibold text-gray-900 mb-3"
        >
          <span>Education Level</span>
          {openSections.includes("level") ? (
            <BsChevronUp className="w-5 h-5" />
          ) : (
            <BsChevronDown className="w-5 h-5" />
          )}
        </button>
        {openSections.includes("level") && (
          <div className="space-y-2">
            {levels.map((level) => (
              <label
                key={level}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{level}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Rating Filter (for teachers) */}
      {type === "teachers" && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection("rating")}
            className="w-full flex items-center justify-between text-lg font-semibold text-gray-900 mb-3"
          >
            <span>Minimum Rating</span>
            {openSections.includes("rating") ? (
              <BsChevronUp className="w-5 h-5" />
            ) : (
              <BsChevronDown className="w-5 h-5" />
            )}
          </button>
          {openSections.includes("rating") && (
            <div className="space-y-2">
              {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                <label
                  key={rating}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="rating"
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{rating}+ stars</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Range Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between text-lg font-semibold text-gray-900 mb-3"
        >
          <span>Price Range</span>
          {openSections.includes("price") ? (
            <BsChevronUp className="w-5 h-5" />
          ) : (
            <BsChevronDown className="w-5 h-5" />
          )}
        </button>
        {openSections.includes("price") && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition-colors">
        Apply Filters
      </button>
    </div>
  );
}

