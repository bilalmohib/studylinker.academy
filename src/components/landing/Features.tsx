"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  BsShieldCheck,
  BsPeople,
  BsCalendarCheck,
  BsGraphUp,
  BsGlobe,
  BsCurrencyDollar,
} from "react-icons/bs";

const features = [
  {
    icon: BsShieldCheck,
    title: "Vetted Quality Teachers",
    description:
      "Every teacher goes through rigorous testing and credential verification before joining our platform.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: BsPeople,
    title: "Parent-Controlled",
    description:
      "Parents own accounts, control payments, and make all key decisions about their child's education.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: BsCalendarCheck,
    title: "Flexible Learning",
    description:
      "Choose between structured curriculum with assessments or flexible teacher-led learning paths.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: BsGraphUp,
    title: "Progress Tracking",
    description:
      "Detailed reports on academic performance, attendance, and learning outcomes for transparency.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: BsGlobe,
    title: "Global Reach",
    description:
      "Connect with qualified teachers from around the world, supporting multiple curriculums and levels.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: BsCurrencyDollar,
    title: "Fair Pricing",
    description:
      "Teachers set their own rates. No hidden fees for parents. Transparent, marketplace-driven pricing.",
    color: "from-yellow-500 to-orange-500",
  },
];

function FeatureCard({
  feature,
  index,
}: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group"
    >
      <div className="h-full p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-200">
        <div
          className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} mb-6 transform group-hover:scale-110 transition-transform duration-300`}
        >
          <feature.icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {feature.title}
        </h3>
        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  );
}

export default function Features() {
  const titleRef = useRef(null);
  const isTitleInView = useInView(titleRef, { once: true });

  return (
    <section className="py-20 bg-white">
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
            Why Choose StudyLinker
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need for{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Quality Education
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive platform built on trust, transparency, and
            measurable outcomes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

