import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";

export const metadata: Metadata = {
  title: "Cookie Policy - StudyLinker",
  description: "Read StudyLinker's Cookie Policy. Learn how we use cookies and similar technologies.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function CookiesPage() {
  return (
    <PageTemplate
      title="Cookie Policy"
      description="Learn how StudyLinker uses cookies and similar technologies."
    >
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Last Updated:</strong> January 27, 2025
          </p>
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What Are Cookies?
              </h2>
              <p>
                Cookies are small text files that are placed on your device when
                you visit our website. They help us provide you with a better
                experience.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How We Use Cookies
              </h2>
              <p>
                We use cookies to remember your preferences, analyze site
                traffic, and improve our services. We use both session cookies
                and persistent cookies.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Managing Cookies
              </h2>
              <p>
                You can control and manage cookies through your browser settings.
                However, disabling cookies may affect your ability to use certain
                features of our platform.
              </p>
            </section>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}

