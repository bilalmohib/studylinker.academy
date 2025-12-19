import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BsSearch, BsFilter, BsBriefcase } from "react-icons/bs";

export const metadata: Metadata = {
  title: "Find Students - Browse Job Postings | StudyLinker",
  description:
    "Browse tutoring job postings from parents and find students to teach. Apply to positions that match your expertise and availability.",
  keywords: ["find students", "tutoring jobs", "job postings", "teach students"],
  openGraph: {
    title: "Find Students - StudyLinker",
    description: "Browse job postings and find students to teach.",
  },
};

export default function FindStudentsPage() {
  return (
    <PageTemplate
      title="Find Students"
      description="Browse job postings from parents and find students who need your expertise. Apply to positions that match your skills and availability."
    >
      <div className="space-y-8">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <BsSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by subject, level, or keywords..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6">
              <BsFilter className="w-5 h-5 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Find Students
          </h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Our job marketplace connects you with parents looking for qualified
              teachers. You can:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Browse job postings by subject, education level, and schedule</li>
              <li>View detailed requirements and student information</li>
              <li>Apply with your proposed rates and availability</li>
              <li>Chat with parents before accepting positions</li>
              <li>Build your reputation through successful teaching</li>
            </ul>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 border-2 border-indigo-200">
          <div className="flex items-center gap-4 mb-4">
            <BsBriefcase className="w-8 h-8 text-indigo-600" />
            <h3 className="text-2xl font-bold text-gray-900">
              Job Marketplace Coming Soon
            </h3>
          </div>
          <p className="text-gray-700 mb-6">
            We're building an amazing job marketplace experience. In the meantime,
            you can:
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Link href="/teachers/apply">Apply to Become a Teacher</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}

