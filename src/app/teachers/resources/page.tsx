import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import { BsBook, BsFileText, BsPeople, BsQuestionCircle } from "react-icons/bs";

export const metadata: Metadata = {
  title: "Teaching Resources - StudyLinker",
  description:
    "Access teaching resources, guides, and support materials to help you succeed as a teacher on StudyLinker.",
  keywords: ["teaching resources", "teacher guides", "tutoring resources"],
};

export default function ResourcesPage() {
  return (
    <PageTemplate
      title="Teaching Resources"
      description="Access tools, guides, and support to help you succeed as a teacher on StudyLinker."
    >
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Available Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <BsBook className="w-8 h-8 text-indigo-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Teaching Guides
                </h3>
                <p className="text-gray-600">
                  Comprehensive guides on effective online teaching methods and
                  best practices.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <BsFileText className="w-8 h-8 text-indigo-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Platform Documentation
                </h3>
                <p className="text-gray-600">
                  Learn how to use all platform features, from scheduling to
                  progress tracking.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <BsPeople className="w-8 h-8 text-indigo-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Community Support
                </h3>
                <p className="text-gray-600">
                  Connect with other teachers, share experiences, and get advice
                  from experienced educators.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <BsQuestionCircle className="w-8 h-8 text-indigo-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Help Center
                </h3>
                <p className="text-gray-600">
                  Find answers to common questions and get support when you need
                  it.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 border-2 border-indigo-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Resources Coming Soon
          </h3>
          <p className="text-gray-700">
            We're building a comprehensive resource library for teachers. Check
            back soon or contact us for immediate support.
          </p>
        </div>
      </div>
    </PageTemplate>
  );
}

