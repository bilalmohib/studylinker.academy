import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import { BsBarChart, BsCalendarCheck, BsTrophy, BsFileText } from "react-icons/bs";

export const metadata: Metadata = {
  title: "Reports & Progress Tracking - StudyLinker",
  description:
    "Track your child's academic performance, attendance, and learning outcomes with detailed reports. Stay informed with transparent progress tracking.",
  keywords: ["student reports", "progress tracking", "academic performance", "attendance tracking"],
};

export default function ReportsPage() {
  return (
    <PageTemplate
      title="Reports & Progress Tracking"
      description="Stay informed about your child's learning journey with detailed reports on academic performance, attendance, and progress."
    >
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            What You Can Track
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <BsBarChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Academic Performance
                </h3>
                <p className="text-gray-600">
                  View exam results, test scores, and overall academic progress
                  with detailed analytics.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <BsCalendarCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Attendance & Consistency
                </h3>
                <p className="text-gray-600">
                  Track class attendance, punctuality, and learning consistency
                  over time.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <BsTrophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Teacher Effectiveness
                </h3>
                <p className="text-gray-600">
                  Contextual insights on teacher effectiveness based on
                  trend-based analysis.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <BsFileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Detailed Reports
                </h3>
                <p className="text-gray-600">
                  Access comprehensive reports with exam results, progress
                  summaries, and recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Transparent & Clear</h3>
          <p className="text-indigo-100 mb-6">
            All reports are generated automatically and provide clear insights
            into your child's learning journey. No hidden metrics or confusing
            data — just transparent progress tracking.
          </p>
        </div>
      </div>
    </PageTemplate>
  );
}

