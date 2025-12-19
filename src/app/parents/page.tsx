import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import { BsShieldCheck, BsPeople, BsBarChart, BsChatSquareText } from "react-icons/bs";

export const metadata: Metadata = {
  title: "For Parents - Find Qualified Teachers for Your Child",
  description:
    "StudyLinker puts parents in control. Find vetted teachers, track progress, and ensure quality education for your child. Parent-controlled tuition marketplace.",
  keywords: ["find tutors", "parent portal", "track student progress", "online tuition for parents"],
  openGraph: {
    title: "For Parents - StudyLinker",
    description: "Find qualified teachers and track your child's progress with StudyLinker.",
  },
};

export default function ForParentsPage() {
  return (
    <PageTemplate
      title="For Parents"
      description="You're in full control. Find qualified teachers, track progress, and ensure quality education for your child."
      cta={{ text: "Find a Teacher", href: "/parents/find-teachers" }}
    >
      <div className="space-y-12">
        <section className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
            Why Choose StudyLinker?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <BsShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Vetted Teachers Only
                </h3>
                <p className="text-gray-600">
                  Every teacher goes through rigorous testing and credential
                  verification before joining our platform.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <BsPeople className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  You Control Everything
                </h3>
                <p className="text-gray-600">
                  Own the account, control payments, and make all decisions
                  about your child's education.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <BsBarChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Track Progress
                </h3>
                <p className="text-gray-600">
                  View detailed reports on attendance and academic performance
                  to stay informed.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <BsChatSquareText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Direct Communication
                </h3>
                <p className="text-gray-600">
                  Message teachers directly and stay in the loop about your
                  child's learning.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
            How It Works
          </h2>
          <ol className="space-y-4 sm:space-y-6">
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Post a Job or Browse Teachers
                </h3>
                <p className="text-gray-600">
                  Create a tuition job posting with your requirements or browse
                  our marketplace of vetted teachers.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Review Applications & Chat
                </h3>
                <p className="text-gray-600">
                  Teachers apply with their proposed rates. Review profiles, chat
                  with applicants, and make informed decisions.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Hire & Set Up Learning
                </h3>
                <p className="text-gray-600">
                  Choose a teacher, select curriculum options (or opt for
                  flexible learning), and finalize the schedule.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Learn & Track Progress
                </h3>
                <p className="text-gray-600">
                  Students attend classes while you track attendance, exam
                  results, and receive detailed progress reports.
                </p>
              </div>
            </li>
          </ol>
        </section>
      </div>
    </PageTemplate>
  );
}

