import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Flashcard from "@/components/Flashcard";
import { useMedicalTerms } from "@/hooks/queries/useMedicalTerms";
import {
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Shuffle,
  Languages,
  RotateCcw,
  Trophy,
  Target,
  Clock,
  BookOpen,
  Info
} from "lucide-react";

type Word = { 
  en: string; 
  he: string; 
  rus: string; 
  category?: string | null 
};

// Fisher–Yates shuffle
function shuffleCopy<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

const FlashCards = () => {
  const { data: allMedicalTerms = [], isLoading } = useMedicalTerms();
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [targetLang, setTargetLang] = useState<"rus" | "en">("rus");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);

    // hide tooltip after 3 seconds
    setTimeout(() => {
      setOpen(false);
    }, 3000);
  };

  const total = words.length;
  const current = words[index];
  const isDone = !current && total > 0;

  // Process words and categories when data loads
  useEffect(() => {
    if (!allMedicalTerms.length) return;

    // Extract unique categories from cached data
    const uniqueCategories = Array.from(
      new Set(allMedicalTerms.map((w) => w.category?.name_en).filter(Boolean))
    ) as string[];
    setCategories(uniqueCategories);

    // Set default category to first available if none selected
    if (!selectedCategory && uniqueCategories.length > 0) {
      setSelectedCategory(uniqueCategories[0]);
      return; // Return early to avoid double processing
    }

    let filtered = allMedicalTerms;
    if (selectedCategory) {
      filtered = filtered.filter((w) => w.category?.name_en === selectedCategory);
    }

    const mapped = shuffleCopy(filtered).map((w) => ({
      en: w.en?.trim() || "",
      he: w.he?.trim() || "",
      rus: w.rus?.trim() || "",
      category: w.category?.name_en ?? null
    }));

    setWords(mapped);
    setIndex(0);
    setReviewed(0);
    setFlipped(false);
    setStartTime(Date.now());
  }, [allMedicalTerms, selectedCategory]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [words, index]);

  const next = useCallback(() => {
    setIndex((i) => i + 1);
    setFlipped(false);
    setReviewed((r) => r + 1);
  }, []);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + total) % total);
    setFlipped(false);
    setReviewed((r) => r + 1);
  }, [total]);

  const restart = () => {
    setIndex(0);
    setFlipped(false);
    setReviewed(0);
    setStartTime(Date.now());
  };

  const shuffle = () => {
    setWords((prev) => shuffleCopy(prev));
    setIndex(0);
    setFlipped(false);
  };

  // Pointer-follow effect
  useEffect(() => {
    const root = document.documentElement;
    const handleMove = (e: MouseEvent) => {
      root.style.setProperty("--pointer-x", `${(e.clientX / window.innerWidth) * 100}%`);
      root.style.setProperty("--pointer-y", `${(e.clientY / window.innerHeight) * 100}%`);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <>
      <Helmet>
        <title>Medical Hebrew Flashcards | Learn Medical Terms</title>
        <meta name="description" content="Practice medical Hebrew with flashcards. Flip, shuffle, and track progress." />
      </Helmet>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3 sm:py-6 animate-in fade-in-0 duration-500 min-h-screen relative">
        <h1 className="sr-only">Medical Hebrew Flashcards</h1>



        {/* Category Filter */}
        <div className="mb-4 sm:mb-6 flex justify-center px-4 sm:px-0" role="region" aria-label="Category filter">
        <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <button
          onClick={handleClick}
          className="absolute top-4 right-4 z-50 bg-card/80 backdrop-blur-sm border border-border rounded-full p-2 shadow-sm hover:bg-card transition-colors duration-200 flex items-center justify-center"
          aria-label="Contact us for more words"
        >
          <Info className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-xs">
        <p className="text-sm">
          Want more words?{" "}
          <Link to="/public-contact" className="text-primary underline">
            contact us
          </Link>
          .
        </p>
      </TooltipContent>
    </Tooltip>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-3 bg-card/50 backdrop-blur-sm border border-border rounded-lg px-4 py-3 shadow-sm w-full max-w-lg touch-manipulation">
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium text-foreground whitespace-nowrap">Filter:</span>
            </div>
            <select
              value={selectedCategory ?? ""}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 sm:min-w-[160px] px-3 py-2 bg-background border border-input rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background min-h-[44px] touch-manipulation"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3 sm:mb-6 space-y-2 sm:space-y-4">
          {/* Progress Bar */}
          <div className="max-w-md mx-auto animate-in slide-in-from-bottom-2 duration-300 px-4 sm:px-0" role="region" aria-label="Study progress">
            <div className="flex justify-between text-sm text-muted-foreground mb-1 sm:mb-2">
              <span className="text-sm sm:text-base">Progress</span>
              <span className="font-medium text-sm sm:text-base" aria-live="polite">{Math.round(((index + 1) / Math.max(total, 1)) * 100)}%</span>
            </div>
            <Progress
              value={((index + 1) / Math.max(total, 1)) * 100}
              className="h-3 sm:h-2 transition-all duration-300"
              aria-label={`Study progress: ${Math.round(((index + 1) / Math.max(total, 1)) * 100)}% complete`}
            />
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-6 text-sm text-muted-foreground px-4 sm:px-0" role="status" aria-live="polite">
            <span className="flex items-center gap-1">
              <span className="font-medium text-sm sm:text-base">{index + 1}</span> of <span className="font-medium text-sm sm:text-base">{total}</span> cards
            </span>
            <span className="hidden sm:inline" aria-hidden>•</span>
            <span className="flex items-center gap-1">
              <span className="font-medium text-sm sm:text-base">{reviewed}</span> reviewed
            </span>
          </div>
        </div>

        {/* Main Flashcard Display */}
        <div role="main" aria-label="Flashcard study area" className="flex-1 flex items-center justify-center py-4 sm:py-8 relative">
          {/* Info Circle - positioned in card area */}

          {isLoading ? (
            <p className="text-center text-muted-foreground text-base sm:text-lg" role="status" aria-live="polite">Loading words...</p>
          ) : isDone ? (
          <div className="text-center space-y-4 sm:space-y-6 p-6 sm:p-8 border border-border rounded-xl shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 max-w-lg mx-auto animate-in zoom-in-95 duration-500">
            {/* Celebration Header */}
            <div className="space-y-2 sm:space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">🎉 Congratulations!</h2>
              <p className="text-sm sm:text-base text-muted-foreground">You've completed all flashcards!</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-3 sm:py-4">
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">Cards</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-foreground">{total}</div>
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">Reviewed</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-foreground">{reviewed}</div>
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-border col-span-1 sm:col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">Time Taken</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-foreground">
                  {startTime ? formatTime(Date.now() - startTime) : "0s"}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={restart} className="px-6 py-3 min-h-[48px] w-full sm:w-auto text-base touch-manipulation">
                <RotateCcw className="h-4 w-4 mr-2" />
                Study Again
              </Button>
              <Button variant="outline" onClick={shuffle} className="px-6 py-3 min-h-[48px] w-full sm:w-auto text-base touch-manipulation">
                <Shuffle className="h-4 w-4 mr-2" />
                Shuffle & Restart
              </Button>
            </div>
          </div>
        ) : current ? (
          <Flashcard
            translation={targetLang === "en" ? current.en : current.rus}
            targetLang={targetLang}
            he={current.he}
            flipped={flipped}
            onToggle={() => setFlipped((f) => !f)}
          />
        ) : (
          <p className="text-center text-muted-foreground text-base sm:text-lg py-8" role="status">No words yet.</p>
        )}
        </div>

        {/* Top Controls */}
        <div className="mt-3 sm:mt-6 space-y-3 px-4 sm:px-0">
          {/* Language Toggle */}
          <div className="flex items-center justify-center" role="group" aria-label="Language selection">
            <div className="flex rounded-lg border border-border bg-card/50 backdrop-blur-sm p-1 touch-manipulation">
              <Button
                variant={targetLang === "en" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTargetLang("en")}
                className="text-xs px-3 min-h-[40px] touch-manipulation"
                aria-pressed={targetLang === "en"}
                aria-label="Study English to Hebrew"
              >
                EN→HE
              </Button>
              <Button
                variant={targetLang === "rus" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTargetLang("rus")}
                className="text-xs px-3 min-h-[40px] touch-manipulation"
                aria-pressed={targetLang === "rus"}
                aria-label="Study Russian to Hebrew"
              >
                RU→HE
              </Button>
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="secondary"
                size="sm"
                onClick={shuffle}
                className="px-4 py-2 min-h-[40px] touch-manipulation flex-1 sm:flex-none"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Shuffle
              </Button>
              {isDone && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={restart}
                  className="px-4 py-2 min-h-[40px] touch-manipulation flex-1 sm:flex-none"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restart
                </Button>
              )}
            </div>

            {/* Keyboard Hints - Hidden on mobile */}
            <div className="hidden sm:block text-center text-xs text-muted-foreground mt-2">
              Use arrow keys ← → to navigate • Space to flip card
            </div>
          </div>
        </div>

        {/* Floating Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3 sm:py-4 safe-area-bottom">
          <div className="flex items-center justify-center gap-2 max-w-md mx-auto" role="group" aria-label="Card navigation">
            <Button
              variant="outline"
              size="lg"
              onClick={prev}
              disabled={index === 0}
              className="flex-1 px-3 min-h-[48px] touch-manipulation rounded-lg"
              aria-label={`Previous card (${index} of ${total})`}
            >
              <ChevronLeft className="h-5 w-5 mr-1" aria-hidden="true" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>

            <Button
              variant="default"
              size="lg"
              onClick={() => setFlipped((f) => !f)}
              className="flex-1 px-4 min-h-[48px] min-w-[120px] touch-manipulation rounded-lg"
              aria-label={flipped ? "Hide Hebrew translation" : "Show Hebrew translation"}
              aria-pressed={flipped}
            >
              {flipped ? (
                <>
                  <EyeOff className="h-5 w-5 mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline">Hide Answer</span>
                  <span className="sm:hidden">Hide</span>
                </>
              ) : (
                <>
                  <Eye className="h-5 w-5 mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline">Show Answer</span>
                  <span className="sm:hidden">Show</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={next}
              disabled={isDone}
              className="flex-1 px-3 min-h-[48px] touch-manipulation rounded-lg"
              aria-label={`Next card (${index + 2} of ${total})`}
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-5 w-5 ml-1" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* Add bottom spacing to account for floating bar */}
        <div className="h-24 sm:h-28"></div>
      </div>
    </>
  );
};

export default FlashCards;
