import Link from "next/link";
import Container from "@/components/common/Container";
import { FooterLogo } from "@/components/common/Navbar/Logo";
import FooterItems from "@/components/common/Footer/FooterItems";
import {
  BsFacebook,
  BsInstagram,
  BsYoutube,
  BsLinkedin,
  BsTwitter,
} from "react-icons/bs";

interface FooterProps {
  className?: string;
}

const socialMediaLinks = [
  {
    title: "Facebook",
    icon: BsFacebook,
    link: "https://www.facebook.com/studylinker",
  },
  {
    title: "Instagram",
    icon: BsInstagram,
    link: "https://www.instagram.com/studylinker/",
  },
  {
    title: "Youtube",
    icon: BsYoutube,
    link: "https://www.youtube.com/@StudyLinker",
  },
  {
    title: "LinkedIn",
    icon: BsLinkedin,
    link: "https://www.linkedin.com/company/studylinker/",
  },
  {
    title: "Twitter",
    icon: BsTwitter,
    link: "https://twitter.com/studylinker",
  },
];

const Footer = ({ className }: FooterProps) => {
  return (
    <footer
      className={`w-full bg-lightGray2 transition-all duration-200 ${className}`}
    >
      <Container>
        <div className="border-b border-[#C7C7C7] border-solid">
          <div className="flex flex-col lg:flex-row lg:justify-between py-8 sm:py-10 lg:py-12 gap-8 lg:gap-10">
            <div className="w-full lg:w-3/12 flex flex-col items-center lg:items-start">
              <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 items-center lg:items-start">
                <FooterLogo />
                <p className="text-[#464646] text-[15px] md:text-base lg:text-xl leading-[142%] font-inter font-normal max-w-sm lg:max-w-xs text-center lg:text-left py-2 lg:py-3">
                  Connecting students and parents with qualified teachers
                  worldwide. Trust-first, parent-controlled tuition marketplace.
                </p>
                <div className="flex flex-row gap-6 sm:gap-8 lg:gap-3.5">
                  {socialMediaLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <Link
                        href={social.link}
                        key={index}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#464646] hover:text-indigo-600 transition-colors"
                        aria-label={social.title}
                      >
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-7 lg:h-7" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="w-full lg:w-9/12">
              <FooterItems />
            </div>
          </div>
        </div>
      </Container>

      <Container>
        <div className="pt-6 sm:pt-7 lg:pt-8 pb-6 sm:pb-7 lg:pb-9">
          <p className="w-full text-center text-[#464646] text-sm sm:text-base leading-4.75 font-inter font-normal">
            Copyright 2025 © StudyLinker Academy. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
};
export default Footer;
