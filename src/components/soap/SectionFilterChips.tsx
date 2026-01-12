import { SOAPSection, FilterMode } from "@/types/soapGame";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SectionFilterChipsProps {
    selectedFilter: FilterMode;
    onFilterChange: (filter: FilterMode) => void;
    exerciseCounts: Record<FilterMode, number>;
}

const SECTION_LABELS: Record<FilterMode, { label: string; full: string }> = {
    all: { label: "הכל", full: "כל החלקים" },
    Subjective: { label: "S", full: "Subjective" },
    Objective: { label: "O", full: "Objective" },
    Assessment: { label: "A", full: "Assessment" },
    Plan: { label: "P", full: "Plan" },
};

export default function SectionFilterChips({
    selectedFilter,
    onFilterChange,
    exerciseCounts,
}: SectionFilterChipsProps) {
    const filters: FilterMode[] = ["all", "Subjective", "Objective", "Assessment", "Plan"];

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground text-center">
                בחר חלק לתרגול:
            </h3>
            <div className="flex flex-wrap gap-2 justify-center" dir="ltr">
                {filters.map((filter) => {
                    const isSelected = selectedFilter === filter;
                    const count = exerciseCounts[filter] || 0;
                    const { label, full } = SECTION_LABELS[filter];

                    return (
                        <button
                            key={filter}
                            onClick={() => onFilterChange(filter)}
                            className={cn(
                                "group relative px-4 py-2 rounded-lg border-2 transition-all",
                                "hover:scale-105 active:scale-95",
                                isSelected
                                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                                    : "border-border bg-card hover:border-primary/50"
                            )}
                            disabled={count === 0}
                        >
                            <div className="flex flex-col items-center gap-1">
                                <span className={cn(
                                    "text-lg font-bold",
                                    isSelected ? "text-primary-foreground" : "text-foreground"
                                )}>
                                    {label}
                                </span>
                                <span className={cn(
                                    "text-xs",
                                    isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                                )}>
                                    {count} תרגילים
                                </span>
                            </div>

                            {/* Tooltip on hover */}
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg border">
                                {full}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
