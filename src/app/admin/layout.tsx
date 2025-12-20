"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarItem,
} from "@/components/ui/sidebar";
import {
  BsGrid3X3Gap,
  BsPeople,
  BsEnvelope,
  BsBriefcase,
  BsGear,
  BsBarChart,
  BsShieldCheck,
} from "react-icons/bs";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { getCurrentUserProfile } from "@/actions/users/actions";

const menuItems = [
  {
    title: "Dashboard",
    icon: BsGrid3X3Gap,
    href: "/admin",
  },
  {
    title: "Teacher Applications",
    icon: BsPeople,
    href: "/admin/teacher-applications",
  },
  {
    title: "Contact Submissions",
    icon: BsEnvelope,
    href: "/admin/contacts",
  },
  {
    title: "Job Postings",
    icon: BsBriefcase,
    href: "/admin/jobs",
  },
  {
    title: "Users",
    icon: BsShieldCheck,
    href: "/admin/users",
  },
  {
    title: "Reports",
    icon: BsBarChart,
    href: "/admin/reports",
  },
  {
    title: "Settings",
    icon: BsGear,
    href: "/admin/settings",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      router.push("/sign-in");
      return;
    }

    const checkAdmin = async () => {
      try {
        const result = await getCurrentUserProfile();
        if (result.success && "data" in result) {
          const userData = (result as { success: true; data: { isAdmin?: boolean } }).data;
          if (!userData) {
            toast.error("User profile not found");
            router.push("/");
            return;
          }
          if (userData.isAdmin === true) {
            setIsAdmin(true);
          } else {
            toast.error("Access denied. Admin privileges required.");
            router.push("/");
          }
        } else {
          toast.error("User profile not found");
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast.error("An error occurred");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [userId, isLoaded, router]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar className="hidden md:flex">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
              SL
            </div>
            <span className="font-bold text-lg text-gray-900">Admin Panel</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <SidebarItem active={isActive}>
                    <Icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </SidebarItem>
                </Link>
              );
            })}
          </nav>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Admin
              </p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg text-gray-900">Admin Panel</span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div className="md:hidden bg-white border-b px-4 py-2 overflow-x-auto">
          <div className="flex gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-indigo-50">
          {children}
        </main>
      </div>
    </div>
  );
}


