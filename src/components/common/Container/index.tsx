import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Container = ({ children, className }: ContainerProps) => {
  return (
    <div
      className={cn(
        "max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 xl:px-12 xxlg:px-0",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;
