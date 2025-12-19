"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  BsSearch,
  BsChatDots,
  BsCheckCircle,
  BsCalendar2Week,
} from "react-icons/bs";

const steps = [
  {
    icon: BsSearch,
    title: "Post a Job or Browse Teachers",
    description:
      "Parents create a tuition job posting or browse our marketplace of vetted teachers by subject, level, and availability.",
    color: "indigo",
  },
  {
    icon: BsChatDots,
    title: "Review Applications & Chat",
    description:
      "Teachers apply with their proposed rates. Parents review profiles, chat with applicants, and make informed decisions.",
    color: "purple",
  },
  {
    icon: BsCheckCircle,
    title: "Hire & Set Up Learning",
    description:
      "Choose a teacher, select curriculum options (or opt for flexible learning), and finalize the schedule that works for you.",
    color: "pink",
  },
  {
    icon: BsCalendar2Week,
    title: "Learn & Track Progress",
    description:
      "Students attend classes while parents track attendance, exam results, and receive detailed progress reports.",
    color: "blue",
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const colorMap = {
    indigo: "from-indigo-500 to-indigo-600",
    purple: "from-purple-500 to-purple-600",
    pink: "from-pink-500 to-pink-600",
    blue: "from-blue-500 to-blue-600",
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={
        isInView
          ? { opacity: 1, x: 0 }
          : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }
      }
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="relative flex items-start gap-6"
    >
      <div className="flex-shrink-0">
        <div
          className={`w-16 h-16 rounded-full bg-gradient-to-r ${
            colorMap[step.color as keyof typeof colorMap]
          } flex items-center justify-center shadow-lg`}
        >
          <step.icon className="w-8 h-8 text-white" />
        </div>
        <div className="absolute left-8 top-16 w-0.5 h-24 bg-gradient-to-b from-indigo-300 to-transparent hidden lg:block" />
      </div>
      <div className="flex-1">
        <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-3">
          Step {index + 1}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
        <p className="text-gray-600 leading-relaxed">{step.description}</p>
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  const titleRef = useRef(null);
  const isTitleInView = useInView(titleRef, { once: true });

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 20 }}
          animate={
            isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
          }
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-4">
            Simple Process
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            How{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              StudyLinker
            </span>{" "}
            Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From finding the right teacher to tracking your child's progress —
            it's simple, transparent, and parent-controlled.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-12">
          {steps.map((step, index) => (
            <StepCard key={index} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

