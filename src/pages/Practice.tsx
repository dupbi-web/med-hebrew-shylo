import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
type Word = {
  en: string;
  he: string;
  rus: string;
  category?: string | null;
};

const shuffleArray = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const Practice = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [targetLang, setTargetLang] = useState<"en" | "rus">("en");

  const current = words[currentIndex];

  const fetchWords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("medical_terms_tripple")
      .select("en, he, rus, category");

    if (error) {
      toast({ title: "Error loading words", description: error.message });
      setLoading(false);
      return;
    }

    const cleaned = (data ?? []).filter((w) => w.en && w.he);
    setWords(shuffleArray(cleaned));
    setCurrentIndex(0);
    setShowAnswer(false);
    setLoading(false);
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const next = () => {
    if (currentIndex + 1 < words.length) {
      setCurrentIndex((i) => i + 1);
      setShowAnswer(false);
    } else {
      toast({ title: "Finished!", description: "You’ve gone through all the words." });
    }
  };

  return (
    <>
      <Helmet>
        <title>Practice Medical Hebrew</title>
        <meta name="description" content="Practice medical Hebrew by translating from English or Russian to Hebrew." />
      </Helmet>

      <main className="min-h-screen bg-background">
        <section className="container py-12 md:py-16">
          <header className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Practice Mode</h1>
            <p className="mt-2 text-muted-foreground">Test yourself by translating Hebrew from English or Russian prompts.</p>
          </header>

          <div className="flex justify-center mb-6 gap-4">
            <Button
              variant={targetLang === "en" ? "default" : "outline"}
              onClick={() => setTargetLang("en")}
            >
              EN → HE
            </Button>
            <Button
              variant={targetLang === "rus" ? "default" : "outline"}
              onClick={() => setTargetLang("rus")}
            >
              RU → HE
            </Button>
            <Button onClick={fetchWords} variant="secondary">
              Shuffle / Restart
            </Button>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading words...</p>
          ) : !current ? (
            <p className="text-center text-muted-foreground">No words loaded.</p>
          ) : (
            <div className="max-w-xl mx-auto text-center border p-6 rounded shadow-md bg-white">
              <p className="text-sm text-muted-foreground mb-2">
                {targetLang === "en" ? "Translate from English" : "Translate from Russian"}
              </p>
              <h2 className="text-3xl font-bold mb-6">
                {targetLang === "en" ? current.en : current.rus}
              </h2>

              {showAnswer ? (
                <div className="text-4xl font-semibold text-green-700 mb-6" dir="rtl">
                  {current.he}
                </div>
              ) : (
                <Button onClick={() => setShowAnswer(true)}>Show Answer</Button>
              )}

              <div className="mt-6 flex justify-center">
                <Button onClick={next} variant="secondary">
                  Next
                </Button>
              </div>
            </div>
          )}
        </section>
                            <div className="mt-8 flex justify-center">
            <Link to="/quiz">
              <Button variant="outline">Take Quiz</Button>
            </Link>
            <Link to="/Practice">
              <Button variant="outline">Practice</Button>
            </Link>
        </div>
      </main>
    </>
  );
};

export default Practice;

