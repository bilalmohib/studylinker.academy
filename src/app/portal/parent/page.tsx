import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Parent Portal - StudyLinker",
  description: "Access your parent portal to manage your child's education, view reports, and communicate with teachers.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ParentPortalPage() {
  return (
    <PageTemplate
      title="Parent Portal"
      description="Access your account to manage your child's education, view progress reports, and communicate with teachers."
    >
      <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Parent Portal Coming Soon
        </h2>
        <p className="text-gray-600 mb-6">
          We're building a comprehensive parent portal where you can manage
          everything related to your child's education in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Link href="/parents">Learn More</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </PageTemplate>
  );
}

