"use client";

import { BsAward, BsStarFill, BsRocket, BsShieldCheck } from "react-icons/bs";

export const BADGE_TYPES = {
  TOP_RATED: "Top Rated",
  RISING_TALENT: "Rising Talent",
  VERIFIED: "Verified",
  NEW: "New",
} as const;

export type BadgeType = (typeof BADGE_TYPES)[keyof typeof BADGE_TYPES];

interface BadgeProps {
  type: BadgeType;
  className?: string;
}

const badgeConfig = {
  [BADGE_TYPES.TOP_RATED]: {
    icon: BsStarFill,
    bgColor: "bg-gradient-to-r from-yellow-400 to-orange-500",
    textColor: "text-white",
    iconColor: "text-yellow-200",
    label: "Top Rated",
  },
  [BADGE_TYPES.RISING_TALENT]: {
    icon: BsRocket,
    bgColor: "bg-gradient-to-r from-indigo-500 to-purple-600",
    textColor: "text-white",
    iconColor: "text-indigo-200",
    label: "Rising Talent",
  },
  [BADGE_TYPES.VERIFIED]: {
    icon: BsShieldCheck,
    bgColor: "bg-gradient-to-r from-green-500 to-emerald-600",
    textColor: "text-white",
    iconColor: "text-green-200",
    label: "Verified",
  },
  [BADGE_TYPES.NEW]: {
    icon: BsAward,
    bgColor: "bg-gradient-to-r from-blue-500 to-cyan-600",
    textColor: "text-white",
    iconColor: "text-blue-200",
    label: "New",
  },
};

export default function Badge({ type, className = "" }: BadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${config.bgColor} ${config.textColor} shadow-md ring-2 ring-white ${className}`}
      title={config.label}
    >
      <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
    </div>
  );
}

