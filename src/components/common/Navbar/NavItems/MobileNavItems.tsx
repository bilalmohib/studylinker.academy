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
        <ul className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const parentActive = isParentActive(item);
            
            return (
              <li key={item.title} className="list-none">
                {item.hasDropdown ? (
                  <AccordionPrimitive.Item
                    value={item.title}
                    className="group border-b border-gray-200 last:border-b-0"
                  >
                  <AccordionPrimitive.Header className="flex">
                    <AccordionPrimitive.Trigger
                      className={`flex w-full items-center justify-between rounded-lg px-4 py-3.5 text-base font-semibold tracking-[0.02em] outline-none transition-all hover:text-primary hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary/50 data-[state=open]:bg-gray-50 data-[state=open]:text-primary`}
                    >
                      <Paragraph className={`text-left ${
                        parentActive
                          ? "!text-primary"
                          : "!text-[#414141] group-data-[state=open]:!text-primary"
                      }`}>{item.title}</Paragraph>
                      <ChevronDown
                        className={`ml-2 h-5 w-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180 ${
                          parentActive
                            ? "!text-primary"
                            : "!text-[#414141] group-data-[state=open]:!text-primary"
                        }`}
                        aria-hidden="true"
                      />
                    </AccordionPrimitive.Trigger>
                  </AccordionPrimitive.Header>
                  <AccordionPrimitive.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
                    <div className="px-4 pb-3 pt-1">
                      <ul className="space-y-1">
                        {item.items?.map((subItem) => (
                          <li key={subItem.title} className="list-none">
                            <Link
                              href={subItem.href}
                              onClick={onLinkClick}
                              aria-current={
                                isActive(subItem.href) ? "page" : undefined
                              }
                              className={`block rounded-lg px-4 py-2.5 text-sm font-medium tracking-[0.02em] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                                isActive(subItem.href)
                                  ? "!bg-indigo-50 !text-primary font-semibold"
                                  : "!text-[#414141] hover:!bg-gray-50 hover:!text-primary"
                              }`}
                            >
                              <Paragraph className={`text-left ${
                                isActive(subItem.href)
                                  ? "!text-primary"
                                  : "!text-[#414141]"
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
                  className={`block w-full rounded-lg px-4 py-3.5 text-base font-semibold tracking-[0.02em] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/50 hover:bg-gray-50 active:bg-gray-100 ${
                    isActive(item.href) ? "!text-primary" : "!text-[#414141] hover:!text-primary"
                  }`}
                >
                  <Paragraph className={`text-left ${
                    isActive(item.href)
                      ? "!text-primary"
                      : "!text-[#414141]"
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
