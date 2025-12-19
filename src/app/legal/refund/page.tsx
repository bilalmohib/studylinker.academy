import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";

export const metadata: Metadata = {
  title: "Refund Policy - StudyLinker",
  description: "Read StudyLinker's Refund Policy. Learn about our refund process and terms.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RefundPage() {
  return (
    <PageTemplate
      title="Refund Policy"
      description="Learn about our refund policy and process."
    >
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Last Updated:</strong> January 27, 2025
          </p>
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Refund Eligibility
              </h2>
              <p>
                Refunds may be available for unused portions of monthly tuition
                fees, subject to our terms and conditions. Refund requests must
                be submitted within 7 days of payment.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Refund Process
              </h2>
              <p>
                To request a refund, please contact our support team with your
                account details and reason for refund. We will review your
                request and process it within 5-10 business days.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Non-Refundable Items
              </h2>
              <p>
                Completed classes, platform fees, and certain services may not
                be eligible for refund. Please review our terms for specific
                details.
              </p>
            </section>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}

