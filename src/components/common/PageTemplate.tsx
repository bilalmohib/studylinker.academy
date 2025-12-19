import { ReactNode } from "react";
import Container from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageTemplateProps {
  title: string;
  description: string;
  children: ReactNode;
  cta?: {
    text: string;
    href: string;
    variant?: "default" | "outline";
  };
}

export default function PageTemplate({
  title,
  description,
  children,
  cta,
}: PageTemplateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <Container>
        <div className="py-12 sm:py-16 lg:py-20">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {title}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
            {cta && (
              <div className="mt-8">
                <Button
                  asChild
                  size="lg"
                  variant={cta.variant || "default"}
                  className={
                    cta.variant === "outline"
                      ? "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-6 text-lg rounded-full"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-xl"
                  }
                >
                  <Link href={cta.href}>{cta.text}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto">{children}</div>
        </div>
      </Container>
    </div>
  );
}

