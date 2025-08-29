import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMedicalTermsWithCategories, getCategories } from "@/cache/medicalTermsCache";
import { BookOpen, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

type Word = { 
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

  const normalizeLang = (lang: string): Lang => {
    if (lang.startsWith("ru") || lang === "rus") return "rus";
    return "en"; // default English
  };
  const targetLang = normalizeLang(i18n.language);

  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Deck handling
  const [deck, setDeck] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [gameMode, setGameMode] = useState<GameMode>("categories");
  const [showAnswer, setShowAnswer] = useState(false);

  /** Load words and categories */
  useEffect(() => {
    (async () => {
      const allWords = await getMedicalTermsWithCategories();
      const allCategories = await getCategories();
      setWords(allWords);
      setCategories(allCategories);
    })();
  }, []);

  /** Start category */
  const startCategory = (category: Category) => {
    const categoryWords = words.filter(w => w.category_id === category.id);
    if (!categoryWords.length) return;

    const shuffled = shuffle(categoryWords);
    setDeck(shuffled);
    setCurrentIndex(0);
    setSelectedCategory(category);
    setGameMode("playing");
    prepareOptions(shuffled[0]);
  };

  /** Prepare answer options */
  const prepareOptions = (word: Word) => {
    const wrongAnswers = words
      .filter(w => w.he !== word.he)
      .map(w => w.he)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    setOptions([word.he, ...wrongAnswers].sort(() => Math.random() - 0.5));
    setFeedback("");
    setShowAnswer(false);
  };

  const handleAnswer = (selected: string) => {
    const currentCard = deck[currentIndex];
    if (!currentCard) return;

    const isCorrect = selected === currentCard.he;
    setShowAnswer(true);
    setFeedback(isCorrect ? "✅ Correct!" : `❌ Incorrect. Correct answer: ${currentCard.he}`);

    setTimeout(() => {
      if (currentIndex + 1 < deck.length) {
        setCurrentIndex(i => i + 1);
        prepareOptions(deck[currentIndex + 1]);
      } else {
        setGameMode("finished");
      }
    }, 1500);
  };

  const backToCategories = () => {
    setGameMode("categories");
    setSelectedCategory(null);
    setDeck([]);
    setCurrentIndex(0);
    setFeedback("");
  };

  /** Render */
  if (gameMode === "categories") {
    return (
      <>
        <Helmet><title>Card Game</title></Helmet>
        <div className="container mx-auto max-w-6xl space-y-8">
          <header className="text-center space-y-4">
            <h1 className="text-4xl font-bold">{t("learning_header", "Card Game")}</h1>
            <p className="text-xl text-muted-foreground">{t("learning_subtitle", "Pick a category and test your knowledge.")}</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(cat => (
              <Card
                key={cat.id}
                onClick={() => startCategory(cat)}
                className="cursor-pointer transition-all hover:shadow-elegant hover:border-primary/50"
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {i18n.language === "he"
                      ? cat.name_he
                      : i18n.language.startsWith("ru")
                      ? cat.name_ru
                      : cat.name_en}
                  </CardTitle>
                  <CardDescription>
                    {words.filter(w => w.category_id === cat.id).length} {t("terms", "terms")}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (gameMode === "finished") {
    return (
      <>
        <Helmet><title>Card Game - Finished</title></Helmet>
        <div className="container mx-auto max-w-2xl text-center space-y-6 py-12">
          <h1 className="text-3xl font-bold">🎉 {t("finished", "All done!")}</h1>
          <p className="text-lg text-muted-foreground">
            {t("you_completed", "You have completed all words in this category.")} 
          </p>
          <Button onClick={backToCategories} className="mt-4">
            {t("back_to_categories", "Back to Categories")}
          </Button>
        </div>
      </>
    );
  }

  // Playing mode
  const currentCard = deck[currentIndex];

  return (
    <>
      <Helmet><title>Card Game - {selectedCategory?.name_en}</title></Helmet>
      <div className="container mx-auto max-w-4xl space-y-6">
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
              <CardDescription>{t("select_hebrew", "Select the correct Hebrew translation")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {options.map(opt => (
                  <Button
                    key={opt}
                    variant={showAnswer ? (opt === currentCard.he ? "default" : "outline") : "outline"}
                    size="lg"
                    onClick={() => handleAnswer(opt)}
                    disabled={showAnswer}
                    className={`p-6 text-lg ${showAnswer && opt === currentCard.he ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    {opt}
                  </Button>
                ))}
              </div>

              {feedback && (
                <div className="p-4 rounded-lg text-center font-medium bg-muted border">
                  {feedback}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default Learning;
