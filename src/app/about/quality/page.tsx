import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import { BsShieldCheck, BsClipboardCheck, BsAward, BsPeople } from "react-icons/bs";

export const metadata: Metadata = {
  title: "Quality Assurance - How We Ensure Quality | StudyLinker",
  description:
    "Learn about StudyLinker's teacher vetting process, quality assurance measures, and how we ensure only qualified educators join our platform.",
  keywords: ["quality assurance", "teacher vetting", "teacher verification", "quality control"],
};

export default function QualityPage() {
  const steps = [
    {
      icon: BsClipboardCheck,
      title: "Application Review",
      description:
        "Every teacher application is carefully reviewed by our team for completeness and basic qualifications.",
    },
    {
      icon: BsAward,
      title: "Credential Verification",
      description:
        "We verify all academic credentials, teaching certifications, and professional qualifications.",
    },
    {
      icon: BsShieldCheck,
      title: "Platform Testing",
      description:
        "Teachers complete subject-specific tests and teaching assessments to demonstrate their expertise.",
    },
    {
      icon: BsPeople,
      title: "Manual Approval",
      description:
        "Our team manually reviews each application before approval, ensuring only qualified educators join.",
    },
  ];

  return (
    <PageTemplate
      title="Quality Assurance"
      description="We ensure only qualified, vetted teachers join our platform. Learn about our rigorous quality assurance process."
    >
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Our Quality Assurance Process
          </h2>
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Ongoing Quality Monitoring</h3>
          <p className="text-indigo-100 mb-4">
            Quality doesn't stop at approval. We continuously monitor teacher
            performance through:
          </p>
          <ul className="space-y-2 text-indigo-100">
            <li>• Parent and student feedback</li>
            <li>• Regular performance reviews</li>
            <li>• Attendance and engagement tracking</li>
            <li>• Academic outcome analysis</li>
          </ul>
        </div>
      </div>
    </PageTemplate>
  );
}

