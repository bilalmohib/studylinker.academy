import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import { BsCurrencyDollar, BsGlobe, BsCalendar, BsTrophy } from "react-icons/bs";

export const metadata: Metadata = {
  title: "For Teachers - Join Our Global Network | StudyLinker",
  description:
    "Join StudyLinker and grow your teaching career. Set your own rates, teach students worldwide, and build a thriving tutoring business on a trusted platform.",
  keywords: ["become a tutor", "teach online", "tutoring jobs", "online teaching"],
  openGraph: {
    title: "For Teachers - StudyLinker",
    description: "Join our global network of qualified educators and grow your teaching career.",
  },
};

export default function ForTeachersPage() {
  return (
    <PageTemplate
      title="For Teachers"
      description="Grow your teaching career on StudyLinker. Set your rates, choose your students, and build a thriving tutoring business."
      cta={{ text: "Apply to Teach", href: "/teachers/apply" }}
    >
      <div className="space-y-12">
        <section className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Why Teach on StudyLinker?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
                <BsCurrencyDollar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Set Your Own Rates
                </h3>
                <p className="text-gray-600">
                  Full pricing freedom — you decide what you're worth. No
                  restrictions on how much you can charge.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
                <BsGlobe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Global Opportunities
                </h3>
                <p className="text-gray-600">
                  Teach students from anywhere in the world. Expand your reach
                  beyond geographical boundaries.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
                <BsCalendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Flexible Schedule
                </h3>
                <p className="text-gray-600">
                  Choose your availability and work when it suits you. Balance
                  teaching with your other commitments.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
                <BsTrophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Performance-Based Growth
                </h3>
                <p className="text-gray-600">
                  Build your reputation and unlock higher visibility tiers based
                  on your performance and ratings.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            How It Works for Teachers
          </h2>
          <ol className="space-y-6">
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Apply to Join
                </h3>
                <p className="text-gray-600">
                  Submit your application with credentials and complete our
                  platform-administered tests.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Get Approved
                </h3>
                <p className="text-gray-600">
                  Our team reviews your application and credentials. Once
                  approved, you're ready to teach.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Find Students
                </h3>
                <p className="text-gray-600">
                  Browse job postings from parents or let them find you. Apply
                  to positions that match your expertise.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Start Teaching
                </h3>
                <p className="text-gray-600">
                  Conduct classes, track progress, and build your reputation as
                  a trusted educator.
                </p>
              </div>
            </li>
          </ol>
        </section>
      </div>
    </PageTemplate>
  );
}

