import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";

export const metadata: Metadata = {
  title: "Terms of Service - StudyLinker",
  description: "Read StudyLinker's Terms of Service. Understand the terms and conditions for using our platform.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <PageTemplate
      title="Terms of Service"
      description="Please read our terms of service carefully before using StudyLinker."
    >
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Last Updated:</strong> January 27, 2025
          </p>
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using StudyLinker, you accept and agree to be
                bound by the terms and provision of this agreement.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Use License
              </h2>
              <p>
                Permission is granted to temporarily use StudyLinker for
                personal, non-commercial transitory viewing only.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. User Accounts
              </h2>
              <p>
                You are responsible for maintaining the confidentiality of your
                account and password. You agree to accept responsibility for all
                activities that occur under your account.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Teacher and Parent Responsibilities
              </h2>
              <p>
                Teachers are responsible for the quality of their teaching
                services. Parents are responsible for payment and account
                management. StudyLinker acts as a marketplace platform.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Limitation of Liability
              </h2>
              <p>
                StudyLinker shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages.
              </p>
            </section>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}

