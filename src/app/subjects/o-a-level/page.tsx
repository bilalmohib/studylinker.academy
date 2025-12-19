import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import { BsAward } from "react-icons/bs";

export const metadata: Metadata = {
  title: "O-Level & A-Level Tutors - Find Teachers | StudyLinker",
  description:
    "Find qualified O-Level and A-Level tutors for Advanced Math, Physics, Chemistry, Biology, Economics, and more. Specialized curriculum support.",
  keywords: ["O-Level tutors", "A-Level tutors", "O-Level", "A-Level", "exam preparation"],
};

export default function OALevelPage() {
  const subjects = [
    "Advanced Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Economics",
    "Business Studies",
    "English Literature",
    "History",
    "Geography",
  ];

  return (
    <PageTemplate
      title="O-Level / A-Level"
      description="Specialized curriculum for O and A Level exams. Find qualified teachers to help your child excel in their examinations."
    >
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <BsAward className="w-10 h-10 text-indigo-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              O-Level & A-Level Subjects
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subject) => (
              <div
                key={subject}
                className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900">{subject}</h3>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Find O-Level & A-Level Teachers
          </h3>
          <p className="text-gray-700 mb-6">
            Browse qualified teachers specializing in O-Level and A-Level
            curriculum or post a job to find the perfect tutor for your child.
          </p>
          <a
            href="/parents/find-teachers"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Find Teachers
          </a>
        </div>
      </div>
    </PageTemplate>
  );
}

