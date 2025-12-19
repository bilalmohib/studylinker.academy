"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  {
    value: "10,000+",
    label: "Qualified Teachers",
    description: "Vetted and approved educators",
  },
  {
    value: "50,000+",
    label: "Active Students",
    description: "Learning and growing daily",
  },
  {
    value: "100+",
    label: "Countries",
    description: "Global reach and impact",
  },
  {
    value: "98%",
    label: "Satisfaction Rate",
    description: "Happy parents and students",
  },
];

function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={
        isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
      }
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center"
    >
      <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
        {stat.value}
      </div>
      <div className="text-xl font-semibold text-gray-900 mb-2">
        {stat.label}
      </div>
      <div className="text-gray-600">{stat.description}</div>
    </motion.div>
  );
}

export default function Stats() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

