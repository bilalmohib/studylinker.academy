"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { BsStarFill } from "react-icons/bs";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Parent, UK",
    content:
      "StudyLinker transformed my daughter's learning experience. Finding a qualified math teacher was seamless, and the progress reports keep me informed every step of the way.",
    rating: 5,
    avatar: "👩",
  },
  {
    name: "Ahmed Hassan",
    role: "Teacher, Egypt",
    content:
      "As a teacher, StudyLinker gives me the freedom to set my own rates and choose my students. The platform is professional and the support is excellent.",
    rating: 5,
    avatar: "👨",
  },
  {
    name: "Maria Rodriguez",
    role: "Parent, Spain",
    content:
      "The structured curriculum option was perfect for my son's O-Level preparation. The exams and reports give us clear visibility on his progress.",
    rating: 5,
    avatar: "👩",
  },
];

function TestimonialCard({
  testimonial,
  index,
}: { testimonial: typeof testimonials[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <BsStarFill key={i} className="w-5 h-5 text-yellow-400" />
        ))}
      </div>
      <p className="text-gray-700 text-lg mb-6 leading-relaxed">
        "{testimonial.content}"
      </p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-2xl">
          {testimonial.avatar}
        </div>
        <div>
          <div className="font-bold text-gray-900">{testimonial.name}</div>
          <div className="text-gray-600 text-sm">{testimonial.role}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  const titleRef = useRef(null);
  const isTitleInView = useInView(titleRef, { once: true });

  return (
    <section className="py-20 bg-gray-50">
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
            Testimonials
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear what parents and teachers have to say about their experience
            with StudyLinker
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

