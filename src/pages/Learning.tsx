import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMedicalTerms } from "@/hooks/queries/useMedicalTerms";
import { useCategories } from "@/hooks/queries/useCategories";
import { fetchHebrewSentence } from "@/utils/fetchHebrewSentence";
import { BookOpen, ArrowLeft, Loader2, X, Volume2, RotateCcw, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useAuthContext } from "@/context/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageContainer, PageHeader, CompletionScreen, CategoryCard } from "@/components/common";

type Word = {
  id: number;
  en: string;
  he: string;
  rus: string;
  category_id?: number | null;
};

type Category = {
  id: number;
  slug: string;
  name_en: string;
  name_he: string;
  name_ru: string;
};

type GameMode = "categories" | "playing" | "finished";
type Lang = "en" | "rus";

// Shuffle helper
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const Learning = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthContext();
  const { updateWordProgress, getAllCategoryProgress, resetProgress } = useUserProgress();
  const { data: allWords = [], isLoading: wordsLoading } = useMedicalTerms();
  const { data: allCategories = [], isLoading: categoriesLoading } = useCategories();

  const normalizeLang = (lang: string): Lang => {
    if (lang.startsWith("ru") || lang === "rus") return "rus";
    return "en"; // default English
  };
  const targetLang = normalizeLang(i18n.language);

  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryProgress, setCategoryProgress] = useState<Record<number, number>>({});

  // Deck handling
  const [deck, setDeck] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [gameMode, setGameMode] = useState<GameMode>("categories");
  const [showAnswer, setShowAnswer] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [lastAnswers, setLastAnswers] = useState<{index: number, answer: string}[]>([]);
  const [showExample, setShowExample] = useState<{visible: boolean, sentence: string}>({visible: false, sentence: ""});
  const [loadingExample, setLoadingExample] = useState(false);
  const [showSentenceButton, setShowSentenceButton] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answersMap, setAnswersMap] = useState<Record<number, string>>({});
  const [sessionProgress, setSessionProgress] = useState<Record<number, any>>({});

  /** Load words and categories on mount */
  useEffect(() => {
    if (!allWords.length || !allCategories.length) return;

    setWords(allWords);
    setCategories(allCategories);

    // Load progress for all categories in a single request
    (async () => {
      if (user) {
        const categoriesWithWordCount = allCategories.map((cat) => {
          const totalWords = allWords.filter((w) => w.category_id === cat.id).length;
          return { id: cat.id, totalWords };
        });

        const progressMap = await getAllCategoryProgress(categoriesWithWordCount);
        setCategoryProgress(progressMap);
      }
    })();
  }, [allWords, allCategories, user, getAllCategoryProgress]);

  /** Shuffle and start a category */
  const startCategory = (category: Category) => {
    const categoryWords = words.filter((w) => w.category_id === category.id);
    if (!categoryWords.length) return;

    const shuffled = shuffle(categoryWords);
    setDeck(shuffled);
    setCurrentIndex(0);
    setSelectedCategory(category);
    setGameMode("playing");
    setShowNext(false);
    setSelectedAnswer(null);
    setShowExample({ visible: false, sentence: "" });
    setLastAnswers([]);
    setAnswersMap({});
    setSessionProgress({});
    setLoadingExample(false);
    setFeedback("");
    prepareOptions(shuffled[0]);
  };

  /** Prepare answer options */
  const prepareOptions = (word: Word) => {
    const wrongAnswers = words
      .filter((w) => w.he !== word.he)
      .map((w) => w.he)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    setOptions([word.he, ...wrongAnswers].sort(() => Math.random() - 0.5));
    setFeedback("");
    setShowAnswer(false);
  };

  /** Handle user answer */
  const handleAnswer = async (selected: string) => {
    const currentCard = deck[currentIndex];
    if (!currentCard) return;

    setSelectedAnswer(selected);
    setAnswersMap((prev) => ({ ...prev, [currentIndex]: selected }));
    const isCorrect = selected === currentCard.he;
    setShowAnswer(true);
    setShowNext(true);
    setFeedback(isCorrect ? "✅ Correct!" : `❌ Incorrect. Correct answer: ${currentCard.he}`);
    setLastAnswers((prev) => [...prev, { index: currentIndex, answer: selected }]);

    // Save progress to database
    if (user && currentCard.id) {
      await updateWordProgress(currentCard.id, isCorrect);
    }

    // Show button to get example sentence if correct
    if (isCorrect) {
      setShowSentenceButton(true);
    }
  };

  const handleGetSentence = async () => {
    const currentCard = deck[currentIndex];
    if (!currentCard) return;

    setLoadingExample(true);
    setShowSentenceButton(false);
    setShowExample({
      visible: true,
      sentence: "-  AI טוען  דוגמה..." // "Loading example..."
    });

    let exampleSentence = "";
    try {
      exampleSentence = await fetchHebrewSentence(currentCard.he);
    } catch (err) {
      console.error("Error fetching/generating example sentences:", err);
    }

    setShowExample({
      visible: true,
      sentence: exampleSentence 
        ? `${exampleSentence}` 
        : `Example: "${currentCard.he}" is used in a sentence.`
    });
    setLoadingExample(false);
  };

  /** Go to next card */
  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    setShowAnswer(false);
    setShowNext(false);
    setSelectedAnswer(null);
    setShowExample({visible: false, sentence: ""});
    setLoadingExample(false);
    setShowSentenceButton(false);

    if (nextIndex < deck.length) {
      setCurrentIndex(nextIndex);
      prepareOptions(deck[nextIndex]);

      if (answersMap[nextIndex] !== undefined) {
        const ans = answersMap[nextIndex];
        setSelectedAnswer(ans);
        setShowAnswer(true);
        setShowNext(true);
        const isCorrect = ans === deck[nextIndex].he;
        setFeedback(isCorrect ? "✅ Correct!" : `❌ Incorrect. Correct answer: ${deck[nextIndex].he}`);
        if (isCorrect) {
          setShowSentenceButton(true);
        }
      }
    } else {
      setGameMode("finished");
    }
  };

  /** Go to previous card */
  const handleBack = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      prepareOptions(deck[prevIndex]);
      setShowAnswer(false);
      setShowNext(false);
      setSelectedAnswer(null);
      setShowExample({visible: false, sentence: ""});
      setLoadingExample(false);
      setShowSentenceButton(false);

      // Restore answer if exists
      if (answersMap[prevIndex] !== undefined) {
        setSelectedAnswer(answersMap[prevIndex]);
        setShowAnswer(true);
        setShowNext(true);
        const isCorrect = answersMap[prevIndex] === deck[prevIndex].he;
        setFeedback(isCorrect ? "✅ Correct!" : `❌ Incorrect. Correct answer: ${deck[prevIndex].he}`);
        if (isCorrect) {
          setShowSentenceButton(true);
        }
      } else {
        setFeedback("");
      }
    }
  };
  const handleResetProgress = async () => {
    await resetProgress();

    const categoriesWithWordCount = allCategories.map((cat) => {
      const totalWords = allWords.filter((w) => w.category_id === cat.id).length;
      return { id: cat.id, totalWords };
    });

    const progressMap = await getAllCategoryProgress(categoriesWithWordCount);
    setCategoryProgress(progressMap);
  };

  const backToCategories = () => {
    setGameMode("categories");
    setSelectedCategory(null);
    setDeck([]);
    setCurrentIndex(0);
    setFeedback("");
    setAnswersMap({});
    setLoadingExample(false);
    setShowExample({visible: false, sentence: ""});
    setSelectedAnswer(null);
    setShowAnswer(false);
    setShowNext(false);
    setLastAnswers([]);
    setShowSentenceButton(false);
  };

  /** Render */
  if (gameMode === "categories") {
    return (
      <>
        <Helmet><title>{t("learning_header", "Learn Flashcards")}</title></Helmet>
        <PageContainer maxWidth="6xl" className="space-y-8">
          <PageHeader
            title={t("learning_header", "Learn Flashcards")}
            subtitle={t("learning_subtitle", "Pick a category and test your knowledge.")}
            actions={
              user && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" title="Reset Progress">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset All Progress?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your learning progress. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetProgress}>
                        Reset Progress
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(cat => {
              const categoryWords = words.filter(w => w.category_id === cat.id);
              const progress = categoryProgress[cat.id] || 0;
              const categoryName = i18n.language === "he"
                ? cat.name_he
                : i18n.language.startsWith("ru")
                ? cat.name_ru
                : cat.name_en;
              
              return (
                <CategoryCard
                  key={cat.id}
                  title={categoryName}
                  description={`${categoryWords.length} ${t("terms", "terms")}`}
                  progress={progress}
                  icon={BookOpen}
                  onClick={() => startCategory(cat)}
                />
              );
            })}
          </div>
        </PageContainer>
      </>
    );
  }

  /** Render finished page */
  if (gameMode === "finished") {
    return (
      <>
        <Helmet><title>{t("learning_header", "Learn Flashcards")} - Finished</title></Helmet>
        <CompletionScreen
          emoji="🎉"
          title={t("finished", "All done!")}
          description={t("you_completed", "You have completed all words in this category.")}
          onAction={backToCategories}
          actionLabel={t("back_to_categories", "Back to Categories")}
        />
      </>
    );
  }

  /** Render playing mode */
  const currentCard = deck[currentIndex];
  return (
    <>
      <Helmet><title>{t("learning_header", "Learn Flashcards")} - {selectedCategory?.name_en}</title></Helmet>
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Button variant="outline" onClick={backToCategories} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> {t("back", "Back")}
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              {i18n.language === "he"
                ? selectedCategory?.name_he
                : i18n.language.startsWith("ru")
                ? selectedCategory?.name_ru
                : selectedCategory?.name_en}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("progress", "Progress")}: {currentIndex + 1} / {deck.length}
            </p>
          </div>
        </header>

        {currentCard && (
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">
                {currentCard[targetLang]}
              </CardTitle>
              <CardDescription>
                {t("select_hebrew", "Select the correct Hebrew translation")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Answer Options */}
              <div className="grid grid-cols-1 gap-3">
                {options.map((opt) => {
                  let btnVariant = "outline";
                  let btnClass = "p-6 text-lg";
                  if (showAnswer) {
                    if (opt === currentCard.he) {
                      btnVariant = "default";
                      btnClass += " bg-primary text-primary-foreground";
                    } else if (selectedAnswer === opt) {
                      btnVariant = "destructive";
                      btnClass += " bg-red-500 text-white";
                    }
                  }
                  return (
                    <Button
                      key={opt}
                      variant={btnVariant as any}
                      size="lg"
                      onClick={() => handleAnswer(opt)}
                      disabled={showAnswer}
                      className={btnClass}
                    >
                      {opt}
                    </Button>
                  );
                })}
              </div>

              {/* Feedback */}
              {feedback && (
                <div className="p-4 rounded-lg text-center font-medium bg-muted border">
                  {feedback}
                </div>
              )}

              {showSentenceButton && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleGetSentence}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    {t("get_example_sentence", "Get AI Example Sentence")}
                  </Button>
                </div>
              )}

              {showExample.visible && (
                <div className="mt-4 animate-fade-in">
                  <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 shadow-sm">
                    <button
                      onClick={() => setShowExample({visible: false, sentence: ""})}
                      className="absolute top-3 right-3 p-1 rounded-full hover:bg-primary/10 transition-colors"
                      aria-label="Close example"
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="p-2 rounded-full bg-primary/10">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          {t("example_sentence", "Example Sentence")}
                          {loadingExample && (
                            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                          )}
                        </h4>
                        
                        <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                          {showExample.sentence}
                        </p>
                        
                        {/* Future enhancement placeholder */}
                        <div className="flex gap-2 pt-2 opacity-50">
                          <button
                            disabled
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:cursor-not-allowed"
                            title="Audio playback (coming soon)"
                          >
                            <Volume2 className="h-3 w-3" />
                            <span>{t("play_audio", "Play Audio (coming soon)")}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> {t("previous", "Previous")}
                </Button>
                <Button
                  onClick={handleNext}
                  variant="default"
                  disabled={!showNext}
                  className="flex items-center gap-2"
                >
                  {t("next", "Next")} <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </>
  );
};

export default Learning;
