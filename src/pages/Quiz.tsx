import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
type Word = { en: string; he: string; rus: string; category?: string | null };
type Lang = "en" | "rus";
const CATEGORIES = [
  "Anatomy", "Symptom", "Treatment", "Procedure", "Facility", "Measurement", "Injury",
  "Condition", "Pathogen", "Tool", "Equipment", "General", "Personnel", "Specialty"
] as const;

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [targetLang, setTargetLang] = useState<Lang>("rus");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const current = words[currentIndex];
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchWords = async () => {
      let query = supabase.from("medical_terms").select("en, he, rus, category");

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        toast({ title: "Failed to load words", description: error.message });
        return;
      }

      const cleaned = (data ?? []).filter((w) => w.he && w[targetLang]);
      setWords(shuffleCopy(cleaned));
      setCurrentIndex(0);
      setScore(0);
      setSelected(null);
    };

    fetchWords();
  }, [selectedCategory]);

  useEffect(() => {
    if (current) {
      const distractors = getRandomDistractors(words, current, targetLang, 3);
      const opts = shuffleCopy([current[targetLang], ...distractors.map(w => w[targetLang])]);
      setOptions(opts);
    }
  }, [current, targetLang]);

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
      <main className="min-h-screen bg-hero">
        <section className="container py-8 md:py-12 px-4 max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Medical Hebrew Quiz
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              Test your knowledge of medical Hebrew terms. Choose the correct translation and track your progress.
            </p>
          </header>

          <nav aria-label="Quiz toolbar" className="mb-8">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 md:p-6">
              <h2 className="sr-only">Quiz Settings</h2>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <label htmlFor="category-select" className="text-sm font-medium text-foreground">
                    Category Filter
                  </label>
                  <select
                    id="category-select"
                    value={selectedCategory ?? ""}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="min-w-[160px] px-3 py-2 bg-background border border-input rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-describedby="category-help"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <span id="category-help" className="sr-only">
                    Filter questions by medical category
                  </span>
                </div>

                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <label htmlFor="language-select" className="text-sm font-medium text-foreground">
                    Translation Language
                  </label>
                  <select
                    id="language-select"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value as Lang)}
                    className="min-w-[160px] px-3 py-2 bg-background border border-input rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-describedby="language-help"
                  >
                    <option value="en">English</option>
                    <option value="rus">Russian</option>
                  </select>
                  <span id="language-help" className="sr-only">
                    Choose the language for answer options
                  </span>
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
                <div className="mt-2 max-w-md mx-auto">
                  <div 
                    className="w-full bg-muted rounded-full h-2"
                    role="progressbar"
                    aria-valuenow={currentIndex + 1}
                    aria-valuemin={1}
                    aria-valuemax={words.length}
                    aria-label="Quiz progress"
                  >
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                    />
                  </div>
                </div>
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
