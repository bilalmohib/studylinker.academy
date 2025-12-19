"use client";

import { X } from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Logo from "@/components/common/Navbar/Logo";
import Container from "@/components/common/Container";
import NavItems from "@/components/common/Navbar/NavItems";
import MobileNavItems from "@/components/common/Navbar/NavItems/MobileNavItems";

const AuthButtons = dynamic(
  () => import("@/components/common/Navbar/AuthButtons"),
  {
    ssr: false,
    loading: () => null,
  }
);

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <nav
      className={`w-full bg-lightGray2 transition-all duration-200 sticky top-0 z-50 ${
        isScrolled ? "border-b border-gray-200 shadow-md" : ""
      }`}
    >
      <Container>
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo - Responsive sizing */}
          <div className="shrink-0">
            <Logo onClick={() => setIsMobileMenuOpen(false)} />
          </div>

          {/* Desktop Navigation - Hidden on mobile, shown at 1366px+ */}
          <div className="hidden min-[1366px]:block flex-1 mx-8">
            {isMounted ? <NavItems /> : <div aria-hidden="true" />}
          </div>

          {/* Desktop Auth Buttons - Hidden on mobile, shown at 1366px+ */}
          <div className="hidden min-[1366px]:block shrink-0">
            <AuthButtons isMobile={false} />
          </div>

          {/* Mobile menu button and auth - Shown on mobile, hidden at 1366px+ */}
          <div className="flex items-center gap-2 sm:gap-4 min-[1366px]:hidden">
            <AuthButtons isMobile={true} />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center p-2 rounded-md text-[#414141] hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-all duration-200"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <div className="relative w-6 h-6 sm:w-7 sm:h-7">
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 sm:w-7 sm:h-7 text-[#1D1D1D] transition-all duration-200" />
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 37 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 sm:w-7 sm:h-7 transition-all duration-200"
                  >
                    <path
                      d="M0.125 24.75H36.875V20.6667H0.125V24.75ZM0.125 14.5417H36.875V10.4583H0.125V14.5417ZM0.125 0.25V4.33333H36.875V0.25H0.125Z"
                      fill="#1D1D1D"
                    />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile menu with smooth animation */}
      <div
        className={`block min-[1366px]:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <Container>
          <div className="bg-white border-t border-gray-200 shadow-lg">
            <div
              className={`px-4 pt-4 pb-6 transform transition-all duration-300 ease-out ${
                isMobileMenuOpen
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-4 opacity-0"
              }`}
              style={{
                transitionDelay: isMobileMenuOpen ? "100ms" : "0ms",
              }}
            >
              <div className="flex flex-col">
                {isMounted ? (
                  <MobileNavItems
                    onLinkClick={() => setIsMobileMenuOpen(false)}
                  />
                ) : (
                  <div aria-hidden="true" />
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </nav>
  );
}

export default Navbar;
