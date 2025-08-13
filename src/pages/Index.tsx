import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Flashcard from "@/components/Flashcard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

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

const CATEGORIES = [
  "Anatomy", "Symptom", "Treatment", "Procedure", "Facility", "Measurement", "Injury",
  "Condition", "Pathogen", "Tool", "Equipment", "General", "Personnel", "Specialty"
] as const;

const Index = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [importText, setImportText] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [englishTerm, setEnglishTerm] = useState("");
  const [hebrewTerm, setHebrewTerm] = useState("");
  const [russianTerm, setRussianTerm] = useState("");
  const [category, setCategory] = useState("");
  const [targetLang, setTargetLang] = useState<"rus" | "en">("rus");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const total = words.length;
  const current = words[index];
  const isDone = !current && total > 0;

  // Fetch words from Supabase
  const fetchWords = useCallback(async (categoryFilter?: string | null) => {
    setLoading(true);
    let query = supabase.from("medical_terms").select("en, he, rus, category");

    if (categoryFilter) {
      query = query.eq("category", categoryFilter);
    }

    const { data, error } = await query.order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Failed to load words", description: error.message });
      setLoading(false);
      return;
    }

    const mapped = (data ?? []).map((w) => ({
      en: w.en?.trim() || "",
      he: w.he?.trim() || "",
      rus: w.rus?.trim() || "",
      category: w.category ?? null
    })) as Word[];

    setWords(mapped);
    setIndex(0);
    setFlipped(false);
    setLoading(false);
  }, []);

  // Refetch when category changes
  useEffect(() => {
    fetchWords(selectedCategory);
  }, [fetchWords, selectedCategory]);

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

  // Bulk import
  const handleImport = async () => {
    try {
      const parsed = JSON.parse(importText) as Array<Partial<Word>>;
      if (!Array.isArray(parsed)) {
        toast({ title: "Invalid JSON", description: "Expected an array of word objects." });
        return;
      }

      const cleaned = parsed
        .map((w) => ({
          en: w.en?.toString().trim() || "",
          he: w.he?.toString().trim() || "",
          rus: w.rus?.toString().trim() || "",
          category: w.category?.toString().trim() || null
        }))
        .filter((w) => w.en && w.he);

      if (!cleaned.length) {
        toast({ title: "Nothing to import", description: "English and Hebrew are required." });
        return;
      }

      if (!window.confirm(`Import ${cleaned.length} terms?`)) return;

      const { error } = await supabase.from("medical_terms").insert(cleaned);
      if (error) {
        toast({ title: "Import failed", description: error.message });
        return;
      }

      setImportText("");
      await fetchWords(selectedCategory);
      toast({ title: "Imported", description: `Added ${cleaned.length} words.` });
    } catch {
      toast({ title: "Parse error", description: "Invalid JSON format." });
    }
  };

  // Admin auth (now uses env var fallback)
  const handleAuth = () => {
    const expectedPass = import.meta.env.VITE_ADMIN_PASSWORD || "";
    if (adminPassword === expectedPass) {
      setIsAuthed(true);
      setAdminPassword("");
      toast({ title: "Admin unlocked" });
    } else {
      toast({ title: "Wrong password", description: "Please try again." });
    }
  };

  // Add single word
  const handleAddWord = async () => {
    const en = englishTerm.trim();
    const he = hebrewTerm.trim();
    const ru = russianTerm.trim();
    const cat = category.trim();

    if (!en || !he) {
      toast({ title: "Missing fields", description: "English and Hebrew are required." });
      return;
    }
    const hebrewRegex = /[\u0590-\u05FF]/;
    if (!hebrewRegex.test(he)) {
      toast({ title: "Invalid Hebrew", description: "Please use Hebrew characters." });
      return;
    }

    const { error } = await supabase.from("medical_terms").insert([
      { en, he, rus: ru || null, category: cat || null }
    ]);
    if (error) {
      toast({ title: "Add failed", description: error.message });
      return;
    }

    setEnglishTerm("");
    setHebrewTerm("");
    setRussianTerm("");
    setCategory("");
    await fetchWords(selectedCategory);
    toast({ title: "Word added", description: "Added successfully." });
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

      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold">Medical Hebrew Flashcards</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          English or Russian → Hebrew practice cards with a clean flip animation. 
          Use arrow keys, press Space to flip, and shuffle anytime.
        </p>
      </header>

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap justify-center gap-4">
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Filter by Category:</span>
          <select
            value={selectedCategory ?? ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="">All</option>
            {CATEGORIES.map((cat) => (
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
      {loading ? (
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

      {/* Extra Links */}
      <main className="min-h-screen bg-hero">
        <section className="container py-12 md:py-16">
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/quiz"><Button variant="outline">Take Quiz</Button></Link>
            <Link to="/practice"><Button variant="outline">Practice</Button></Link>
            <Link to="/TypingGame"><Button variant="outline">Practice</Button></Link>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;
