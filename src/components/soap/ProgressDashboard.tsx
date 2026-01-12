import { OverallProgress, SOAPSection } from "@/types/soapGame";
import { formatTime } from "@/utils/progressTracker";
import { getRecommendedSection, getTopErrors, getErrorTypeName } from "@/utils/recommendations";
import SectionProgressBar from "./SectionProgressBar";
import { Flame, Target, Clock, TrendingUp } from "lucide-react";

interface ProgressDashboardProps {
    progress: OverallProgress;
    onSectionClick?: (section: SOAPSection) => void;
}

export default function ProgressDashboard({ progress, onSectionClick }: ProgressDashboardProps) {
    const recommendation = getRecommendedSection(progress);
    const hasAnyProgress = progress.totalExercisesCompleted > 0;

    return (
        <div className="bg-card border rounded-2xl p-6 shadow-lg space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">📊 ההתקדמות שלך</h2>
                {!hasAnyProgress && (
                    <p className="text-sm text-muted-foreground">
                        התחל לתרגל כדי לראות את ההתקדמות שלך
                    </p>
                )}
            </div>

            {hasAnyProgress && (
                <>
                    {/* Overall Stats Row */}
                    <div className="grid grid-cols-3 gap-4" dir="rtl">
                        {/* Streak */}
                        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg p-3 text-center border border-orange-200/50">
                            <Flame className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                            <div className="text-2xl font-bold text-orange-600">
                                {progress.currentStreak}
                            </div>
                            <div className="text-xs text-muted-foreground">רצף ימים</div>
                        </div>

                        {/* Total exercises */}
                        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-3 text-center border border-blue-200/50">
                            <Target className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                            <div className="text-2xl font-bold text-blue-600">
                                {progress.totalExercisesCompleted}
                            </div>
                            <div className="text-xs text-muted-foreground">תרגילים</div>
                        </div>

                        {/* Total time */}
                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-3 text-center border border-purple-200/50">
                            <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                            <div className="text-2xl font-bold text-purple-600">
                                {formatTime(progress.totalTimeSpent)}
                            </div>
                            <div className="text-xs text-muted-foreground">זמן תרגול</div>
                        </div>
                    </div>

                    {/* Recommendation Card */}
                    <div
                        className={`rounded-lg p-4 border-2 ${recommendation.priority === "high"
                                ? "bg-yellow-50 border-yellow-300 dark:bg-yellow-950/20"
                                : "bg-blue-50 border-blue-300 dark:bg-blue-950/20"
                            }`}
                        dir="rtl"
                    >
                        <div className="flex items-start gap-3">
                            <TrendingUp
                                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${recommendation.priority === "high"
                                        ? "text-yellow-600"
                                        : "text-blue-600"
                                    }`}
                            />
                            <div className="flex-1">
                                <div className="font-semibold text-sm mb-1">💡 המלצה לתרגול:</div>
                                <div className="text-sm text-foreground/90">
                                    {recommendation.reason}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Section Progress Bars */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground text-right">
                    התקדמות לפי חלק:
                </h3>
                {(Object.entries(progress.sectionStats) as [SOAPSection, any][]).map(
                    ([section, stats]) => (
                        <SectionProgressBar
                            key={section}
                            stats={stats}
                            onClick={() => onSectionClick?.(section)}
                        />
                    )
                )}
            </div>

            {/* Top Errors for Recommended Section */}
            {hasAnyProgress && recommendation.section && (
                <>
                    {(() => {
                        const sectionStats = progress.sectionStats[recommendation.section];
                        const topErrors = getTopErrors(sectionStats, 3);

                        if (topErrors.length > 0) {
                            return (
                                <div className="bg-muted/50 rounded-lg p-4" dir="rtl">
                                    <h3 className="text-sm font-semibold mb-2">
                                        ⚠️ שגיאות נפוצות ב-{recommendation.section}:
                                    </h3>
                                    <ul className="space-y-1 text-sm text-muted-foreground">
                                        {topErrors.map((error, idx) => (
                                            <li key={idx} className="flex justify-between">
                                                <span>
                                                    {getErrorTypeName(error.type)} ({error.count})
                                                </span>
                                                <span className="text-xs">
                                                    {Math.round(error.percentage)}%
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </>
            )}
        </div>
    );
}
