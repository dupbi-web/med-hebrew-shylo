import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
  const [targetLang, setTargetLang] = useState<Lang>("en");
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
        <section className="container py-12 md:py-16">
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Medical Hebrew Quiz</h1>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">Choose the correct meaning of the Hebrew term. You can switch between English or Russian translation mode.</p>
          </header>

          <div className="mb-6 flex flex-wrap justify-center gap-4">
            <label className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Category:</span>
              <select
                value={selectedCategory ?? ""}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="">All</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Translate to:</span>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value as Lang)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="en">English</option>
                <option value="rus">Russian</option>
              </select>
            </label>
          </div>

          {isDone ? (
            <div className="text-center p-10 border rounded shadow-md bg-blue-100 text-blue-800 font-semibold text-2xl">
              🏁 Quiz Complete!
              <p className="mt-2">You got {score} out of {words.length} correct.</p>
              <div className="mt-4">
                <Button onClick={restartQuiz}>Restart Quiz</Button>
              </div>
            </div>
          ) : current ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-semibold">What does:</h2>
                <h3 className="text-4xl md:text-5xl font-bold text-primary mt-4" dir="rtl">{current.he}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                {options.map((opt) => {
                  const isCorrect = opt === current[targetLang];
                  const isSelected = opt === selected;

                  return (
                    <button
                      key={opt}
                      className={`p-4 border rounded-lg transition-all ${
                        selected
                          ? isCorrect
                            ? "bg-green-100 border-green-500"
                            : isSelected
                            ? "bg-red-100 border-red-500"
                            : "opacity-50"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => handleSelect(opt)}
                      disabled={!!selected}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 text-center text-sm text-muted-foreground">
                Question {currentIndex + 1} of {words.length}
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground">Loading quiz...</p>
          )}
        </section>
      </main>
    </>
  );
};

export default Quiz;
