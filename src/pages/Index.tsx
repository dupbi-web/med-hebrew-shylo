import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Flashcard from "@/components/Flashcard";
import { sampleWords, type Word } from "@/data/medical-words";

const Index = () => {
  const [words, setWords] = useState<Word[]>(sampleWords);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [importText, setImportText] = useState("");

  const current = words[index];

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

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText) as Word[];
      if (!Array.isArray(parsed) || !parsed.every((w) => typeof w.en === "string" && typeof w.he === "string")) {
        alert("Invalid JSON format. Expect an array of { en, he }.");
        return;
      }
      setWords(parsed);
      setIndex(0);
      setFlipped(false);
    } catch (e) {
      alert("Could not parse JSON. Please check your data.");
    }
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

          {current && (
            <Flashcard
              en={current.en}
              he={current.he}
              flipped={flipped}
              onToggle={() => setFlipped((f) => !f)}
            />
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
                  <Button onClick={handleImport}>Load</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;
