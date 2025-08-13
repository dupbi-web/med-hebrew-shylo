import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const TypingGame = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [targetLang, setTargetLang] = useState<"en" | "rus">("en");

  const current = words[currentIndex];

  useEffect(() => {
    if (running && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
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
    setWords(data.sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(60);
    setRunning(true);
  };

  const checkAnswer = () => {
    if (!current) return;
    if (input.trim() === current.he.trim()) {
      setScore(s => s + 10);
      setCurrentIndex(i => (i + 1) % words.length);
    } else {
      setScore(s => s - 5);
      toast({ title: "Wrong", description: `Correct: ${current.he}` });
    }
    setInput("");
  };
  return (
    <>
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
            {current && (
                <>
                <p className="text-xl mb-2">
                    {targetLang === "en" ? current.en : current.rus}
                </p>
                <input
                    dir="rtl"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                    className="border p-2 w-full text-right"
                    placeholder="הקלד כאן"
                />
                <Button onClick={checkAnswer} className="mt-4">Submit</Button>
                </>
            )}
            </>
        )}
        </div>
        </section>
        <div className="mt-8 flex justify-center gap-4">
            <Link to="/home">
            <Button variant="outline">Home</Button>
          </Link>
          <Link to="/quiz">
            <Button variant="outline">Take Quiz</Button>
          </Link>
          <Link to="/practice">
            <Button variant="outline">Practice</Button>
          </Link>
        </div>
      </main>
    </>
  );
};

export default TypingGame;
