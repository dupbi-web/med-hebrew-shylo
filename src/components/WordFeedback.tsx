import { WordValidation } from '@/hooks/useTranslationValidation';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface WordFeedbackProps {
  validations: WordValidation[];
  missingKeywords: string[];
  accuracy: number;
  showFeedback: boolean;
}

const WordFeedback = ({ validations, missingKeywords, accuracy, showFeedback }: WordFeedbackProps) => {
  if (!showFeedback || validations.length === 0) {
    return null;
  }

  const correctCount = validations.filter(v => v.status === 'correct').length;
  const synonymCount = validations.filter(v => v.status === 'synonym').length;
  const incorrectCount = validations.filter(v => v.status === 'incorrect').length;

  return (
    <div className="mt-3 p-4 rounded-lg bg-muted/30 border border-border space-y-3">
      {/* Accuracy Score */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground hebrew-text">דיוק מילים:</span>
        <span className={cn(
          "text-sm font-bold px-2 py-0.5 rounded-full",
          accuracy >= 80 && "text-success bg-success/10",
          accuracy >= 50 && accuracy < 80 && "text-warning bg-warning/10",
          accuracy < 50 && "text-destructive bg-destructive/10"
        )}>
          {accuracy}%
        </span>
      </div>

      {/* Word Status Summary */}
      <div className="flex flex-wrap gap-2 text-xs">
        {correctCount > 0 && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success">
            <CheckCircle className="w-3 h-3" />
            <span>{correctCount} נכון</span>
          </span>
        )}
        {synonymCount > 0 && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary">
            <RefreshCw className="w-3 h-3" />
            <span>{synonymCount} מילים נרדפות</span>
          </span>
        )}
        {incorrectCount > 0 && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="w-3 h-3" />
            <span>{incorrectCount} שגוי</span>
          </span>
        )}
      </div>

      {/* Word-by-word breakdown */}
      <div className="flex flex-wrap gap-1.5" dir="rtl">
        {validations.map((v, i) => (
          <span
            key={i}
            className={cn(
              "px-2 py-0.5 rounded text-sm hebrew-text",
              v.status === 'correct' && "bg-success/10 text-success",
              v.status === 'synonym' && "bg-primary/10 text-primary",
              v.status === 'incorrect' && "bg-destructive/10 text-destructive"
            )}
            title={v.matchedWith ? `התאמה ל: ${v.matchedWith}` : undefined}
          >
            {v.word}
            {v.status === 'synonym' && (
              <span className="text-xs opacity-70 mr-1">≈</span>
            )}
          </span>
        ))}
      </div>

      {/* Missing Keywords */}
      {missingKeywords.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground hebrew-text">מילים חסרות: </span>
          <span className="text-xs text-warning hebrew-text">
            {missingKeywords.join(', ')}
          </span>
        </div>
      )}
    </div>
  );
};

export default WordFeedback;
