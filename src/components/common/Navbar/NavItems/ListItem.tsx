import Link from "next/link";
import { cn } from "@/lib/utils";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";

interface ListItemProps extends React.ComponentPropsWithoutRef<"li"> {
  href: string;
  title: string;
  titleClassName?: string;
  descriptionClassName?: string;
  className?: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

function ListItem({
  title,
  children,
  href,
  titleClassName,
  descriptionClassName,
  Icon,
  className,
  ...props
}: ListItemProps) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-[8px] p-3 leading-none no-underline outline-none transition-colors hover:bg-white hover:shadow-sm hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
        >
          <div className="flex flex-row gap-4">
            <div className="w-[12%] pt-1">
              <div className="w-8 h-8 bg-navIconBackground rounded-[3px] flex justify-center items-center">
                <Icon className="!w-5 !h-5 text-[#242424]" />
              </div>
            </div>
            <div className="w-[88%] flex flex-col gap-1">
              <div
                className={cn(
                  "line-clamp-1 font-inter font-semibold text-base leading-[142%] tracking-[0%] text-[#222222]",
                  titleClassName
                )}
              >
                {title}
              </div>
              <p
                className={cn(
                  "line-clamp-2 font-inter font-normal text-sm leading-[142%] tracking-[0%] text-[#515151]",
                  descriptionClassName
                )}
              >
                {children}
              </p>
            </div>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
export default ListItem;
