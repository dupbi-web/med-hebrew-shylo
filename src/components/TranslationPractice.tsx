import { useState, useEffect, useCallback } from 'react';
import { Translation, Category } from '@/types/translation';
import RussianSentence from './RussianSentence';
import ProgressIndicator from './ProgressIndicator';
import TypingMetricsDisplay from './TypingMetricsDisplay';
import CharacterFeedback from './CharacterFeedback';
import WordFeedback from './WordFeedback';
import SessionResultsDashboard from './SessionResultsDashboard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, ArrowLeft, ArrowRight, BarChart3 } from 'lucide-react';
import { useTypingMetrics } from '@/hooks/useTypingMetrics';
import { useTranslationValidation } from '@/hooks/useTranslationValidation';
import { useSessionTracking } from '@/hooks/useSessionTracking';
import { useUserTypingProgress } from '@/hooks/useUserTypingProgress';
import { SessionSummary } from '@/types/sessionTracking';

interface TranslationPracticeProps {
  translations: Translation[];
  category: Category;
  onBack: () => void;
}

const TranslationPractice = ({ translations, category, onBack }: TranslationPracticeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [previousInputLength, setPreviousInputLength] = useState(0);

  const { metrics, recordKeystroke, resetMetrics, stopTracking } = useTypingMetrics();
  const { recordSentenceResult, generateSessionSummary, resetSession } = useSessionTracking(category);
  const { recordSession } = useUserTypingProgress();
  
  const currentTranslation = translations[currentIndex];
  const isLastSentence = currentIndex === translations.length - 1;
  
  const validation = useTranslationValidation(
    userInput,
    currentTranslation.target.sentence
  );

  useEffect(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
  }, [currentIndex]);

  const handleInputChange = useCallback((value: string) => {
    const isBackspace = value.length < previousInputLength;
    recordKeystroke(isBackspace, value.length);
    setPreviousInputLength(value.length);
    setUserInput(value);
    
    // Auto-show validation after typing starts
    if (value.length > 0 && !showValidation) {
      setShowValidation(true);
    }
  }, [previousInputLength, recordKeystroke, showValidation]);

  const handleNext = () => {
    stopTracking();
    
    // Record this sentence's result
    if (userInput.length > 0) {
      recordSentenceResult(currentTranslation, userInput, metrics, validation.accuracy);
    }
    
    if (isLastSentence) {
      const newCompletedCount = completedCount + 1;
      setCompletedCount(newCompletedCount);
      const summary = generateSessionSummary(translations, newCompletedCount);
      setSessionSummary(summary);
      // Persist to user progress
      recordSession(summary);
    } else {
      setCompletedCount(prev => prev + 1);
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setShowAnswer(false);
      setShowValidation(false);
      setPreviousInputLength(0);
      resetMetrics();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      stopTracking();
      setCurrentIndex(prev => prev - 1);
      setUserInput('');
      setShowAnswer(false);
      setShowValidation(false);
      setPreviousInputLength(0);
      resetMetrics();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserInput('');
    setShowAnswer(false);
    setShowValidation(false);
    setCompletedCount(0);
    setSessionSummary(null);
    setPreviousInputLength(0);
    resetMetrics();
    resetSession();
  };

  // Show session results dashboard when complete
  if (sessionSummary) {
    return (
      <SessionResultsDashboard
        summary={sessionSummary}
        onRestart={handleRestart}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowRight className="w-4 h-4" />
              <span className="hebrew-text">חזרה</span>
            </Button>
            <h1 className="text-lg font-semibold text-foreground hebrew-text">{category.name}</h1>
            <div className="w-20" />
          </div>
          <ProgressIndicator current={currentIndex + 1} total={translations.length} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-6 animate-fade-in" key={currentTranslation.id}>
          {/* Russian Sentence */}
          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <RussianSentence translation={currentTranslation} />
          </div>

          {/* Typing Metrics */}
          {metrics.startTime && (
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <TypingMetricsDisplay metrics={metrics} />
            </div>
          )}

          {/* User Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground hebrew-text">
              התרגום שלך לעברית:
            </label>
            <Textarea
              value={userInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="הקלד את התרגום שלך כאן..."
              className={cn(
                "min-h-[120px] text-lg hebrew-text resize-none transition-colors",
                userInput.length > 0 && validation.accuracy >= 80 && "border-success/50 focus-visible:ring-success/30",
                userInput.length > 0 && validation.accuracy >= 50 && validation.accuracy < 80 && "border-warning/50 focus-visible:ring-warning/30",
                userInput.length > 0 && validation.accuracy < 50 && "border-destructive/50 focus-visible:ring-destructive/30"
              )}
              dir="rtl"
            />
            
            {/* Character Feedback - only shows when answer is revealed */}
            {showAnswer && userInput.length > 0 && (
              <CharacterFeedback
                validations={validation.characterValidations}
                correctAnswer={currentTranslation.target.sentence}
                showFeedback={true}
              />
            )}
            
            {/* Word-level Feedback - only shows when answer is revealed */}
            {showAnswer && userInput.length > 0 && (
              <WordFeedback
                validations={validation.wordValidations}
                missingKeywords={validation.missingKeywords}
                accuracy={validation.wordAccuracy}
                showFeedback={true}
              />
            )}
          </div>

          {/* Correct Answer Section */}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => setShowAnswer(!showAnswer)}
              className="w-full gap-2"
            >
              {showAnswer ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span className="hebrew-text">הסתר תרגום</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="hebrew-text">הצג תרגום נכון</span>
                </>
              )}
            </Button>

            <div
              className={cn(
                'overflow-hidden transition-all duration-300',
                showAnswer ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <div className="bg-success/5 border border-success/20 rounded-xl p-6">
                <span className="text-xs font-medium text-success mb-2 block hebrew-text">
                  התרגום הנכון:
                </span>
                <p className="text-lg text-foreground hebrew-text">
                  {currentTranslation.target.sentence}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex-1"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              <span className="hebrew-text">הקודם</span>
            </Button>
            <Button onClick={handleNext} className="flex-1">
              <span className="hebrew-text">{isLastSentence ? 'סיום' : 'הבא'}</span>
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TranslationPractice;
