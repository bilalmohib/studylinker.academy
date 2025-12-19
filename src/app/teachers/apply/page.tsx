import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import { BsCheckCircle, BsFileText, BsAward, BsClock } from "react-icons/bs";

export const metadata: Metadata = {
  title: "Apply to Become a Teacher - StudyLinker",
  description:
    "Join StudyLinker as a teacher. Complete our application process, submit credentials, and start teaching students worldwide.",
  keywords: ["become a teacher", "teacher application", "join as tutor", "teacher signup"],
};

export default function ApplyPage() {
  return (
    <PageTemplate
      title="Apply to Become a Teacher"
      description="Join our global network of qualified educators and start making a difference in students' lives."
    >
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Application Requirements
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <BsCheckCircle className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Academic Qualifications
                </h3>
                <p className="text-gray-600">
                  Submit your educational credentials and certifications relevant
                  to the subjects you want to teach.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <BsCheckCircle className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Platform Tests
                </h3>
                <p className="text-gray-600">
                  Complete our platform-administered tests to demonstrate your
                  subject knowledge and teaching ability.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <BsCheckCircle className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Background Verification
                </h3>
                <p className="text-gray-600">
                  Provide necessary documentation for background checks and
                  identity verification.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Apply?</h3>
          <p className="text-indigo-100 mb-6">
            The application process typically takes 3-5 business days. Once
            approved, you can start finding students immediately.
          </p>
          <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
            <p className="text-white font-semibold mb-4">
              Application form coming soon. For now, please contact us to express
              your interest.
            </p>
            <a
              href="/contact"
              className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}

