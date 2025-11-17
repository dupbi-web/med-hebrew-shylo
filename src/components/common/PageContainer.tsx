import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "full";
  className?: string;
  padding?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "6xl": "max-w-6xl",
  full: "max-w-full",
};

export const PageContainer = ({
  children,
  maxWidth = "6xl",
  className,
  padding = true,
}: PageContainerProps) => {
  return (
    <div
      className={cn(
        "container mx-auto",
        maxWidthClasses[maxWidth],
        padding && "px-4 py-8 md:py-12",
        className
      )}
    >
      {children}
    </div>
  );
};
