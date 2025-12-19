import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BsSearch, BsFilter, BsStarFill } from "react-icons/bs";

export const metadata: Metadata = {
  title: "Find Teachers - Browse Qualified Tutors | StudyLinker",
  description:
    "Browse and hire qualified, vetted teachers for your child. Filter by subject, level, availability, and more. Find the perfect tutor today.",
  keywords: ["find tutors", "browse teachers", "qualified tutors", "hire tutor"],
  openGraph: {
    title: "Find Teachers - StudyLinker",
    description: "Browse and hire qualified teachers for your child.",
  },
};

export default function FindTeachersPage() {
  return (
    <PageTemplate
      title="Find Qualified Teachers"
      description="Browse our marketplace of vetted, qualified teachers and find the perfect tutor for your child."
    >
      <div className="space-y-8">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <BsSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by subject, teacher name, or keywords..."
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
            How to Find the Right Teacher
          </h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Our marketplace features thousands of qualified teachers from
              around the world. You can:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Browse teachers by subject, education level, and availability</li>
              <li>View detailed profiles with qualifications and ratings</li>
              <li>Read reviews from other parents</li>
              <li>Chat with teachers before hiring</li>
              <li>Post a job and let teachers apply to you</li>
            </ul>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Teacher Marketplace Coming Soon
          </h3>
          <p className="text-gray-700 mb-6">
            We're building an amazing marketplace experience. In the meantime,
            you can:
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Link href="/parents">Learn More About StudyLinker</Link>
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

