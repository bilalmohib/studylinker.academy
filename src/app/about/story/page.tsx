import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";

export const metadata: Metadata = {
  title: "Our Story - StudyLinker",
  description:
    "Learn about StudyLinker's journey, mission, and vision. How we're revolutionizing online tuition through trust and transparency.",
  keywords: ["studylinker story", "our mission", "company history"],
};

export default function StoryPage() {
  return (
    <PageTemplate
      title="Our Story"
      description="Learn about StudyLinker's mission, vision, and how we're transforming online education."
    >
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            StudyLinker was founded with a simple yet powerful vision: to make
            quality education accessible to students worldwide by connecting them
            with qualified, vetted teachers through a transparent, parent-controlled
            platform.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            We believe that parents should have full control over their children's
            education, including who teaches them, what curriculum they follow, and
            how payments are handled. At the same time, we believe teachers should
            have the freedom to set their own rates and teach in their own style.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What Makes Us Different</h2>
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold text-xl">•</span>
              <span>
                <strong className="text-gray-900">Trust-First Approach:</strong> Every teacher
                goes through rigorous vetting and testing before joining our platform.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold text-xl">•</span>
              <span>
                <strong className="text-gray-900">Parent Control:</strong> Parents own accounts,
                control payments, and make all key decisions about their child's education.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold text-xl">•</span>
              <span>
                <strong className="text-gray-900">Flexible Learning:</strong> Choose between
                structured curriculum with assessments or flexible teacher-led learning.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold text-xl">•</span>
              <span>
                <strong className="text-gray-900">Global Reach:</strong> Connect with teachers
                and students from around the world, supporting multiple curriculums.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </PageTemplate>
  );
}

