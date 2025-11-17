import { useEffect, useState } from "react";
import { useMedicalTerms } from "@/hooks/queries/useMedicalTerms";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/common";

type Word = {
  en: string;
  he: string;
  rus: string;
};

type Mode = "EN→HE" | "RU→HE" | "HE→EN" | "HE→RU";

const TypingGame = () => {
  const { data: allMedicalTerms = [], isLoading } = useMedicalTerms();
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<Mode>("EN→HE");
  const [toastMsg, setToastMsg] = useState<{ title: string; description: string; type: "success" | "error" | null } | null>(null);
  const [showAnswerOnWrong, setShowAnswerOnWrong] = useState(true);

  const current = words[currentIndex];

  useEffect(() => {
    if (running && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0) setRunning(false);
  }, [running, timeLeft]);

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const fetchWords = () => {
    const words = allMedicalTerms.map(w => ({
      en: w.en,
      he: w.he,
      rus: w.rus
    }));
    setWords(words.sort(() => Math.random() - 0.5));
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
      setToastMsg({ title: "נכון!", description: "כל הכבוד!", type: "success" });
    } else {
      setScore((s) => s - 5);
      setToastMsg({
        title: "שגוי",
        description: showAnswerOnWrong ? `התשובה הנכונה: ${correctAnswer}` : "",
        type: "error"
      });
    }
    setInput("");
  };

  const isRTL = () => mode.includes("HE");

  return (
    <>
      <Helmet>
        <title>Typing Game</title>
      </Helmet>

      <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <PageContainer maxWidth="2xl" padding={false} className="py-8 md:py-12">
          {!running ? (
            <div className="text-center">
              <PageHeader
                title="Typing Challenge"
                subtitle="Test your speed and accuracy with medical terminology"
                className="mb-8"
              />
              <div className="bg-card border rounded-2xl p-8 shadow-lg">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">Ready to Start?</h2>
                    <p className="text-muted-foreground">
                      You'll have 60 seconds to type as many correct translations as possible
                    </p>
                  </div>
                  <Button onClick={fetchWords} size="lg" className="text-lg px-8 py-6">
                    Start Game
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Score and Timer */}
                <div className="bg-card border rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Score</span>
                      <span className="text-2xl font-bold text-primary">{score}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Time</span>
                      <span className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-destructive' : 'text-foreground'}`}>
                        {timeLeft}s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mode Selection */}
                <div className="bg-card border rounded-xl p-4 shadow-sm">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Translation Mode</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {["EN→HE","RU→HE","HE→EN","HE→RU"].map((m) => (
                      <Button
                        key={m}
                        onClick={() => setMode(m as Mode)}
                        variant={mode === m ? "default" : "outline"}
                        size="sm"
                        className="font-mono"
                      >
                        {m}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Game Area */}
                {current && (
                  <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <div className="text-center mb-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Translate this word:</h3>
                      <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                        {getPrompt(current)}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <input
                        dir={isRTL() ? "rtl" : "ltr"}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                        className="w-full h-14 px-4 text-lg border border-input rounded-lg bg-background text-center focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                        placeholder={isRTL() ? "הקלד כאן..." : "Type here..."}
                        autoFocus
                      />

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          onClick={checkAnswer} 
                          size="lg" 
                          className="flex-1 sm:flex-none px-8"
                          disabled={!input.trim()}
                        >
                          Submit Answer
                        </Button>
                        <Button 
                          onClick={stopGame} 
                          variant="outline" 
                          size="lg"
                          className="flex-1 sm:flex-none"
                        >
                          End Game
                        </Button>
                        {/* Show answer on wrong checkbox */}
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            id="showAnswerOnWrong"
                            checked={showAnswerOnWrong}
                            onChange={() => setShowAnswerOnWrong((v) => !v)}
                          />
                          <label htmlFor="showAnswerOnWrong" className="text-sm text-muted-foreground cursor-pointer">
                            Show Answer
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </PageContainer>
        </main>

      {/* Toast Popup - middle bottom */}
      {toastMsg && (
        <div
          className={`fixed z-50 left-1/2 bottom-10 transform -translate-x-1/2 transition-all`}
          style={{
            minWidth: "260px",
            maxWidth: "90vw",
            background: toastMsg.type === "success" ? "#d1fae5" : "#fee2e2",
            color: toastMsg.type === "success" ? "#065f46" : "#991b1b",
            borderRadius: "1rem",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            padding: "1rem 1.5rem",
            textAlign: "center",
            fontWeight: 500,
            fontSize: "1.1rem",
          }}
        >
          <div>{toastMsg.title}</div>
          <div style={{ fontSize: "0.95rem", fontWeight: 400 }}>{toastMsg.description}</div>
        </div>
      )}
    </>
  );
};

export default TypingGame;
