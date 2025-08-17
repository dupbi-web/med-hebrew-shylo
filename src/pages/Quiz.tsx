import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { getMedicalTerms } from "@/cache/medicalTermsCache"; // <-- Use the cache!
type Word = { en: string; he: string; rus: string; category?: string | null };
type Lang = "en" | "rus";

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
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [targetLang, setTargetLang] = useState<Lang>("rus");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const current = words[currentIndex];
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchWords = async () => {
      const allWords = await getMedicalTerms();

      // Extract unique categories from cached data
      const uniqueCategories = Array.from(
        new Set(allWords.map((w: Word) => w.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);

      let filtered = allWords;
      if (selectedCategory) {
        filtered = filtered.filter((w: Word) => w.category === selectedCategory);
      }

      const cleaned = (filtered ?? []).filter((w) => w.he && w[targetLang]);
      setWords(shuffleCopy(cleaned));
      setCurrentIndex(0);
      setScore(0);
      setSelected(null);
    };

    fetchWords();
  }, [selectedCategory, targetLang]);

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

  return (
    <>
      <Helmet>
        <title>Medical Hebrew Quiz</title>
        <meta name="description" content="Test your knowledge of medical Hebrew with multiple choice questions." />
      </Helmet>
      <main className="container mx-auto max-w-6xl">
        <section className="container py-8 md:py-12 px-4 max-w-4xl mx-auto">
          <nav aria-label="Quiz toolbar" className="mb-8">
            <div className="bg-gradient-to-r from-card to-card/80 backdrop-blur-sm border border-border/60 rounded-xl p-6 md:p-8 shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">Quiz Settings</h2>
                <p className="text-sm text-muted-foreground">Customize your learning experience</p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch max-w-2xl mx-auto">
                <div className="flex-1 bg-background/50 rounded-lg p-4 border border-border/40">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <label htmlFor="category-select" className="text-sm font-medium text-foreground">
                      Category Filter
                    </label>
                  </div>
                  <select
                    id="category-select"
                    value={selectedCategory ?? ""}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
                    aria-describedby="category-help"
                  >
                    <option value="">🔄 All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        📚 {cat}
                      </option>
                    ))}
                  </select>
                  <p id="category-help" className="text-xs text-muted-foreground mt-2">
                    Focus on specific medical topics
                  </p>
                </div>

                <div className="flex-1 bg-background/50 rounded-lg p-4 border border-border/40">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                    </div>
                    <label htmlFor="language-select" className="text-sm font-medium text-foreground">
                      Answer Language
                    </label>
                  </div>
                  <select
                    id="language-select"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value as Lang)}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
                    aria-describedby="language-help"
                  >
                    <option value="en">English</option>
                    <option value="rus">Russian</option>
                  </select>
                  <p id="language-help" className="text-xs text-muted-foreground mt-2">
                    Choose your preferred translation language
                  </p>
                </div>
              </div>
            </div>
          </nav>

          {isDone ? (
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
                <h2 className="text-xl md:text-2xl font-semibold text-muted-foreground mb-4">
                  What does this Hebrew term mean?
                </h2>
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
                          Correct answer
                        </span>
                      )}
                      {selected && isSelected && !isCorrect && (
                        <span id="incorrect-answer" className="sr-only">
                          Incorrect answer
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  Question <span className="font-medium">{currentIndex + 1}</span> of{" "}
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
