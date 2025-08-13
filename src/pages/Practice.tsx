import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Word = { en: string; he: string; rus: string };

const Practice = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [targetLang, setTargetLang] = useState<"en" | "rus">("en");
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);

  const current = words[index];

  const fetchWords = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("medical_terms_tripple").select("en, he, rus");

    if (error) {
      toast({ title: "Failed to load words", description: error.message });
      setLoading(false);
      return;
    }

    setWords(shuffleCopy((data ?? []) as Word[]));
    setIndex(0);
    setLoading(false);
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const shuffleCopy = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const checkAnswer = () => {
    const correct = targetLang === "en" ? current.en.trim().toLowerCase() : current.rus.trim().toLowerCase();
    const userInput = answer.trim().toLowerCase();

    if (userInput === correct) {
      setFeedback("correct");
      toast({ title: "✅ Correct!" });
    } else {
      setFeedback("wrong");
      toast({ title: "❌ Incorrect", description: `The correct answer is: ${correct}` });
    }

    setRevealed(true);
  };

  const next = () => {
    setIndex((i) => (i + 1) % words.length);
    setAnswer("");
    setFeedback(null);
    setRevealed(false);
  };

  return (
    <>
      <Helmet>
        <title>Practice | Medical Hebrew Flashcards</title>
        <meta name="description" content="Typing practice to improve recall of Hebrew medical terms." />
      </Helmet>
      <main className="min-h-screen bg-hero">
        <section className="container py-12 md:py-16">
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Practice Mode</h1>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Type the correct English or Russian translation for the Hebrew term shown. Switch languages below.
            </p>
          </header>

          <div className="mb-6 flex justify-center gap-3">
            <Button variant={targetLang === "en" ? "default" : "outline"} onClick={() => setTargetLang("en")}>
              EN → HE
            </Button>
            <Button variant={targetLang === "rus" ? "default" : "outline"} onClick={() => setTargetLang("rus")}>
              RU → HE
            </Button>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : current ? (
            <div className="max-w-md mx-auto text-center space-y-6">
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight bg-white rounded-lg shadow p-6">
                <span dir="rtl">{current.he}</span>
              </div>

              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={`Enter the ${targetLang === "en" ? "English" : "Russian"} translation`}
                className="text-lg"
                onKeyDown={(e) => {
                  if (e.key === "Enter") checkAnswer();
                }}
              />

              {!revealed ? (
                <Button onClick={checkAnswer} disabled={!answer.trim()}>
                  Submit
                </Button>
              ) : (
                <Button variant="secondary" onClick={next}>
                  Next
                </Button>
              )}

              {feedback && (
                <div className={`text-lg font-medium ${feedback === "correct" ? "text-green-600" : "text-red-600"}`}>
                  {feedback === "correct" ? "✅ Correct!" : `❌ Wrong. Correct: ${targetLang === "en" ? current.en : current.rus}`}
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No words loaded.</p>
          )}
                    <div className="mt-8 flex justify-center">
            <Link to="/quiz">
              <Button variant="outline">Take Quiz</Button>
            </Link>
            <Link to="/Practice">
              <Button variant="outline">Practice</Button>
            </Link>
        </div>
        </section>
      </main>
    </>
  );
};

export default Practice;
