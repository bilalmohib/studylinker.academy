import {
  BsBook,
  BsPeople,
  BsPersonCheck,
  BsCalendarCheck,
  BsClipboardData,
  BsInfoCircle,
  BsEnvelope,
  BsNewspaper,
  BsMortarboard,
  BsPerson,
  BsGlobe,
  BsAward,
  BsSearch,
} from "react-icons/bs";

export const menuItems = [
  {
    title: "For Parents",
    href: "/parents",
    hasDropdown: true,
    items: [
      {
        title: "How It Works",
        href: "/parents/how-it-works",
        description: "Learn how to find and hire qualified teachers.",
        icon: BsInfoCircle,
      },
      {
        title: "Find Teachers",
        href: "/parents/find-teachers",
        description: "Browse and hire vetted teachers for your child.",
        icon: BsPeople,
      },
      {
        title: "Curriculum Options",
        href: "/parents/curriculum",
        description: "Explore structured learning paths and assessments.",
        icon: BsBook,
      },
      {
        title: "Reports & Progress",
        href: "/parents/reports",
        description: "Track your child's academic performance.",
        icon: BsClipboardData,
      },
    ],
  },
  {
    title: "For Teachers",
    href: "/teachers",
    hasDropdown: true,
    items: [
      {
        title: "Find Students",
        href: "/teachers/find-students",
        description: "Browse and apply to tutoring job postings from parents.",
        icon: BsSearch,
      },
      {
        title: "Become a Teacher",
        href: "/teachers/apply",
        description: "Join our global network of qualified educators.",
        icon: BsPersonCheck,
      },
      {
        title: "How to Apply",
        href: "/teachers/application-process",
        description: "Learn about our vetting and approval process.",
        icon: BsClipboardData,
      },
      {
        title: "Teacher Benefits",
        href: "/teachers/benefits",
        description: "Set your rates and grow your tutoring career.",
        icon: BsAward,
      },
      {
        title: "Teaching Resources",
        href: "/teachers/resources",
        description: "Access tools and support for effective teaching.",
        icon: BsBook,
      },
    ],
  },
  {
    title: "Subjects",
    href: "/subjects",
    hasDropdown: true,
    items: [
      {
        title: "Primary School",
        href: "/subjects/primary",
        description: "Foundation subjects for early learners.",
        icon: BsMortarboard,
      },
      {
        title: "Middle School",
        href: "/subjects/middle",
        description: "Core academic subjects for middle schoolers.",
        icon: BsMortarboard,
      },
      {
        title: "Secondary School",
        href: "/subjects/secondary",
        description: "Advanced subjects for secondary students.",
        icon: BsMortarboard,
      },
      {
        title: "O-Level / A-Level",
        href: "/subjects/o-a-level",
        description: "Specialized curriculum for O and A Level exams.",
        icon: BsAward,
      },
    ],
  },
  {
    title: "About",
    href: "/about",
    hasDropdown: true,
    items: [
      {
        title: "Our Story",
        href: "/about/story",
        description: "Learn about StudyLinker's mission and vision.",
        icon: BsInfoCircle,
      },
      {
        title: "How We Ensure Quality",
        href: "/about/quality",
        description: "Our teacher vetting and quality assurance process.",
        icon: BsPersonCheck,
      },
      {
        title: "Blog",
        href: "/blog",
        description: "Tips, insights, and education resources.",
        icon: BsNewspaper,
      },
      {
        title: "Contact Us",
        href: "/contact",
        description: "Get in touch with our support team.",
        icon: BsEnvelope,
      },
    ],
  },
];
