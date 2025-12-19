import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import Link from "next/link";
import { BsInfoCircle, BsShieldCheck, BsNewspaper, BsEnvelope } from "react-icons/bs";

export const metadata: Metadata = {
  title: "About Us - StudyLinker",
  description:
    "Learn about StudyLinker's mission to connect students and parents with qualified teachers worldwide. Trust-first, parent-controlled tuition marketplace.",
  keywords: ["about studylinker", "our mission", "education platform"],
};

export default function AboutPage() {
  const links = [
    {
      title: "Our Story",
      href: "/about/story",
      icon: BsInfoCircle,
      description: "Learn about StudyLinker's mission and vision",
    },
    {
      title: "Quality Assurance",
      href: "/about/quality",
      icon: BsShieldCheck,
      description: "Our teacher vetting and quality assurance process",
    },
    {
      title: "Blog",
      href: "/blog",
      icon: BsNewspaper,
      description: "Tips, insights, and education resources",
    },
    {
      title: "Contact Us",
      href: "/contact",
      icon: BsEnvelope,
      description: "Get in touch with our support team",
    },
  ];

  return (
    <PageTemplate
      title="About StudyLinker"
      description="Connecting students and parents with qualified teachers worldwide. Trust-first, parent-controlled tuition marketplace."
    >
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            StudyLinker is an online tuition marketplace designed to connect
            parents and students with high-quality, vetted teachers worldwide.
            We focus on academic tuition and emphasize trust, transparency, and
            measurable outcomes.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Parents remain in control of payments and academic structure, while
            teachers retain autonomy in pricing and teaching style. We're not a
            content platform or traditional online school — we're a trust-first,
            parent-controlled tuition marketplace with optional academic structure
            and global reach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.title}
                href={link.href}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {link.title}
                    </h3>
                    <p className="text-gray-600">{link.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </PageTemplate>
  );
}

