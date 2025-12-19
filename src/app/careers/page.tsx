import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import { BsBriefcase } from "react-icons/bs";

export const metadata: Metadata = {
  title: "Careers - Join StudyLinker Team",
  description:
    "Join the StudyLinker team and help us revolutionize online education. View open positions and career opportunities.",
  keywords: ["careers", "jobs", "hiring", "work at studylinker"],
};

export default function CareersPage() {
  return (
    <PageTemplate
      title="Careers"
      description="Join us in revolutionizing online education. Help connect students with qualified teachers worldwide."
    >
      <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
        <BsBriefcase className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Careers Coming Soon
        </h2>
        <p className="text-gray-600 mb-6">
          We're growing! Check back soon for open positions. In the meantime, if
          you're passionate about education and want to join our team, please
          contact us.
        </p>
        <a
          href="/contact"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Contact Us
        </a>
      </div>
    </PageTemplate>
  );
}

