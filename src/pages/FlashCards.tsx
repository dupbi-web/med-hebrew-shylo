import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import Flashcard from "@/components/Flashcard";
import { useMedicalTerms } from "@/hooks/queries/useMedicalTerms";

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
const FlashCards = () => {
  const { data: allMedicalTerms = [], isLoading } = useMedicalTerms();
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [targetLang, setTargetLang] = useState<"rus" | "en">("rus");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

      <div className="container mx-auto max-w-6xl">
        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap justify-center gap-4">
          <label className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Filter by Category:</span>
            <select
              value={selectedCategory ?? ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="min-w-[160px] px-3 py-2 bg-background border border-input rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <option value="">All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mb-4 flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <span>Card {index + 1} of {total}</span>
          <span aria-hidden>•</span>
          <span>Reviewed {reviewed}</span>
        </div>

        {/* Main Flashcard Display */}
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading words...</p>
        ) : isDone ? (
          <div className="text-center p-10 border rounded shadow-md bg-green-100 text-green-800 font-semibold text-2xl">
            🎉 DONE! You’ve reached the end.
            <div className="mt-4">
              <Button onClick={restart}>Restart</Button>
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
          <p className="text-center text-muted-foreground">No words yet.</p>
        )}

        {/* Controls */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button variant={targetLang === "en" ? "default" : "outline"} onClick={() => setTargetLang("en")}>EN→HE</Button>
          <Button variant={targetLang === "rus" ? "default" : "outline"} onClick={() => setTargetLang("rus")}>RU→HE</Button>
          <Button variant="secondary" onClick={prev}>Previous</Button>
          <Button onClick={() => setFlipped((f) => !f)}>{flipped ? "Hide" : "Show"} Answer</Button>
          <Button variant="secondary" onClick={next}>Next</Button>
          <Button onClick={shuffle}>Shuffle</Button>
        </div>
      </div>
    </>
  );
};

export default FlashCards;
