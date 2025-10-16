import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { getMedicalTermsWithCategories, getCategories, getBodyOrgansWords } from "@/cache/medicalTermsCache";
import { useTranslation } from "react-i18next";

type Word = { en: string; he: string; rus: string; category?: string | null };
type Lang = "en" | "rus";
type Category = {
  id: number;
  slug: string;
  name_en: string;
  name_he: string;
  name_ru: string;
};
function shuffleCopy<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getRandomDistractors(words: Word[], correct: Word, lang: Lang, count: number) {
  const filtered = words.filter((w) => w[lang] !== correct[lang]);
  return shuffleCopy(filtered).slice(0, count);
}

const Quiz = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
    // Helper to normalize i18n.language to your Lang type
  const normalizeLang = (lang: string): Lang => {
    if (lang.startsWith("ru") || lang === "rus") return "rus";
    return "en"; // default to English for everything else
  };
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  // const [targetLang, setTargetLang] = useState<Lang>("rus");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const current = words[currentIndex];
  const [options, setOptions] = useState<string[]>([]);
 // Use i18n.language instead of targetLang state
  const targetLang = normalizeLang(i18n.language);

  const [showUpsell, setShowUpsell] = useState(false);
  useEffect(() => {
    const fetchWords = async () => {
      const allCategories = await getCategories();
      setCategories(allCategories);

      let filtered: any[] = [];
      if (!user) {
        // Only fetch body organs words for unauthenticated users
        filtered = await getBodyOrgansWords();
        // Find the "body organs" category
        const bodyOrgansCategory = allCategories.find(
          (cat) => cat.name_en.toLowerCase() === "body organs"
        );
        const bodyOrgansCategoryId = bodyOrgansCategory?.id;
        // If user tries to select another category, show upsell
        if (selectedCategory && Number(selectedCategory) !== bodyOrgansCategoryId) {
          setShowUpsell(true);
        } else {
          setShowUpsell(false);
        }
      } else {
        // Registered: fetch all words with categories
        filtered = await getMedicalTermsWithCategories();
        if (selectedCategory) {
          filtered = filtered.filter((w: any) => {
            const categoryIds = Array.isArray(w.category_id) ? w.category_id : [w.category_id];
            return categoryIds.includes(Number(selectedCategory));
          });
        }
        setShowUpsell(false);
      }
      const cleaned = filtered.filter((w: Word) => w.he && w[targetLang]);
      setWords(shuffleCopy(cleaned));
      setCurrentIndex(0);
      setScore(0);
      setSelected(null);
    };
    fetchWords();
  }, [selectedCategory, targetLang, user]);

  useEffect(() => {
    if (current) {
      const distractors = getRandomDistractors(words, current, targetLang, 3);
      const opts = shuffleCopy([current[targetLang], ...distractors.map(w => w[targetLang])]);
      setOptions(opts);
    }
  }, [current, targetLang, words]);

  const handleSelect = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    if (choice === current[targetLang]) {
      setScore((s) => s + 1);
    }
    setTimeout(() => {
      setSelected(null);
      setCurrentIndex((i) => i + 1);
    }, 1000);
  };

  const restartQuiz = () => {
    setWords(shuffleCopy(words));
    setCurrentIndex(0);
    setScore(0);
    setSelected(null);
  };

  const isDone = currentIndex >= words.length;
 const getCategoryLabel = (cat: Category) => {
    if (!cat) return "";
    switch (i18n.language) {
      case "he":
        return cat.name_he;
      case "ru":
        return cat.name_ru;
      default:
        return cat.name_en;
    }
  };
  // Upsell banner for unregistered users
  const UpsellBanner = () => (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded relative mb-4">
      <span>
        {t("Unlock all categories and words!")}
      </span>
      <Button className="ml-4" onClick={() => window.location.href = "/auth"}>
        {t("Sign in to unlock")}
      </Button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Medical Hebrew Quiz</title>
        <meta name="description" content="Test your knowledge of medical Hebrew with multiple choice questions." />
      </Helmet>
      <main className="container mx-auto max-w-6xl">
        <section className="container py-8 md:py-12 px-4 max-w-4xl mx-auto">
          {isDone ? (
            // ...existing code...
            <div 
              className="bg-card border border-border rounded-lg p-6 md:p-8 max-w-md mx-auto text-center shadow-lg"
              role="alert"
              aria-live="polite"
            >
              <div className="text-4xl mb-4" aria-hidden="true">🏁</div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
                Quiz Complete!
              </h2>
              <p className="text-muted-foreground mb-6">
                You scored <span className="font-semibold text-foreground">{score}</span> out of{" "}
                <span className="font-semibold text-foreground">{words.length}</span> correct
                <span className="sr-only">
                  . That's {Math.round((score / words.length) * 100)}% accuracy.
                </span>
              </p>
              <Button 
                onClick={restartQuiz}
                className="min-w-[120px]"
                aria-describedby="restart-help"
              >
                Restart Quiz
              </Button>
              <span id="restart-help" className="sr-only">
                Start the quiz over with the same settings
              </span>
            </div>
          ) : current ? (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <label htmlFor="category-select" className="sr-only">{t("select_category")}</label>
                  <select
                    id="category-select"
                    value={selectedCategory ?? ""}
                    onChange={(e) => {
                      const val = e.target.value || null;
                      if (!user && categories.length) {
                        const bodyOrgansCategory = categories.find(
                          (cat) => cat.name_en.toLowerCase() === "body organs"
                        );
                        if (val && val !== String(bodyOrgansCategory?.id)) {
                          setShowUpsell(true);
                          return;
                        }
                      }
                      setSelectedCategory(val);
                    }}
                    className="px-4 py-3 bg-background border border-input rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all max-w-xs"
                    aria-describedby="category-help"
                  >
                    <option value="">🔄 {t("all_categories")}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        📚 {getCategoryLabel(cat)}
                        {!user && cat.name_en.toLowerCase() !== "body organs" ? " 🔒" : ""}
                      </option>
                    ))}
                  </select>

                  <h2 className="text-xl md:text-2xl font-semibold text-muted-foreground">
                    {t("quiz_header")}
                  </h2>
                </div>
                {showUpsell && <UpsellBanner />}
                {/* ...existing code for quiz question and options... */}
                <div 
                  className="bg-card/50 border border-border rounded-lg p-6 md:p-8 mb-6"
                  role="region"
                  aria-label="Hebrew term to translate"
                >
                  <h3 
                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary" 
                    dir="rtl"
                    lang="he"
                    aria-label={`Hebrew term: ${current.he}`}
                  >
                    {current.he}
                  </h3>
                </div>
              </div>
              {/* ...existing code for answer options and counter... */}
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto"
                role="radiogroup"
                aria-label="Answer options"
              >
                {options.map((opt, index) => {
                  const isCorrect = opt === current[targetLang];
                  const isSelected = opt === selected;
                  const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                  return (
                    <button
                      key={opt}
                      role="radio"
                      aria-checked={isSelected}
                      aria-labelledby={`option-${index}-text`}
                      className={`
                        group relative p-4 md:p-5 border-2 rounded-lg transition-all duration-200 text-left min-h-[60px] md:min-h-[80px]
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
                        ${selected
                          ? isCorrect
                            ? "bg-green-50 border-green-500 text-green-900 dark:bg-green-950 dark:text-green-100"
                            : isSelected
                            ? "bg-red-50 border-red-500 text-red-900 dark:bg-red-950 dark:text-red-100"
                            : "opacity-50 bg-muted border-muted-foreground/20"
                          : "bg-card border-border hover:bg-accent hover:border-accent-foreground/20 active:scale-[0.98]"
                        }
                      `}
                      onClick={() => handleSelect(opt)}
                      disabled={!!selected}
                      aria-describedby={selected && isCorrect ? "correct-answer" : selected && isSelected ? "incorrect-answer" : undefined}
                    >
                      <div className="flex items-start gap-3">
                        <span 
                          className={`
                            flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold
                            ${selected && isCorrect 
                              ? "bg-green-500 border-green-500 text-white" 
                              : selected && isSelected
                              ? "bg-red-500 border-red-500 text-white"
                              : "border-muted-foreground/40 text-muted-foreground group-hover:border-accent-foreground/60 group-hover:text-accent-foreground"
                            }
                          `}
                          aria-hidden="true"
                        >
                          {selected && isCorrect ? "✓" : selected && isSelected ? "✗" : optionLetter}
                        </span>
                        <span 
                          id={`option-${index}-text`}
                          className="flex-1 break-words leading-relaxed"
                        >
                          {opt}
                        </span>
                      </div>
                      {selected && isCorrect && (
                        <span id="correct-answer" className="sr-only">
                          {t("quiz_correct_answer")}
                        </span>
                      )}
                      {selected && isSelected && !isCorrect && (
                        <span id="incorrect-answer" className="sr-only">
                          {t("quiz_incorrect_answer")}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  {t("quiz_counter")} <span className="font-medium">{currentIndex + 1}</span> of{" "}
                  <span className="font-medium">{words.length}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center" aria-live="polite">
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading quiz questions...</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default Quiz;
