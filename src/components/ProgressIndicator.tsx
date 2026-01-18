import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  className?: string;
}

const ProgressIndicator = ({ current, total, className }: ProgressIndicatorProps) => {
  const progress = (current / total) * 100;

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-sm font-medium text-muted-foreground min-w-[60px] text-center hebrew-text">
        {current} / {total}
      </span>
    </div>
  );
};

export default ProgressIndicator;
