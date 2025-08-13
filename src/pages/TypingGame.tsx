import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

type Word = {
  en: string;
  he: string;
  rus: string;
};

type Mode = "EN→HE" | "RU→HE" | "HE→EN" | "HE→RU";

const TypingGame = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<Mode>("EN→HE");

  const current = words[currentIndex];

  useEffect(() => {
    if (running && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0) setRunning(false);
  }, [running, timeLeft]);

  const fetchWords = async () => {
    const { data, error } = await supabase.from("medical_terms").select("en, he, rus");
    if (error) {
      toast({ title: "Error loading words", description: error.message });
      return;
    }
    setWords(data.sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(60);
    setRunning(true);
  };

  const stopGame = () => setRunning(false);

  const getPrompt = (word: Word) => {
    switch (mode) {
      case "EN→HE": return word.en;
      case "RU→HE": return word.rus;
      case "HE→EN": return word.he;
      case "HE→RU": return word.he;
    }
  };

  const getAnswer = (word: Word) => {
    switch (mode) {
      case "EN→HE": return word.he;
      case "RU→HE": return word.he;
      case "HE→EN": return word.en;
      case "HE→RU": return word.rus;
    }
  };

  const checkAnswer = () => {
    if (!current) return;

    const correctAnswer = getAnswer(current);

    if (input.trim() === correctAnswer.trim()) {
      setScore((s) => s + 10);
      setCurrentIndex((i) => (i + 1) % words.length);
    } else {
      setScore((s) => s - 5);
      toast({ title: "Wrong", description: `Correct: ${correctAnswer}` });
    }
    setInput("");
  };

  const isRTL = () => mode.includes("HE");

  return (
    <>
      <Helmet>
        <title>Typing Game</title>
      </Helmet>

      <main className="min-h-screen bg-background">
        <section className="container py-12 md:py-16">
          <header className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Typing Game</h1>
          </header>

          <div className="max-w-lg mx-auto text-center py-10">
            {!running ? (
              <Button onClick={fetchWords}>Start Game</Button>
            ) : (
              <>
                <div className="flex justify-between mb-4">
                  <span>Score: {score}</span>
                  <span>Time: {timeLeft}s</span>
                </div>

                <div className="mb-4 flex flex-wrap justify-center gap-2">
                  {["EN→HE","RU→HE","HE→EN","HE→RU"].map((m) => (
                    <Button
                      key={m}
                      onClick={() => setMode(m as Mode)}
                      variant={mode === m ? "default" : "outline"}
                    >
                      {m}
                    </Button>
                  ))}
                </div>

                {current && (
                  <>
                    <p className="text-xl mb-2">{getPrompt(current)}</p>

                    <input
                      dir={isRTL() ? "rtl" : "ltr"}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                      className="border p-2 w-full text-right"
                      placeholder={isRTL() ? "הקלד כאן" : "Type here"}
                    />

                    <div className="mt-4 flex justify-center gap-4">
                      <Button onClick={checkAnswer}>Submit</Button>
                      <Button onClick={stopGame} variant="secondary">Stop Game</Button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default TypingGame;
