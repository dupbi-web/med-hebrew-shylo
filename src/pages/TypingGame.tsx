import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

type Lang = "en" | "he" | "rus";
type Word = { en: string; he: string; rus: string };

const TypingGame = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [fromLang, setFromLang] = useState<Lang>("en");
  const [toLang, setToLang] = useState<Lang>("he");

  const current = words[currentIndex];

  useEffect(() => {
    if (running && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0) setRunning(false);
  }, [running, timeLeft]);

  const fetchWords = async () => {
    const { data, error } = await supabase
      .from("medical_terms")
      .select("en, he, rus");
    if (error) {
      toast({ title: "Error loading words", description: error.message });
      return;
    }
    setWords((data ?? []).sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(60);
    setRunning(true);
  };

  const checkAnswer = () => {
    if (!current) return;
    const correct = current[toLang].trim();
    if (input.trim() === correct) {
      setScore((s) => s + 10);
      setCurrentIndex((i) => (i + 1) % words.length);
    } else {
      setScore((s) => s - 5);
      toast({ title: "Wrong", description: `Correct: ${correct}` });
    }
    setInput("");
  };

  return (
    <main className="min-h-screen bg-background">
      <Helmet>
        <title>Typing Game</title>
      </Helmet>

      <section className="container py-12 md:py-16">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Typing Game
          </h1>
        </header>

        <div className="max-w-lg mx-auto text-center py-10">
          {!running ? (
            <>
              <div className="flex gap-4 justify-center mb-4">
                <select
                  value={fromLang}
                  onChange={(e) => setFromLang(e.target.value as Lang)}
                  className="border p-2 rounded"
                >
                  <option value="en">English</option>
                  <option value="rus">Russian</option>
                  <option value="he">Hebrew</option>
                </select>

                <select
                  value={toLang}
                  onChange={(e) => setToLang(e.target.value as Lang)}
                  className="border p-2 rounded"
                >
                  <option value="en">English</option>
                  <option value="rus">Russian</option>
                  <option value="he">Hebrew</option>
                </select>
              </div>

              {fromLang === toLang && (
                <p className="text-red-500 mb-2">
                  Languages must be different
                </p>
              )}

              <Button onClick={fetchWords} disabled={fromLang === toLang}>
                Start Game
              </Button>
            </>
          ) : (
            <>
              <div className="flex justify-between mb-4">
                <span>Score: {score}</span>
                <span>Time: {timeLeft}s</span>
              </div>

              {current && (
                <>
                  <p className="text-xl mb-2">{current[fromLang]}</p>
                  <input
                    dir={toLang === "he" ? "rtl" : "ltr"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                    className={`border p-2 w-full ${
                      toLang === "he" ? "text-right" : "text-left"
                    }`}
                    placeholder={`Type in ${toLang.toUpperCase()}`}
                  />
                  <Button onClick={checkAnswer} className="mt-4">
                    Submit
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </section>

      <div className="mt-8 flex justify-center gap-4">
        <Link to="/">
          <Button variant="outline">Home</Button>
        </Link>
        <Link to="/quiz">
          <Button variant="outline">Take Quiz</Button>
        </Link>
      </div>
    </main>
  );
};

export default TypingGame;
