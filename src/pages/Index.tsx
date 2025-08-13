import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Flashcard from "@/components/Flashcard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Word = { en: string; he: string; rus: string; category?: string | null };

const ADMIN_PASSWORD = "medadmin";

function shuffleCopy<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// *** Added Category List ***
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
  const [targetLang, setTargetLang] = useState<"en" | "rus">("en");

  // *** Added selectedCategory state for filtering ***
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const current = words[index];

  // *** Modified fetchWords to accept category and filter ***
  const fetchWords = async (categoryFilter?: string | null) => {
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

    // Fallback to old table if the new one is empty
    let rows: any[] = data ?? [];
    if (false) {
      const { data: legacy, error: legacyError } = await supabase
        .from("medical_terms")
        .select("en, he")
        .order("created_at", { ascending: true });
      if (legacyError) {
        toast({ title: "Failed to load words", description: legacyError.message });
        setLoading(false);
        return;
      }
      rows = legacy ?? [];
      if ((rows?.length ?? 0) > 0) {
        toast({ title: "Loaded legacy deck", description: "Using medical_terms until the new table has data." });
      }
    }

    const mapped = (rows ?? []).map((w: any) => ({ en: w.en, he: w.he, rus: w.rus ?? "", category: w.category ?? null })) as Word[];
    setWords(shuffleCopy(mapped));
    setIndex(0);
    setFlipped(false);
    setLoading(false);
  };

  // *** Updated useEffect to refetch when selectedCategory changes ***
  useEffect(() => {
    fetchWords(selectedCategory);
  }, [selectedCategory]);

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

  const next = () => {
    setIndex((i) => (i + 1) % words.length);
    setFlipped(false);
    setReviewed((r) => r + 1);
  };

  const prev = () => {
    setIndex((i) => (i - 1 + words.length) % words.length);
    setFlipped(false);
    setReviewed((r) => r + 1);
  };

  const shuffle = () => {
    const arr = [...words];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setWords(arr);
    setIndex(0);
    setFlipped(false);
  };


  const total = words.length;

  const handleImport = async () => {
    try {
      const parsed = JSON.parse(importText) as Array<Partial<Word> & { category?: string | null }>;
      if (!Array.isArray(parsed)) {
        toast({ title: "Invalid JSON", description: "Expect an array of { en, he, rus?, category? }." });
        return;
      }
      // Validate required fields and normalize
      const cleaned = parsed
        .map((w) => ({
          en: (w.en ?? "").toString().trim(),
          he: (w.he ?? "").toString().trim(),
          rus: (w as any).rus ? (w as any).rus.toString().trim() : null,
          category: (w as any).category ? (w as any).category.toString().trim() : null,
        }))
        .filter((w) => w.en.length > 0 && w.he.length > 0);

      if (cleaned.length === 0) {
        toast({ title: "Nothing to import", description: "Items must include non-empty en and he fields." });
        return;
      }

      const { error } = await supabase.from("medical_terms_tripple").insert(cleaned);
      if (error) {
        toast({ title: "Import failed", description: error.message });
        return;
      }
      setImportText("");
      await fetchWords(selectedCategory);
      toast({ title: "Imported", description: `Added ${cleaned.length} words.` });
    } catch (e) {
      toast({ title: "Parse error", description: "Could not parse JSON. Please check your data." });
    }
  };

  const handleAuth = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthed(true);
      setAdminPassword("");
      toast({ title: "Admin unlocked" });
    } else {
      toast({ title: "Wrong password", description: "Please try again." });
    }
  };

  const handleAddWord = async () => {
    const en = englishTerm.trim();
    const he = hebrewTerm.trim();
    const ru = russianTerm.trim();
    const cat = category.trim();
    if (!en || !he) {
      toast({ title: "Missing fields", description: "Both English and Hebrew are required." });
      return;
    }
    const hebrewRegex = /[\u0590-\u05FF]/;
    if (!hebrewRegex.test(he)) {
      toast({ title: "Hebrew validation", description: "Please use Hebrew characters." });
      return;
    }
    const { error } = await supabase.from("medical_terms_tripple").insert([{ en, he, rus: ru || null, category: cat || null }]);
    if (error) {
      toast({ title: "Add failed", description: error.message });
      return;
    }
    setEnglishTerm("");
    setHebrewTerm("");
    setRussianTerm("");
    setCategory("");
    await fetchWords(selectedCategory);
    toast({ title: "Word added", description: "The term has been added to your deck." });
  };

  // Signature gradient follows pointer
  useEffect(() => {
    const root = document.documentElement;
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      root.style.setProperty("--pointer-x", `${x}%`);
      root.style.setProperty("--pointer-y", `${y}%`);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <>
      <Helmet>
        <title>Medical Hebrew Flashcards | Learn Medical Terms</title>
        <meta name="description" content="Practice medical Hebrew with English-to-Hebrew flashcards. Flip, shuffle, and track your progress." />
        <link rel="canonical" href="/" />
        <meta property="og:title" content="Medical Hebrew Flashcards" />
        <meta property="og:description" content="Learn medical Hebrew with clean, responsive flashcards." />
      </Helmet>
      <main className="min-h-screen bg-hero">
        <section className="container py-12 md:py-16">
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Medical Hebrew Flashcards</h1>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">English → Hebrew practice cards with a clean flip animation. Use arrow keys or buttons, press Space to flip, and shuffle anytime.</p>
          </header>

          {/* *** Added category filter dropdown *** */}
          <div className="mb-6 flex flex-wrap justify-center gap-4">
            <label className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Filter by Category:</span>
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
          </div>

          <div className="mb-4 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <span>Card {index + 1} of {total}</span>
            <span aria-hidden>•</span>
            <span>Reviewed {reviewed}</span>
          </div>

          {current ? (
              <Flashcard
                translation={targetLang === "en" ? current.en : current.rus}
                targetLang={targetLang}
                he={current.he}
                flipped={flipped}
                onToggle={() => setFlipped((f) => !f)}
              />
          ) : (
            <p className="text-center text-muted-foreground">{loading ? "Loading words..." : "No words yet."}</p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant={targetLang === "en" ? "default" : "outline"} onClick={() => setTargetLang("en")} aria-label="English to Hebrew">EN→HE</Button>
            <Button variant={targetLang === "rus" ? "default" : "outline"} onClick={() => setTargetLang("rus")} aria-label="Russian to Hebrew">RU→HE</Button>
            <Button variant="secondary" onClick={prev} aria-label="Previous card">Previous</Button>
            <Button onClick={() => setFlipped((f) => !f)} aria-label="Flip card">{flipped ? "Hide" : "Show"} Answer</Button>
            <Button variant="secondary" onClick={next} aria-label="Next card">Next</Button>
            <Button onClick={shuffle} aria-label="Shuffle cards">Shuffle</Button>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;
