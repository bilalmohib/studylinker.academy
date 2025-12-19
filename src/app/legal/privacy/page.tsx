import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";

export const metadata: Metadata = {
  title: "Privacy Policy - StudyLinker",
  description: "Read StudyLinker's Privacy Policy. Learn how we collect, use, and protect your personal information.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <PageTemplate
      title="Privacy Policy"
      description="Your privacy is important to us. Learn how we collect, use, and protect your information."
    >
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Last Updated:</strong> January 27, 2025
          </p>
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Information We Collect
              </h2>
              <p>
                We collect information that you provide directly to us, including
                name, email address, payment information, and educational
                credentials.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. How We Use Your Information
              </h2>
              <p>
                We use the information we collect to provide, maintain, and
                improve our services, process transactions, and communicate with
                you.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Information Sharing
              </h2>
              <p>
                We do not sell your personal information. We may share
                information with teachers and parents as necessary to facilitate
                the tutoring relationship.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Data Security
              </h2>
              <p>
                We implement appropriate security measures to protect your
                personal information against unauthorized access, alteration,
                disclosure, or destruction.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Your Rights
              </h2>
              <p>
                You have the right to access, update, or delete your personal
                information. Contact us to exercise these rights.
              </p>
            </section>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}

