"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BsClipboardCheck,
  BsShieldCheck,
  BsBarChart,
  BsChatSquareText,
} from "react-icons/bs";

const parentFeatures = [
  {
    icon: BsClipboardCheck,
    title: "You Control Everything",
    description: "Own the account, control payments, and make all decisions.",
  },
  {
    icon: BsShieldCheck,
    title: "Vetted Teachers Only",
    description: "Every teacher is tested and verified before joining.",
  },
  {
    icon: BsBarChart,
    title: "Track Progress",
    description: "View detailed reports on attendance and academic performance.",
  },
  {
    icon: BsChatSquareText,
    title: "Direct Communication",
    description: "Message teachers directly and stay in the loop.",
  },
];

export default function ForParents() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-4">
              For Parents
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              You're in{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Full Control
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              StudyLinker puts parents first. You decide who teaches your child,
              what curriculum they follow, and how payments work. We provide the
              tools; you stay in charge.
            </p>

            <div className="space-y-6 mb-8">
              {parentFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
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
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-full shadow-xl"
            >
              <Link href="/parents/find-teachers">Start Finding Teachers</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-6">👨‍👩‍👧‍👦</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  50,000+ Happy Families
                </h3>
                <p className="text-gray-600 text-lg">
                  Join thousands of parents who trust StudyLinker for their
                  children's education
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

