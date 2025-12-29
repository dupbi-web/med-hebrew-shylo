import { BackStory, SOAPSection } from "@/types/soapGame";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface BackStoryDisplayProps {
    soapSection: SOAPSection;
    backStory: BackStory;
    taskInstruction: string;
    allowToggle?: boolean;
}

const SOAP_SECTION_COLORS: Record<SOAPSection, string> = {
    Subjective: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Objective: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Assessment: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    Plan: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

const SOAP_SECTION_HEBREW: Record<SOAPSection, string> = {
    Subjective: "סובייקטיבי (Subjective)",
    Objective: "אובייקטיבי (Objective)",
    Assessment: "הערכה (Assessment)",
    Plan: "תוכנית (Plan)",
};

export default function BackStoryDisplay({
    soapSection,
    backStory,
    taskInstruction,
    allowToggle = false,
}: BackStoryDisplayProps) {
    const [isVisible, setIsVisible] = useState(true);

    return (
        <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${SOAP_SECTION_COLORS[soapSection]}`}
                        >
                            {SOAP_SECTION_HEBREW[soapSection]}
                        </span>
                    </div>
                    {allowToggle && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsVisible(!isVisible)}
                            className="mb-2"
                        >
                            {isVisible ? (
                                <>
                                    <EyeOff className="w-4 h-4 ml-2" />
                                    <span>הסתר רקע</span>
                                </>
                            ) : (
                                <>
                                    <Eye className="w-4 h-4 ml-2" />
                                    <span>הצג רקע</span>
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {isVisible && (
                <>
                    <div className="prose prose-sm dark:prose-invert max-w-none mb-4" dir="rtl">
                        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                            {backStory.text.map((paragraph, index) => (
                                <p key={index} className="text-foreground leading-relaxed mb-2">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-primary/5 border-r-4 border-primary rounded" dir="rtl">
                        <p className="text-sm font-medium text-foreground">{taskInstruction}</p>
                    </div>
                </>
            )}
        </div>
    );
}
