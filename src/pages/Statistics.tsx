import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useUserTypingProgress } from '@/hooks/useUserTypingProgress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Flame,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Trophy,
  Zap,
  BookOpen,
  GraduationCap,
  Award,
  ChevronRight,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { startOfWeek, startOfMonth, isAfter, subWeeks, subMonths, parseISO, differenceInDays } from 'date-fns';

const Statistics = () => {
  const navigate = useNavigate();
  const { progress } = useUserTypingProgress();

  const { lifetimeMetrics, currentStreak, longestStreak, totalPracticeMinutes, categoryStats, problemWords, achievements, sessionHistory, personalRecords } = progress;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}.${Math.round(mins / 6)} שעות`;
    }
    return `${mins} דקות`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 85) return 'text-success';
    if (accuracy >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getAccuracyBg = (accuracy: number) => {
    if (accuracy >= 85) return 'bg-success/10 border-success/20';
    if (accuracy >= 70) return 'bg-warning/10 border-warning/20';
    return 'bg-destructive/10 border-destructive/20';
  };

  const getTrend = () => {
    if (sessionHistory.length < 2) return 'stable';
    const recent = sessionHistory.slice(0, 5);
    const older = sessionHistory.slice(5, 10);
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, s) => sum + s.accuracy, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.accuracy, 0) / older.length;
    
    if (recentAvg - olderAvg > 3) return 'improving';
    if (olderAvg - recentAvg > 3) return 'declining';
    return 'stable';
  };

  const trend = getTrend();

  const getAchievementIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      GraduationCap: <GraduationCap className="w-5 h-5" />,
      Target: <Target className="w-5 h-5" />,
      Zap: <Zap className="w-5 h-5" />,
      BookOpen: <BookOpen className="w-5 h-5" />,
      Flame: <Flame className="w-5 h-5" />,
      Clock: <Clock className="w-5 h-5" />,
    };
    return icons[iconName] || <Award className="w-5 h-5" />;
  };

  const getWeakestCategory = () => {
    const cats = Object.values(categoryStats);
    if (cats.length === 0) return null;
    return cats.reduce((min, cat) => cat.averageAccuracy < min.averageAccuracy ? cat : min);
  };

  const weakestCategory = getWeakestCategory();

  // Calculate weekly and monthly stats
  const getTimePeriodStats = (startDate: Date) => {
    const filteredSessions = sessionHistory.filter(s => isAfter(parseISO(s.date), startDate));
    if (filteredSessions.length === 0) {
      return { sessions: 0, accuracy: 0, cpm: 0, minutes: 0, sentences: 0 };
    }
    const totalMinutes = filteredSessions.reduce((sum, s) => sum + Math.round(s.durationSeconds / 60), 0);
    const avgAccuracy = filteredSessions.reduce((sum, s) => sum + s.accuracy, 0) / filteredSessions.length;
    const avgCpm = filteredSessions.reduce((sum, s) => sum + s.cpm, 0) / filteredSessions.length;
    const totalSentences = filteredSessions.reduce((sum, s) => sum + s.sentencesCompleted, 0);
    return {
      sessions: filteredSessions.length,
      accuracy: Math.round(avgAccuracy * 10) / 10,
      cpm: Math.round(avgCpm),
      minutes: totalMinutes,
      sentences: totalSentences,
    };
  };

  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 0 });
  const lastWeekStart = subWeeks(thisWeekStart, 1);
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = subMonths(thisMonthStart, 1);

  const thisWeekStats = getTimePeriodStats(thisWeekStart);
  const lastWeekStats = getTimePeriodStats(lastWeekStart);
  const thisMonthStats = getTimePeriodStats(thisMonthStart);
  const lastMonthStats = getTimePeriodStats(lastMonthStart);

  // Calculate percentage change
  const getChange = (current: number, previous: number): { value: number; direction: 'up' | 'down' | 'same' } => {
    if (previous === 0) return { value: current > 0 ? 100 : 0, direction: current > 0 ? 'up' : 'same' };
    const change = Math.round(((current - previous) / previous) * 100);
    return { value: Math.abs(change), direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same' };
  };

  // Get daily breakdown for charts
  const getDailyBreakdown = (startDate: Date, days: number) => {
    const breakdown: { day: number; sessions: number; accuracy: number; minutes: number }[] = [];
    for (let i = 0; i < days; i++) {
      const dayStart = new Date(startDate);
      dayStart.setDate(dayStart.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      const daySessions = sessionHistory.filter(s => {
        const sessionDate = parseISO(s.date);
        return isAfter(sessionDate, dayStart) && !isAfter(sessionDate, dayEnd);
      });
      
      breakdown.push({
        day: i + 1,
        sessions: daySessions.length,
        accuracy: daySessions.length > 0 
          ? Math.round(daySessions.reduce((sum, s) => sum + s.accuracy, 0) / daySessions.length) 
          : 0,
        minutes: daySessions.reduce((sum, s) => sum + Math.round(s.durationSeconds / 60), 0),
      });
    }
    return breakdown;
  };

  const thisWeekDaily = getDailyBreakdown(thisWeekStart, 7);
  const lastWeekDaily = getDailyBreakdown(lastWeekStart, 7);
  const daysInMonth = differenceInDays(now, thisMonthStart) + 1;
  const thisMonthDaily = getDailyBreakdown(thisMonthStart, Math.min(daysInMonth, 31));

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Streak Card */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Flame className={cn("w-5 h-5", currentStreak > 0 ? "text-warning" : "text-muted-foreground")} />
              <span className="text-sm text-muted-foreground hebrew-text">רצף תרגול</span>
            </div>
            <div className="text-4xl font-bold text-foreground mb-1">
              {currentStreak}
              <span className="text-lg text-muted-foreground mr-1 hebrew-text">ימים</span>
            </div>
            {longestStreak > currentStreak && (
              <p className="text-xs text-muted-foreground hebrew-text">
                שיא: {longestStreak} ימים
              </p>
            )}
          </div>

          {/* Practice Time Card */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground hebrew-text">זמן תרגול כולל</span>
            </div>
            <div className="text-4xl font-bold text-foreground mb-1 hebrew-text">
              {formatTime(totalPracticeMinutes)}
            </div>
            <p className="text-xs text-muted-foreground hebrew-text">
              {progress.totalSessions} מפגשים
            </p>
          </div>

          {/* Accuracy Card */}
          <div className={cn("rounded-xl p-6 border", getAccuracyBg(lifetimeMetrics.averageAccuracy))}>
            <div className="flex items-center gap-2 mb-3">
              <Target className={cn("w-5 h-5", getAccuracyColor(lifetimeMetrics.averageAccuracy))} />
              <span className="text-sm text-muted-foreground hebrew-text">דיוק כולל</span>
            </div>
            <div className={cn("text-4xl font-bold mb-1", getAccuracyColor(lifetimeMetrics.averageAccuracy))}>
              {lifetimeMetrics.averageAccuracy || 0}%
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {trend === 'improving' && <TrendingUp className="w-3 h-3 text-success" />}
              {trend === 'declining' && <TrendingDown className="w-3 h-3 text-destructive" />}
              {trend === 'stable' && <Minus className="w-3 h-3" />}
              <span className="hebrew-text">
                {trend === 'improving' ? 'במגמת שיפור' : trend === 'declining' ? 'דורש תרגול' : 'יציב'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Graph */}
        {sessionHistory.length > 0 && (
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground hebrew-text">התקדמות לאורך זמן</h2>
            </div>
            <div className="h-40 flex items-end gap-1">
              {sessionHistory.slice(0, 20).reverse().map((session, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className={cn(
                      "w-full rounded-t transition-all",
                      session.accuracy >= 85 ? "bg-success" : session.accuracy >= 70 ? "bg-warning" : "bg-destructive"
                    )}
                    style={{ height: `${session.accuracy}%` }}
                    title={`${session.category}: ${session.accuracy}%`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className="hebrew-text">ישן</span>
              <span className="hebrew-text">חדש</span>
            </div>
          </div>
        )}

        {/* Weekly / Monthly Summary Tabs */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground hebrew-text">סיכום תקופתי</h2>
          </div>
          
          <Tabs defaultValue="weekly" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="weekly" className="hebrew-text">שבועי</TabsTrigger>
              <TabsTrigger value="monthly" className="hebrew-text">חודשי</TabsTrigger>
            </TabsList>
            
            <TabsContent value="weekly" className="space-y-6">
              {/* Weekly Comparison Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'מפגשים', current: thisWeekStats.sessions, previous: lastWeekStats.sessions, unit: '' },
                  { label: 'דיוק', current: thisWeekStats.accuracy, previous: lastWeekStats.accuracy, unit: '%' },
                  { label: 'מהירות', current: thisWeekStats.cpm, previous: lastWeekStats.cpm, unit: ' CPM' },
                  { label: 'זמן תרגול', current: thisWeekStats.minutes, previous: lastWeekStats.minutes, unit: ' דק׳' },
                ].map((stat) => {
                  const change = getChange(stat.current, stat.previous);
                  return (
                    <div key={stat.label} className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-xs text-muted-foreground mb-1 hebrew-text">{stat.label}</div>
                      <div className="text-2xl font-bold text-foreground">
                        {stat.current}{stat.unit}
                      </div>
                      {stat.previous > 0 && (
                        <div className={cn(
                          "flex items-center justify-center gap-1 text-xs mt-1",
                          change.direction === 'up' ? 'text-success' : 
                          change.direction === 'down' ? 'text-destructive' : 'text-muted-foreground'
                        )}>
                          {change.direction === 'up' && <TrendingUp className="w-3 h-3" />}
                          {change.direction === 'down' && <TrendingDown className="w-3 h-3" />}
                          {change.direction === 'same' && <Minus className="w-3 h-3" />}
                          <span>{change.value}% {change.direction === 'up' ? 'עלייה' : change.direction === 'down' ? 'ירידה' : ''}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Weekly Bar Chart - This Week vs Last Week */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground hebrew-text">השוואה לשבוע שעבר</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-primary rounded-sm"></span> השבוע</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-muted-foreground/40 rounded-sm"></span> שבוע שעבר</span>
                  </div>
                </div>
                <div className="h-32 flex items-end gap-2">
                  {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day, i) => {
                    const thisWeekVal = thisWeekDaily[i]?.minutes || 0;
                    const lastWeekVal = lastWeekDaily[i]?.minutes || 0;
                    const maxVal = Math.max(...thisWeekDaily.map(d => d.minutes), ...lastWeekDaily.map(d => d.minutes), 1);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="flex items-end gap-0.5 h-24 w-full">
                          <div 
                            className="flex-1 bg-muted-foreground/40 rounded-t transition-all"
                            style={{ height: `${(lastWeekVal / maxVal) * 100}%`, minHeight: lastWeekVal > 0 ? '4px' : '0' }}
                            title={`שבוע שעבר: ${lastWeekVal} דקות`}
                          />
                          <div 
                            className="flex-1 bg-primary rounded-t transition-all"
                            style={{ height: `${(thisWeekVal / maxVal) * 100}%`, minHeight: thisWeekVal > 0 ? '4px' : '0' }}
                            title={`השבוע: ${thisWeekVal} דקות`}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Summary Text */}
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                {thisWeekStats.sessions === 0 ? (
                  <p className="text-muted-foreground hebrew-text">עוד לא תרגלת השבוע. התחל עכשיו!</p>
                ) : (
                  <p className="text-foreground hebrew-text">
                    השבוע תרגלת {thisWeekStats.minutes} דקות ותרגמת {thisWeekStats.sentences} משפטים
                    {thisWeekStats.accuracy >= lastWeekStats.accuracy && lastWeekStats.sessions > 0 
                      ? ' - שיפור מעולה!' 
                      : ''}
                  </p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="monthly" className="space-y-6">
              {/* Monthly Comparison Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'מפגשים', current: thisMonthStats.sessions, previous: lastMonthStats.sessions, unit: '' },
                  { label: 'דיוק', current: thisMonthStats.accuracy, previous: lastMonthStats.accuracy, unit: '%' },
                  { label: 'מהירות', current: thisMonthStats.cpm, previous: lastMonthStats.cpm, unit: ' CPM' },
                  { label: 'זמן תרגול', current: thisMonthStats.minutes, previous: lastMonthStats.minutes, unit: ' דק׳' },
                ].map((stat) => {
                  const change = getChange(stat.current, stat.previous);
                  return (
                    <div key={stat.label} className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-xs text-muted-foreground mb-1 hebrew-text">{stat.label}</div>
                      <div className="text-2xl font-bold text-foreground">
                        {stat.current}{stat.unit}
                      </div>
                      {stat.previous > 0 && (
                        <div className={cn(
                          "flex items-center justify-center gap-1 text-xs mt-1",
                          change.direction === 'up' ? 'text-success' : 
                          change.direction === 'down' ? 'text-destructive' : 'text-muted-foreground'
                        )}>
                          {change.direction === 'up' && <TrendingUp className="w-3 h-3" />}
                          {change.direction === 'down' && <TrendingDown className="w-3 h-3" />}
                          {change.direction === 'same' && <Minus className="w-3 h-3" />}
                          <span>{change.value}% {change.direction === 'up' ? 'עלייה' : change.direction === 'down' ? 'ירידה' : ''}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Monthly Bar Chart - Daily Activity */}
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground hebrew-text">פעילות יומית החודש</div>
                <div className="h-32 flex items-end gap-[2px] overflow-x-auto">
                  {thisMonthDaily.map((day, i) => {
                    const maxVal = Math.max(...thisMonthDaily.map(d => d.minutes), 1);
                    return (
                      <div 
                        key={i} 
                        className={cn(
                          "flex-1 min-w-[8px] rounded-t transition-all",
                          day.minutes > 0 
                            ? day.accuracy >= 85 ? "bg-success" : day.accuracy >= 70 ? "bg-warning" : "bg-primary"
                            : "bg-muted/30"
                        )}
                        style={{ height: day.minutes > 0 ? `${Math.max((day.minutes / maxVal) * 100, 8)}%` : '4px' }}
                        title={`יום ${i + 1}: ${day.minutes} דקות, ${day.accuracy}% דיוק`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1</span>
                  <span>{thisMonthDaily.length}</span>
                </div>
              </div>

              {/* Monthly Summary Text */}
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                {thisMonthStats.sessions === 0 ? (
                  <p className="text-muted-foreground hebrew-text">עוד לא תרגלת החודש. התחל עכשיו!</p>
                ) : (
                  <p className="text-foreground hebrew-text">
                    החודש תרגלת {thisMonthStats.minutes} דקות ב-{thisMonthStats.sessions} מפגשים
                    {thisMonthStats.accuracy >= lastMonthStats.accuracy && lastMonthStats.sessions > 0 
                      ? ' - המשך כך!' 
                      : ''}
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Category Breakdown */}
        {Object.keys(categoryStats).length > 0 && (
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="font-semibold text-foreground mb-4 hebrew-text">ביצועים לפי קטגוריה</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.values(categoryStats).map((stat) => (
                <div 
                  key={stat.categoryId}
                  className={cn(
                    "p-4 rounded-lg border",
                    stat.categoryId === weakestCategory?.categoryId 
                      ? "border-warning/50 bg-warning/5" 
                      : "border-border"
                  )}
                >
                  <div className="text-sm font-medium text-foreground hebrew-text">{stat.categoryName}</div>
                  <div className={cn("text-2xl font-bold", getAccuracyColor(stat.averageAccuracy))}>
                    {Math.round(stat.averageAccuracy)}%
                  </div>
                  <div className="text-xs text-muted-foreground hebrew-text">
                    {stat.sessionsCompleted} מפגשים
                  </div>
                  {stat.categoryId === weakestCategory?.categoryId && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full mt-2 text-xs"
                      onClick={() => navigate('/typing-game')}
                    >
                      <span className="hebrew-text">תרגל כאן</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Problem Words */}
        {problemWords.length > 0 && (
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="font-semibold text-foreground mb-4 hebrew-text">מילים לתרגול</h2>
            <div className="flex flex-wrap gap-2">
              {problemWords.slice(0, 10).map((word, i) => (
                <div
                  key={i}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-sm",
                    word.successRate < 0.3 ? "bg-destructive/10 border-destructive/30" :
                    word.successRate < 0.6 ? "bg-warning/10 border-warning/30" :
                    "bg-muted border-border"
                  )}
                >
                  <div className="font-medium">{word.russian}</div>
                  <div className="text-xs text-muted-foreground hebrew-text">{word.hebrew}</div>
                  <div className="text-xs mt-1">
                    <span className={cn(
                      word.successRate < 0.3 ? "text-destructive" : 
                      word.successRate < 0.6 ? "text-warning" : "text-success"
                    )}>
                      {Math.round(word.successRate * 100)}%
                    </span>
                    <span className="text-muted-foreground hebrew-text"> הצלחה</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-warning" />
            <h2 className="font-semibold text-foreground hebrew-text">הישגים</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={cn(
                  "p-4 rounded-lg border text-center transition-all",
                  achievement.unlockedAt 
                    ? "bg-warning/10 border-warning/30" 
                    : "bg-muted/50 border-border opacity-60"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2",
                  achievement.unlockedAt ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"
                )}>
                  {getAchievementIcon(achievement.icon)}
                </div>
                <div className={cn(
                  "font-medium text-sm hebrew-text",
                  achievement.unlockedAt ? "text-foreground" : "text-muted-foreground"
                )}>
                  {achievement.nameHe}
                </div>
                {!achievement.unlockedAt && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round((achievement.progress / achievement.requirement) * 100)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Personal Records */}
        {personalRecords.bestAccuracy.value > 0 && (
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground hebrew-text">שיאים אישיים</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {personalRecords.bestAccuracy.value > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{personalRecords.bestAccuracy.value}%</div>
                  <div className="text-xs text-muted-foreground hebrew-text">דיוק הכי גבוה</div>
                </div>
              )}
              {personalRecords.fastestCpm.value > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{personalRecords.fastestCpm.value}</div>
                  <div className="text-xs text-muted-foreground hebrew-text">CPM הכי מהיר</div>
                </div>
              )}
              {personalRecords.longestStreak.value > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">{personalRecords.longestStreak.value}</div>
                  <div className="text-xs text-muted-foreground hebrew-text">רצף הכי ארוך</div>
                </div>
              )}
              {personalRecords.mostSentencesInSession.value > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{personalRecords.mostSentencesInSession.value}</div>
                  <div className="text-xs text-muted-foreground hebrew-text">משפטים במפגש</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {progress.totalSessions === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2 hebrew-text">עוד אין נתונים</h3>
            <p className="text-muted-foreground mb-6 hebrew-text">התחל לתרגל כדי לראות את ההתקדמות שלך</p>
            <Button onClick={() => navigate('/typing-game')} className="gap-2">
              <span className="hebrew-text">התחל לתרגל</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Continue Practicing CTA */}
        {progress.totalSessions > 0 && (
          <div className="text-center pt-4">
            <Button onClick={() => navigate('/typing-game')} size="lg" className="gap-2">
              <span className="hebrew-text">המשך לתרגל</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>
    </>
    )
};

export default Statistics;
