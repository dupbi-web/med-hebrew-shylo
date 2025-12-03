import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface CategoryCardProps {
  title: string;
  description?: string;
  progress?: number;
  icon?: LucideIcon;
  onClick?: () => void;
  badge?: ReactNode;
  locked?: boolean;
}

export const CategoryCard = ({
  title,
  description,
  progress,
  icon: Icon,
  onClick,
  badge,
  locked,
}: CategoryCardProps) => {
  return (
    <Card
      onClick={locked ? undefined : onClick}
      className={`
        transition-all
        ${onClick && !locked ? "cursor-pointer hover:shadow-elegant hover:border-primary/50" : ""}
        ${locked ? "opacity-60 cursor-not-allowed" : ""}
      `}
    >
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5" />}
            {title}
          </div>
          {badge}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {progress !== undefined && (
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      )}
    </Card>
  );
};
