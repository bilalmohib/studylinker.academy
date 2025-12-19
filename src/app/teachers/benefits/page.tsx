import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import { BsCurrencyDollar, BsGlobe, BsCalendar, BsTrophy, BsShield, BsPeople } from "react-icons/bs";

export const metadata: Metadata = {
  title: "Teacher Benefits - Why Teach on StudyLinker",
  description:
    "Discover the benefits of teaching on StudyLinker. Set your rates, teach globally, flexible schedule, and performance-based growth opportunities.",
  keywords: ["teacher benefits", "tutoring benefits", "online teaching advantages"],
};

export default function BenefitsPage() {
  const benefits = [
    {
      icon: BsCurrencyDollar,
      title: "Set Your Own Rates",
      description:
        "Full pricing freedom with no restrictions. You decide what your expertise is worth.",
    },
    {
      icon: BsGlobe,
      title: "Global Reach",
      description:
        "Teach students from anywhere in the world. Expand your teaching career beyond borders.",
    },
    {
      icon: BsCalendar,
      title: "Flexible Schedule",
      description:
        "Choose your availability and work when it suits you. Balance teaching with life.",
    },
    {
      icon: BsTrophy,
      title: "Performance-Based Growth",
      description:
        "Build your reputation and unlock higher visibility tiers based on your success.",
    },
    {
      icon: BsShield,
      title: "Trusted Platform",
      description:
        "Teach on a platform parents trust. We handle payments, disputes, and platform support.",
    },
    {
      icon: BsPeople,
      title: "Supportive Community",
      description:
        "Join a community of qualified educators. Access resources and teaching support.",
    },
  ];

  return (
    <PageTemplate
      title="Teacher Benefits"
      description="Discover why thousands of teachers choose StudyLinker to grow their teaching careers."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageTemplate>
  );
}

