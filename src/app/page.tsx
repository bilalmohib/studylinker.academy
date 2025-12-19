import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import ForParents from "@/components/landing/ForParents";
import ForTeachers from "@/components/landing/ForTeachers";
import Stats from "@/components/landing/Stats";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <Stats />
      <HowItWorks />
      <ForParents />
      <ForTeachers />
      <Testimonials />
      <CTA />
    </main>
  );
}
