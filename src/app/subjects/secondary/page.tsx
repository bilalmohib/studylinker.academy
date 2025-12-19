import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import { BsBook } from "react-icons/bs";

export const metadata: Metadata = {
  title: "Secondary School Tutors - Find Teachers | StudyLinker",
  description:
    "Find qualified secondary school tutors for Math, English, Physics, Chemistry, Biology, and more. Advanced subjects for secondary students.",
  keywords: ["secondary school tutors", "high school tutors", "secondary education"],
};

export default function SecondaryPage() {
  const subjects = [
    "Mathematics",
    "English Language & Literature",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "Economics",
  ];

  return (
    <PageTemplate
      title="Secondary School"
      description="Advanced subjects for secondary students. Find qualified teachers to help your child excel in their studies."
    >
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <BsBook className="w-10 h-10 text-indigo-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              Secondary School Subjects
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
            Find Secondary School Teachers
          </h3>
          <p className="text-gray-700 mb-6">
            Browse qualified teachers specializing in secondary education or
            post a job to find the perfect tutor for your child.
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

