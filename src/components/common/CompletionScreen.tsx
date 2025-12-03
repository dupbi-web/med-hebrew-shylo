import { Button } from "@/components/ui/button";
import { PageContainer } from "./PageContainer";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CompletionScreenProps {
  emoji?: string;
  title: string;
  description?: string | ReactNode;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export const CompletionScreen = ({
  emoji = "🎉",
  title,
  description,
  onAction,
  actionLabel = "Continue",
  className,
}: CompletionScreenProps) => {
  return (
    <PageContainer maxWidth="2xl" className={cn("text-center space-y-6", className)}>
      <div className="text-6xl mb-4" aria-hidden="true">
        {emoji}
      </div>
      <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
      {description && (
        <div className="text-lg text-muted-foreground">
          {typeof description === "string" ? <p>{description}</p> : description}
        </div>
      )}
      {onAction && (
        <Button onClick={onAction} size="lg" className="mt-6">
          {actionLabel}
        </Button>
      )}
    </PageContainer>
  );
};
