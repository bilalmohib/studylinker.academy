"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BsCurrencyDollar,
  BsGlobe,
  BsCalendar,
  BsTrophy,
} from "react-icons/bs";

const teacherFeatures = [
  {
    icon: BsCurrencyDollar,
    title: "Set Your Own Rates",
    description: "Full pricing freedom — you decide what you're worth.",
  },
  {
    icon: BsGlobe,
    title: "Global Opportunities",
    description: "Teach students from anywhere in the world.",
  },
  {
    icon: BsCalendar,
    title: "Flexible Schedule",
    description: "Choose your availability and work when it suits you.",
  },
  {
    icon: BsTrophy,
    title: "Performance-Based Growth",
    description: "Build your reputation and unlock higher visibility tiers.",
  },
];

export default function ForTeachers() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-6">👨‍🏫</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  10,000+ Teachers
                </h3>
                <p className="text-gray-600 text-lg">
                  Join our global community of qualified educators making a
                  difference
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-4">
              For Teachers
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Grow Your{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Teaching Career
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              StudyLinker gives you the freedom to teach on your terms. Set your
              rates, choose your students, and build a thriving tutoring career
              on a trusted platform.
            </p>

            <div className="space-y-6 mb-8">
              {teacherFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-full shadow-xl"
            >
              <Link href="/teachers/apply">Apply to Teach</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

