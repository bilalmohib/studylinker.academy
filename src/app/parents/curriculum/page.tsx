import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import { BsBook, BsCheckCircle, BsXCircle } from "react-icons/bs";

export const metadata: Metadata = {
  title: "Curriculum Options - Structured Learning Paths | StudyLinker",
  description:
    "Choose between structured curriculum with assessments or flexible teacher-led learning. StudyLinker offers multiple curriculum options per grade level.",
  keywords: ["curriculum", "structured learning", "O-Level", "A-Level", "education curriculum"],
};

export default function CurriculumPage() {
  return (
    <PageTemplate
      title="Curriculum Options"
      description="Choose the learning path that works best for your child. Structured curriculum with assessments or flexible teacher-led learning."
    >
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Two Learning Modes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-indigo-200 rounded-xl p-6 bg-indigo-50">
              <div className="flex items-center gap-3 mb-4">
                <BsCheckCircle className="w-8 h-8 text-indigo-600" />
                <h3 className="text-2xl font-bold text-gray-900">
                  Curriculum ON
                </h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <BsCheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span>Platform syllabus applied</span>
                </li>
                <li className="flex items-start gap-2">
                  <BsCheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span>Online MCQ exams conducted</span>
                </li>
                <li className="flex items-start gap-2">
                  <BsCheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span>Standardized reports generated</span>
                </li>
                <li className="flex items-start gap-2">
                  <BsCheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span>Track progress against curriculum</span>
                </li>
              </ul>
            </div>
            <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
              <div className="flex items-center gap-3 mb-4">
                <BsXCircle className="w-8 h-8 text-gray-600" />
                <h3 className="text-2xl font-bold text-gray-900">
                  Curriculum OFF
                </h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <BsCheckCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <span>Teacher fully responsible for teaching</span>
                </li>
                <li className="flex items-start gap-2">
                  <BsCheckCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <span>No platform exams</span>
                </li>
                <li className="flex items-start gap-2">
                  <BsCheckCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <span>Flexible learning approach</span>
                </li>
                <li className="flex items-start gap-2">
                  <BsCheckCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <span>Customized teaching style</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Available Curriculums
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Local Board Curriculum",
              "O-Level",
              "A-Level",
              "Primary School",
              "Middle School",
              "Secondary School",
            ].map((curriculum) => (
              <div
                key={curriculum}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                <BsBook className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-900">
                  {curriculum}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}

