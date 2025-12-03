import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  actions?: ReactNode;
  className?: string;
  centered?: boolean;
}

export const PageHeader = ({
  title,
  subtitle,
  actions,
  className,
  centered = true,
}: PageHeaderProps) => {
  return (
    <header
      className={cn(
        "space-y-4",
        centered && "text-center",
        className
      )}
    >
      <div className={cn(
        "flex items-center gap-4",
        centered && "justify-center"
      )}>
        {typeof title === "string" ? (
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
        ) : (
          title
        )}
        {actions}
      </div>
      {subtitle && (
        <div>
          {typeof subtitle === "string" ? (
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          ) : (
            subtitle
          )}
        </div>
      )}
    </header>
  );
};
