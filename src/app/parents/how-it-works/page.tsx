import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import { BsSearch, BsChatDots, BsCheckCircle, BsCalendar2Week } from "react-icons/bs";

export const metadata: Metadata = {
  title: "How It Works for Parents - StudyLinker",
  description:
    "Learn how StudyLinker works for parents. From posting a job to tracking progress, discover how easy it is to find qualified teachers for your child.",
  keywords: ["how studylinker works", "parent guide", "find tutors process"],
};

export default function HowItWorksPage() {
  const steps = [
    {
      icon: BsSearch,
      title: "Post a Job or Browse Teachers",
      description:
        "Create a tuition job posting with your specific requirements, or browse our marketplace of vetted teachers by subject, level, and availability.",
    },
    {
      icon: BsChatDots,
      title: "Review Applications & Chat",
      description:
        "Teachers apply with their proposed monthly rates and availability. Review their profiles, chat with applicants, and make informed decisions.",
    },
    {
      icon: BsCheckCircle,
      title: "Hire & Set Up Learning",
      description:
        "Choose a teacher that fits your needs. Select curriculum options (structured or flexible), and finalize the schedule that works for your family.",
    },
    {
      icon: BsCalendar2Week,
      title: "Learn & Track Progress",
      description:
        "Students attend classes while you track attendance, exam results, and receive detailed progress reports to stay informed.",
    },
  ];

  return (
    <PageTemplate
      title="How StudyLinker Works"
      description="From finding the right teacher to tracking your child's progress — it's simple, transparent, and parent-controlled."
    >
      <div className="space-y-12">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg flex gap-6 items-start"
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
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

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-xl mb-6 text-indigo-100">
            Join thousands of parents who trust StudyLinker for their children's
            education
          </p>
          <a
            href="/parents/find-teachers"
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Find a Teacher Now
          </a>
        </div>
      </div>
    </PageTemplate>
  );
}

