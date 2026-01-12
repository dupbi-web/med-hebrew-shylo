import { SectionStats, SOAPSection } from "@/types/soapGame";
import { formatRelativeTime } from "@/utils/progressTracker";
import { getPerformanceLevel } from "@/utils/recommendations";
import { cn } from "@/lib/utils";

interface SectionProgressBarProps {
    stats: SectionStats;
    onClick?: () => void;
}

const SECTION_LABELS: Record<SOAPSection, { short: string; full: string }> = {
    Subjective: { short: "S", full: "Subjective" },
    Objective: { short: "O", full: "Objective" },
    Assessment: { short: "A", full: "Assessment" },
    Plan: { short: "P", full: "Plan" },
};

export default function SectionProgressBar({ stats, onClick }: SectionProgressBarProps) {
    const { short, full } = SECTION_LABELS[stats.section];
    const performance = getPerformanceLevel(stats.successRate);

    // Determine progress bar color based on success rate
    const progressColor =
        stats.successRate >= 80
            ? "bg-green-500"
            : stats.successRate >= 60
                ? "bg-yellow-500"
                : "bg-orange-500";

    const textColor =
        stats.successRate >= 80
            ? "text-green-600"
            : stats.successRate >= 60
                ? "text-yellow-600"
                : "text-orange-600";

    const displaySuccessRate = stats.totalAttempts > 0 ? Math.round(stats.successRate) : 0;
    const displayAvgTime = stats.totalAttempts > 0 ? Math.round(stats.averageTime) : 0;

    return (
        <button
            onClick={onClick}
            className="w-full text-right hover:bg-accent/50 p-4 rounded-lg transition-colors group"
            disabled={stats.totalAttempts === 0}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex gap-4 items-center">
                    {/* Average time */}
                    {stats.totalAttempts > 0 && (
                        <span className="text-sm text-muted-foreground">
                            ⏱️ {displayAvgTime}s
                        </span>
                    )}

                    {/* Success rate with performance indicator */}
                    {stats.totalAttempts > 0 ? (
                        <div className="flex items-center gap-2">
                            <span className={cn("text-sm font-bold", textColor)}>
                                {displaySuccessRate}%
                            </span>
                            <span className="text-xs">{performance.message}</span>
                        </div>
                    ) : (
                        <span className="text-sm text-muted-foreground">לא תורגל</span>
                    )}
                </div>

                {/* Section name */}
                <div className="flex items-center gap-2">
                    <span className="font-medium">{full}</span>
                    <span className="text-lg font-bold text-primary/80 bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                        {short}
                    </span>
                </div>
            </div>

            {/* Progress bar */}
            {stats.totalAttempts > 0 && (
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-2">
                    <div
                        className={cn("h-full transition-all duration-500", progressColor)}
                        style={{ width: `${stats.successRate}%` }}
                    />
                </div>
            )}

            {/* Additional info */}
            <div className="flex justify-between text-xs text-muted-foreground">
                <div className="flex gap-3">
                    {stats.lastPracticed && (
                        <span>תרגול אחרון: {formatRelativeTime(stats.lastPracticed)}</span>
                    )}
                </div>
                <span>{stats.totalAttempts} ניסיונות</span>
            </div>

            {/* Hover effect hint */}
            {onClick && stats.totalAttempts > 0 && (
                <div className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                    לחץ לתרגול חלק זה →
                </div>
            )}
        </button>
    );
}
