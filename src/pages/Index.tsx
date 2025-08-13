import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Flashcard from "@/components/Flashcard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Word = { en: string; he: string; rus: string };

const ADMIN_PASSWORD = "medadmin";

function shuffleCopy<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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
const [targetLang, setTargetLang] = useState<"en" | "rus">("en");
  const current = words[index];

  const fetchWords = async () => {
    const { data, error } = await supabase
      .from("medical_terms_tripple")
      .select("en, he, rus")
      .order("created_at", { ascending: true });
    if (error) {
      toast({ title: "Failed to load words", description: error.message });
      setLoading(false);
      return;
    }
    const mapped = (data ?? []).map((w) => ({ en: w.en, he: w.he, rus: (w as any).rus ?? "" })) as Word[];
    setWords(shuffleCopy(mapped));
    setIndex(0);
    setFlipped(false);
    setLoading(false);
  };

  useEffect(() => {
    fetchWords();
  }, []);

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
      const parsed = JSON.parse(importText) as Word[];
      if (!Array.isArray(parsed) || !parsed.every((w) => typeof w.en === "string" && typeof w.he === "string")) {
        toast({ title: "Invalid JSON", description: "Expect an array of { en, he }." });
        return;
      }
      const payload = parsed.map((w) => ({ en: w.en, he: w.he, rus: (w as any).rus ?? null }));
      const { error } = await supabase.from("medical_terms_tripple").insert(payload);
      if (error) {
        toast({ title: "Import failed", description: error.message });
        return;
      }
      setImportText("");
      await fetchWords();
      toast({ title: "Imported", description: `Loaded ${parsed.length} words.` });
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
    if (!en || !he) {
      toast({ title: "Missing fields", description: "Both English and Hebrew are required." });
      return;
    }
    const hebrewRegex = /[\u0590-\u05FF]/;
    if (!hebrewRegex.test(he)) {
      toast({ title: "Hebrew validation", description: "Please use Hebrew characters." });
      return;
    }
    const { error } = await supabase.from("medical_terms_tripple").insert([{ en, he, rus: null }]);
    if (error) {
      toast({ title: "Add failed", description: error.message });
      return;
    }
    setEnglishTerm("");
    setHebrewTerm("");
    await fetchWords();
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
            <p className="text-center text-muted-foreground">{loading ? "Loading words..." : "No words yet. Add some in the Admin panel."}</p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant={targetLang === "en" ? "default" : "outline"} onClick={() => setTargetLang("en")} aria-label="English to Hebrew">EN→HE</Button>
            <Button variant={targetLang === "rus" ? "default" : "outline"} onClick={() => setTargetLang("rus")} aria-label="Russian to Hebrew">RU→HE</Button>
            <Button variant="secondary" onClick={prev} aria-label="Previous card">Previous</Button>
            <Button onClick={() => setFlipped((f) => !f)} aria-label="Flip card">{flipped ? "Hide" : "Show"} Answer</Button>
            <Button variant="secondary" onClick={next} aria-label="Next card">Next</Button>
            <Button onClick={shuffle} aria-label="Shuffle cards">Shuffle</Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" aria-label="Import JSON">Import JSON</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import words JSON</DialogTitle>
                </DialogHeader>
                <Textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='Paste an array like [{"en":"Doctor","he":"רופא"}]'
                  className="min-h-40"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setImportText("")}>Clear</Button>
                  <Button onClick={handleImport}>Upload to Database</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" aria-label="Admin panel">Admin</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Admin Panel</DialogTitle>
                </DialogHeader>
                {!isAuthed ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Enter password to access admin tools.</p>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleAuth}>Continue</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label className="text-sm">English Term</label>
                      <Input
                        value={englishTerm}
                        onChange={(e) => setEnglishTerm(e.target.value)}
                        placeholder="Antiseptic"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm">Hebrew Term</label>
                      <Input
                        dir="rtl"
                        value={hebrewTerm}
                        onChange={(e) => setHebrewTerm(e.target.value)}
                        placeholder="חיטוי"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={() => { setEnglishTerm(""); setHebrewTerm(""); }}>Clear</Button>
                      <Button onClick={handleAddWord}>Add Word</Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;
