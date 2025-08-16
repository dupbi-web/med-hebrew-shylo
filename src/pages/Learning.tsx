import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Target, Trophy, ArrowLeft } from "lucide-react";

interface Word {
  en: string;
  he: string;
  rus: string;
  category: string;
}

interface GameCard extends Word {
  correctCount: number;
  mastered: boolean;
}

interface Category {
  name: string;
  cards: GameCard[];
  completed: boolean;
  progress: number;
}

const Learning = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentCard, setCurrentCard] = useState<GameCard | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | null; message: string }>({ type: null, message: '' });
  const [gameMode, setGameMode] = useState<'categories' | 'playing'>('categories');
  const [showAnswer, setShowAnswer] = useState(false);

  // Fetch categories from supabase
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("medical_terms").select("category");
      if (error || !data) return;

      // Get unique category names
      const uniqueCategories = Array.from(new Set(data.map((row: { category: string }) => row.category)));

      // For each category, fetch its words
      const fetchAllCategoryWords = async () => {
        const categoriesArray: Category[] = [];
        for (const name of uniqueCategories) {
          const { data: wordsData, error: wordsError } = await supabase
            .from("medical_terms")
            .select("en, he, rus, category")
            .eq("category", name);

          const cards: GameCard[] = (wordsData || []).map((word: Word) => ({
            ...word,
            correctCount: 0,
            mastered: false
          }));

          categoriesArray.push({
            name,
            cards,
            completed: false,
            progress: 0
          });
        }
        setCategories(categoriesArray);
      };

      fetchAllCategoryWords();
    };

    fetchCategories();
  }, []);

  const startCategory = (category: Category) => {
    setSelectedCategory(category);
    setGameMode('playing');
    nextCard(category);
  };

  const nextCard = (category: Category) => {
    const unmastered = category.cards.filter(card => !card.mastered);
    if (unmastered.length === 0) {
      completeCategory(category);
      return;
    }

    const randomCard = unmastered[Math.floor(Math.random() * unmastered.length)];
    setCurrentCard(randomCard);

    // Generate options (correct answer + 3 random wrong answers from all words)
    const correctAnswer = randomCard.he;
    const allWords = categories.flatMap(cat => cat.cards);
    const wrongAnswers = allWords
      .filter(word => word.he !== correctAnswer)
      .map(word => word.he)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setFeedback({ type: null, message: '' });
    setShowAnswer(false);
  };

  const handleAnswer = (selectedAnswer: string) => {
    if (!currentCard || !selectedCategory) return;

    const isCorrect = selectedAnswer === currentCard.he;
    setShowAnswer(true);

    if (isCorrect) {
      setFeedback({ type: 'correct', message: 'Correct! Well done!' });

      // Update card progress
      const updatedCard = { ...currentCard, correctCount: currentCard.correctCount + 1 };
      if (updatedCard.correctCount >= 2) {
        updatedCard.mastered = true;
      }

      // Update selected category cards
      const updatedCards = selectedCategory.cards.map(card =>
        card.en === currentCard.en ? updatedCard : card
      );
      const masteredCount = updatedCards.filter(card => card.mastered).length;
      const progress = (masteredCount / updatedCards.length) * 100;
      const completed = masteredCount === updatedCards.length;

      // Update categories array
      const updatedCategories = categories.map(cat =>
        cat.name === selectedCategory.name
          ? { ...cat, cards: updatedCards, progress, completed }
          : cat
      );

      setCategories(updatedCategories);
      setSelectedCategory({ ...selectedCategory, cards: updatedCards, progress, completed });

      setTimeout(() => nextCard({ ...selectedCategory, cards: updatedCards, progress, completed }), 1000);
    } else {
      setFeedback({ type: 'incorrect', message: `Incorrect. The correct answer is: ${currentCard.he}` });

      // Reset correct count for this card
      const updatedCards = selectedCategory.cards.map(card =>
        card.en === currentCard.en ? { ...card, correctCount: 0 } : card
      );

      const updatedCategories = categories.map(cat =>
        cat.name === selectedCategory.name
          ? { ...cat, cards: updatedCards }
          : cat
      );

      setCategories(updatedCategories);
      setSelectedCategory({ ...selectedCategory, cards: updatedCards });

      setTimeout(() => nextCard({ ...selectedCategory, cards: updatedCards }), 2000);
    }
  };

  const completeCategory = (category: Category) => {
    setFeedback({ type: 'correct', message: `🎉 Category "${category.name}" completed! All words mastered!` });
    setTimeout(() => {
      setGameMode('categories');
      setSelectedCategory(null);
      setCurrentCard(null);
    }, 3000);
  };

  const backToCategories = () => {
    setGameMode('categories');
    setSelectedCategory(null);
    setCurrentCard(null);
    setFeedback({ type: null, message: '' });
  };

  const overallProgress = categories.length > 0
    ? categories.reduce((sum, cat) => sum + cat.progress, 0) / categories.length
    : 0;

  if (gameMode === 'categories') {
    return (
      <>
        <Helmet>
          <title>Learning - Medical Terms Game</title>
          <meta name="description" content="Interactive learning platform for medical terms in Hebrew. Master medical vocabulary through engaging card-based gameplay." />
        </Helmet>

        <div className="container mx-auto max-w-6xl space-y-8">
          <header className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Learning Center</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Master medical terms through interactive card-based learning. Complete categories by correctly identifying translations twice in a row.
            </p>

            <div className="flex items-center justify-center gap-4 p-6 bg-card rounded-lg border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{Math.round(overallProgress)}%</div>
                <div className="text-sm text-muted-foreground">Overall Progress</div>
              </div>
              <Progress value={overallProgress} className="w-48" />
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {categories.filter(cat => cat.completed).length}/{categories.length}
                </div>
                <div className="text-sm text-muted-foreground">Categories Complete</div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card
                key={category.name}
                className={`cursor-pointer transition-all hover:shadow-elegant ${
                  category.completed ? 'bg-primary/5 border-primary' : 'hover:border-primary/50'
                }`}
                onClick={() => startCategory(category)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {category.completed ? <Trophy className="h-5 w-5 text-primary" /> : <BookOpen className="h-5 w-5" />}
                      {category.name}
                    </CardTitle>
                    {category.completed && <Badge variant="secondary">Complete</Badge>}
                  </div>
                  <CardDescription>
                    {category.cards.length} medical terms to master
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(category.progress)}%</span>
                  </div>
                  <Progress value={category.progress} />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Mastered</span>
                    <span className="font-medium">
                      {category.cards.filter(card => card.mastered).length}/{category.cards.length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Learning - {selectedCategory?.name} - Medical Terms Game</title>
        <meta name="description" content={`Learning ${selectedCategory?.name} medical terms in Hebrew through interactive gameplay.`} />
      </Helmet>

      <div className="container mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between">
          <Button variant="outline" onClick={backToCategories} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{selectedCategory?.name}</h1>
            <p className="text-muted-foreground">
              {selectedCategory && selectedCategory.cards.filter(card => card.mastered).length}/{selectedCategory.cards.length} mastered
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">{Math.round(selectedCategory?.progress || 0)}%</div>
            <Progress value={selectedCategory?.progress || 0} className="w-24" />
          </div>
        </header>

        {currentCard && (
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Target className="h-6 w-6 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Need {2 - currentCard.correctCount} more correct answers to master
                </span>
              </div>
              <CardTitle className="text-3xl font-bold text-center">
                {currentCard.rus}
              </CardTitle>
              <CardDescription className="text-lg">
                Select the correct Hebrew translation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {options.map((option, index) => (
                  <Button
                    key={index}
                    variant={showAnswer ?
                      (option === currentCard.he ? "default" : "outline") :
                      "outline"
                    }
                    size="lg"
                    onClick={() => handleAnswer(option)}
                    disabled={showAnswer}
                    className={`p-6 text-lg ${
                      showAnswer && option === currentCard.he ?
                      "bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {feedback.type && (
                <div className={`p-4 rounded-lg text-center font-medium ${
                  feedback.type === 'correct'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-destructive/10 text-destructive border border-destructive/20'
                }`}>
                  {feedback.message}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default Learning;