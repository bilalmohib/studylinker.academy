import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import { BsFileText, BsClipboardCheck, BsAward, BsCheckCircle } from "react-icons/bs";

export const metadata: Metadata = {
  title: "Teacher Application Process - StudyLinker",
  description:
    "Learn about StudyLinker's teacher application process. From submission to approval, understand what it takes to join our platform.",
  keywords: ["teacher application process", "how to become a teacher", "teacher vetting"],
};

export default function ApplicationProcessPage() {
  const steps = [
    {
      icon: BsFileText,
      title: "Submit Application",
      description:
        "Fill out the application form with your personal information, educational background, and teaching experience.",
    },
    {
      icon: BsClipboardCheck,
      title: "Credential Submission",
      description:
        "Upload your academic certificates, teaching qualifications, and any relevant certifications.",
    },
    {
      icon: BsAward,
      title: "Platform Tests",
      description:
        "Complete subject-specific tests and teaching assessments administered by our platform.",
    },
    {
      icon: BsCheckCircle,
      title: "Manual Approval",
      description:
        "Our team reviews your application, credentials, and test results. Approval typically takes 3-5 business days.",
    },
  ];

  return (
    <PageTemplate
      title="Application Process"
      description="Learn about our vetting and approval process. We ensure only qualified educators join our platform."
    >
      <div className="space-y-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg flex gap-6 items-start"
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-3">
                  Step {index + 1}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Happens After Approval?
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <BsCheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span>Create your teacher profile with rates and availability</span>
            </li>
            <li className="flex items-start gap-2">
              <BsCheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span>Start browsing and applying to job postings</span>
            </li>
            <li className="flex items-start gap-2">
              <BsCheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span>Build your reputation through successful teaching</span>
            </li>
            <li className="flex items-start gap-2">
              <BsCheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span>Unlock higher visibility tiers as you grow</span>
            </li>
          </ul>
        </div>
      </div>
    </PageTemplate>
  );
}

