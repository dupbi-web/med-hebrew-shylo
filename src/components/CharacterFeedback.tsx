import { CharacterValidation } from '@/hooks/useTranslationValidation';
import { cn } from '@/lib/utils';

interface CharacterFeedbackProps {
  validations: CharacterValidation[];
  correctAnswer: string;
  showFeedback: boolean;
}

const CharacterFeedback = ({ validations, correctAnswer, showFeedback }: CharacterFeedbackProps) => {
  if (!showFeedback || validations.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 p-4 rounded-lg bg-muted/30 border border-border">
      <div className="text-xs text-muted-foreground mb-2 hebrew-text">השוואה תו-לתו:</div>
      <div className="flex flex-wrap gap-0.5 text-lg font-mono" dir="rtl">
        {validations.map((v, i) => (
          <span
            key={i}
            className={cn(
              "px-0.5 rounded transition-colors",
              v.status === 'correct' && "text-success bg-success/10",
              v.status === 'incorrect' && "text-destructive bg-destructive/10 underline decoration-wavy",
              v.status === 'extra' && "text-warning bg-warning/10 line-through"
            )}
          >
            {v.char === ' ' ? '\u00A0' : v.char}
          </span>
        ))}
        {/* Show remaining correct chars as pending */}
        {correctAnswer.slice(validations.length).split('').map((char, i) => (
          <span
            key={`pending-${i}`}
            className="px-0.5 text-muted-foreground/40"
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CharacterFeedback;
