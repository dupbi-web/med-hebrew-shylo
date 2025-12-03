import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

export const LoadingState = ({
  message = "Loading...",
  className,
  size = "md",
}: LoadingStateProps) => {
  return (
    <div className={cn("text-center py-8", className)} aria-live="polite">
      <div className="animate-pulse space-y-4">
        <div className={cn(
          "bg-primary/20 rounded-full mx-auto",
          sizeClasses[size]
        )} />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export const LoadingSpinner = ({
  className,
  size = "md",
}: Omit<LoadingStateProps, "message">) => {
  return (
    <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
  );
};
