import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import { BsNewspaper } from "react-icons/bs";

export const metadata: Metadata = {
  title: "Blog - Education Tips & Insights | StudyLinker",
  description:
    "Read our blog for tips, insights, and resources about online education, finding tutors, and helping your child succeed academically.",
  keywords: ["education blog", "tutoring tips", "education resources", "study tips"],
};

export default function BlogPage() {
  return (
    <PageTemplate
      title="Blog"
      description="Tips, insights, and education resources to help you and your child succeed."
    >
      <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
        <BsNewspaper className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Blog Coming Soon
        </h2>
        <p className="text-gray-600 mb-6">
          We're working on creating valuable content about online education,
          finding the right tutors, study tips, and more. Check back soon!
        </p>
      </div>
    </PageTemplate>
  );
}

