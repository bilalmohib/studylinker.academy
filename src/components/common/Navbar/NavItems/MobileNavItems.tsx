"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { menuItems } from "@/components/common/Navbar/NavItems/data";
import { Paragraph } from "../../Typography";
import { ChevronDown } from "lucide-react";

interface MobileNavItemsProps {
  onLinkClick: () => void;
}

function MobileNavItems({ onLinkClick }: MobileNavItemsProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isParentActive = (item: typeof menuItems[0]) => {
    if (item.hasDropdown && item.items) {
      return item.items.some((subItem) => isActive(subItem.href));
    }
    return isActive(item.href);
  };

  return (
    <nav aria-label="Mobile navigation" className="w-full">
      <AccordionPrimitive.Root type="single" collapsible className="w-full">
        <ul className="flex flex-col">
          {menuItems.map((item) => {
            const parentActive = isParentActive(item);
            
            return (
              <li key={item.title} className="list-none">
                {item.hasDropdown ? (
                  <AccordionPrimitive.Item
                    value={item.title}
                    className="group border-b last:border-b-0"
                  >
                  <AccordionPrimitive.Header className="flex">
                    <AccordionPrimitive.Trigger
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-base font-medium tracking-[0.02em] outline-none transition-all hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-secondary data-[state=open]:border data-[state=open]:border-border data-[state=open]:shadow-sm`}
                    >
                      <Paragraph className={`text-left ${
                        parentActive
                          ? "!text-primary"
                          : "!text-[#414141] group-data-[state=open]:!text-primary"
                      }`}>{item.title}</Paragraph>
                      <ChevronDown
                        className={`ml-2 h-6 w-6 shrink-0 transition-transform group-data-[state=open]:rotate-180 ${
                          parentActive
                            ? "!text-primary"
                            : "!text-[#414141] group-data-[state=open]:!text-primary"
                        }`}
                        aria-hidden="true"
                      />
                    </AccordionPrimitive.Trigger>
                  </AccordionPrimitive.Header>
                  <AccordionPrimitive.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
                    <div className="mx-1 rounded-lg border border-border bg-card shadow-sm">
                      <ul className="pl-4 pr-1 pb-2 pt-2 space-y-1">
                        {item.items?.map((subItem) => (
                          <li key={subItem.title} className="list-none">
                            <Link
                              href={subItem.href}
                              onClick={onLinkClick}
                              aria-current={
                                isActive(subItem.href) ? "page" : undefined
                              }
                              className={`block rounded-md px-2 py-2 text-sm tracking-[0.02em] transition-colors outline-none border focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                                isActive(subItem.href)
                                  ? "!bg-secondary font-medium border-border"
                                  : "hover:!bg-secondary/60 !border-transparent"
                              }`}
                            >
                              <Paragraph className={`text-left ${
                                isActive(subItem.href)
                                  ? "!text-primary"
                                  : "!text-[#414141] hover:!text-primary"
                              }`}>
                                {subItem.title}
                              </Paragraph>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AccordionPrimitive.Content>
                </AccordionPrimitive.Item>
              ) : (
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block w-full rounded-md px-3 py-3 text-base font-medium tracking-[0.02em] transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50`}
                >
                  <Paragraph className={`text-left ${
                    isActive(item.href)
                      ? "!text-primary"
                      : "!text-[#414141] hover:!text-primary"
                  }`}>{item.title}</Paragraph>
                </Link>
              )}
            </li>
          )})}
        </ul>
      </AccordionPrimitive.Root>
    </nav>
  );
}

export default MobileNavItems;
