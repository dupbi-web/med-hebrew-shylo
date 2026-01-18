import { useState, useEffect } from 'react';
import { SessionSummary } from '@/types/sessionTracking';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  RotateCcw, 
  ArrowRight,
  Zap,
  Target,
  Clock,
  Keyboard,
  AlertTriangle,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface SessionResultsDashboardProps {
  summary: SessionSummary;
  onRestart: () => void;
  onBack: () => void;
  onTargetedPractice?: () => void;
}

const SessionResultsDashboard = ({ 
  summary, 
  onRestart, 
  onBack,
  onTargetedPractice 
}: SessionResultsDashboardProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  const { overallMetrics, problemWords, trend, completedSentences, totalSentences } = summary;
  const accuracy = overallMetrics.averageAccuracy;

  // Determine score color
  const getScoreColor = () => {
    if (accuracy >= 85) return 'text-success';
    if (accuracy >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBgColor = () => {
    if (accuracy >= 85) return 'bg-success/10 border-success/20';
    if (accuracy >= 70) return 'bg-warning/10 border-warning/20';
    return 'bg-destructive/10 border-destructive/20';
  };

  // Trigger animations
  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 100);
    if (accuracy >= 90) {
      setTimeout(() => setShowConfetti(true), 500);
    }
  }, [accuracy]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getMotivationalMessage = () => {
    if (accuracy >= 90) return 'מצוין! מוכן לקטגוריה הבאה?';
    if (accuracy >= 80) return 'עבודה נהדרת! המשך כך!';
    if (accuracy >= 70) return 'טוב מאוד! תרגול נוסף ישפר את הדיוק';
    return 'אל תתייאש! תרגול עושה מושלם';
  };

  const getRecommendation = () => {
    if (accuracy >= 90) {
      return { text: 'קטגוריה חדשה', icon: ChevronRight, action: onBack };
    }
    if (problemWords.length > 0) {
      return { text: 'תרגול ממוקד', icon: Target, action: onTargetedPractice || onRestart };
    }
    return { text: 'שפר את הדיוק', icon: RotateCcw, action: onRestart };
  };

  const recommendation = getRecommendation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            >
              <Sparkles className="w-6 h-6 text-warning" />
            </div>
          ))}
        </div>
      )}

      <div className={cn(
        "max-w-lg w-full space-y-6 transition-all duration-500",
        animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        {/* Score Card */}
        <div className={cn(
          "rounded-2xl p-8 border-2 text-center transition-all duration-300",
          getScoreBgColor()
        )}>
          {accuracy >= 90 && (
            <div className="flex justify-center mb-4">
              <Trophy className="w-12 h-12 text-warning animate-bounce" />
            </div>
          )}
          
          <div className={cn("text-6xl font-bold mb-2", getScoreColor())}>
            {accuracy}%
          </div>
          <div className="text-muted-foreground hebrew-text mb-4">דיוק כללי</div>
          
          <div className="flex items-center justify-center gap-2 text-sm">
            {getTrendIcon()}
            <span className="hebrew-text text-muted-foreground">
              {trend === 'improving' ? 'במגמת שיפור' : trend === 'declining' ? 'דורש תרגול' : 'יציב'}
            </span>
          </div>
        </div>

        {/* Progress Ring & Stats */}
        <div className="grid grid-cols-2 gap-4">
          {/* Progress */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground hebrew-text">התקדמות</span>
            </div>
            <div className="relative w-20 h-20 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="6"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="6"
                  strokeDasharray={`${(completedSentences / totalSentences) * 220} 220`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{completedSentences}/{totalSentences}</span>
              </div>
            </div>
          </div>

          {/* Speed Stats */}
          <div className="bg-card rounded-xl p-4 border border-border space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground hebrew-text">מהירות</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground hebrew-text">מ/ד</span>
                <span className="font-bold text-primary">{overallMetrics.averageWpm}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground hebrew-text">ת/ד</span>
                <span className="font-medium">{overallMetrics.averageCpm}</span>
              </div>
              <div className="flex justify-between items-center">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm">{formatTime(overallMetrics.totalTimeSeconds)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Heatmap */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Keyboard className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground hebrew-text">ביצועים לפי משפט</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {summary.sentenceResults.map((result, i) => (
              <div
                key={i}
                className={cn(
                  "w-6 h-6 rounded-sm transition-colors",
                  result.metrics.accuracy >= 85 && "bg-success",
                  result.metrics.accuracy >= 70 && result.metrics.accuracy < 85 && "bg-warning",
                  result.metrics.accuracy < 70 && "bg-destructive"
                )}
                title={`משפט ${i + 1}: ${result.metrics.accuracy}%`}
              />
            ))}
          </div>
        </div>

        {/* Problem Words */}
        {problemWords.length > 0 && (
          <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium hebrew-text">
                {problemWords.length} מילים דורשות תרגול נוסף
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {problemWords.slice(0, 5).map((word, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-background border border-warning/30 text-sm"
                >
                  <span className="font-medium">{word.russian}</span>
                  <span className="mx-1 text-muted-foreground">→</span>
                  <span className="hebrew-text">{word.hebrew}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Motivational Message */}
        <div className="text-center py-2">
          <p className="text-lg font-medium hebrew-text">{getMotivationalMessage()}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary Recommendation */}
          <Button 
            onClick={recommendation.action} 
            className="w-full gap-2 animate-pulse hover:animate-none" 
            size="lg"
          >
            <recommendation.icon className="w-5 h-5" />
            <span className="hebrew-text">{recommendation.text}</span>
          </Button>

          {/* Secondary Actions */}
          <div className="flex gap-3">
            <Button onClick={onRestart} variant="outline" className="flex-1 gap-2">
              <RotateCcw className="w-4 h-4" />
              <span className="hebrew-text">התחל מחדש</span>
            </Button>
            <Button onClick={onBack} variant="outline" className="flex-1 gap-2">
              <ArrowRight className="w-4 h-4" />
              <span className="hebrew-text">קטגוריות</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionResultsDashboard;
