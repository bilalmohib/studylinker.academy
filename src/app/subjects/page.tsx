import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import Link from "next/link";
import { BsMortarboard, BsBook, BsAward } from "react-icons/bs";

export const metadata: Metadata = {
  title: "Subjects & Education Levels - StudyLinker",
  description:
    "Find teachers for all education levels: Primary School, Middle School, Secondary School, O-Level, and A-Level. Browse subjects by level.",
  keywords: ["subjects", "education levels", "primary school", "secondary school", "O-Level", "A-Level"],
};

export default function SubjectsPage() {
  const levels = [
    {
      title: "Primary School",
      href: "/subjects/primary",
      icon: BsMortarboard,
      description: "Foundation subjects for early learners",
      subjects: ["Math", "English", "Science", "Social Studies"],
    },
    {
      title: "Middle School",
      href: "/subjects/middle",
      icon: BsBook,
      description: "Core academic subjects for middle schoolers",
      subjects: ["Math", "English", "Science", "History", "Geography"],
    },
    {
      title: "Secondary School",
      href: "/subjects/secondary",
      icon: BsBook,
      description: "Advanced subjects for secondary students",
      subjects: ["Math", "English", "Physics", "Chemistry", "Biology"],
    },
    {
      title: "O-Level / A-Level",
      href: "/subjects/o-a-level",
      icon: BsAward,
      description: "Specialized curriculum for O and A Level exams",
      subjects: ["Advanced Math", "Physics", "Chemistry", "Biology", "Economics"],
    },
  ];

  return (
    <PageTemplate
      title="Subjects & Education Levels"
      description="Find qualified teachers for all education levels and subjects. From primary school to A-Level, we have you covered."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {levels.map((level) => {
          const Icon = level.icon;
          return (
            <Link
              key={level.title}
              href={level.href}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {level.title}
                  </h3>
                  <p className="text-gray-600">{level.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {level.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </PageTemplate>
  );
}

