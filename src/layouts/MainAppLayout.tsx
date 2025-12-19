"use client";

import { Toaster } from "react-hot-toast";
import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";

interface MainAppLayoutProps {
  children: React.ReactNode;
}

const MainAppLayout = ({ children }: MainAppLayoutProps) => {
  return (
    <div>
      <div className="sticky top-0 z-50 bg-white">
        <Navbar />
      </div>

      <div className="relative z-10 !overflow-x-hidden">{children}</div>

      <Footer />
      
      <Toaster position="top-left" reverseOrder={false} />
    </div>
  );
};

export default MainAppLayout;
