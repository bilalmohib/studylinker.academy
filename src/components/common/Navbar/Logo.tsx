"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

interface LogoProps {
  onClick?: () => void;
}

const Logo = ({ onClick }: LogoProps = {}) => {
  const router = useRouter();

  return (
    <div
      className="cursor-pointer flex items-center gap-2"
      onClick={() => {
        router.push("/");
        onClick?.();
      }}
    >
      <Image
        src="/logo-icon.svg"
        alt="StudyLinker Logo"
        width={32}
        height={32}
        className="w-7 h-7 sm:w-8 sm:h-8"
        priority
      />
      <span className="font-fredoka text-xl sm:text-2xl font-bold leading-none tracking-[0.09em] text-gray-900">
        Study<span className="text-indigo-600">Linker</span>
      </span>
    </div>
  );
};

export const FooterLogo = () => {
  const router = useRouter();

  return (
    <div
      className="cursor-pointer flex items-center gap-3"
      onClick={() => {
        router.push("/");
      }}
    >
      <Image
        src="/logo-icon.svg"
        alt="StudyLinker Logo"
        width={40}
        height={40}
        className="w-10 h-10"
        priority
      />
      <span className="font-fredoka text-4xl font-semibold leading-11 tracking-[0.09em] text-black">
        Study<span className="text-indigo-600">Linker</span>
      </span>
    </div>
  );
};

export default Logo;
