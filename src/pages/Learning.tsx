// import { useEffect, useMemo, useState } from "react";
// import { Helmet } from "react-helmet-async";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import { Badge } from "@/components/ui/badge";
// import { getMedicalTerms } from "@/cache/medicalTermsCache";
// import { useLearningProgress } from "@/hooks/useLearningProgress";
// import { useAuth } from "@/hooks/useAuth";
// import { BookOpen, Target, Trophy, ArrowLeft, RotateCcw } from "lucide-react";

// interface Word {
//   en: string;
//   he: string;
//   rus: string;
//   category: string;
// }

// interface GameCard extends Word {
//   correctCount: number;
//   mastered: boolean;
// }

// interface Category {
//   name: string;
//   cards: GameCard[];
//   completed: boolean;
//   progress: number;
// }

// const Learning = () => {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [allWords, setAllWords] = useState<Word[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
//   const [currentCard, setCurrentCard] = useState<GameCard | null>(null);
//   const [options, setOptions] = useState<string[]>([]);
//   const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | null; message: string }>({ type: null, message: '' });
//   const [gameMode, setGameMode] = useState<'categories' | 'playing'>('categories');
//   const [showAnswer, setShowAnswer] = useState(false);
//   const [inMemoryCorrectCounts, setInMemoryCorrectCounts] = useState<Record<string, number>>({});

//   const { user } = useAuth();
//   const {
//     loadMasteredWords,
//     addMasteredWord,
//     removeMasteredWord,
//     isWordMastered,
//     resetProgress,
//     getMasteredWordsCount,
//     loading: progressLoading
//   } = useLearningProgress();

//   useEffect(() => {
//     const loadCategories = async () => {
//       const words = await getMedicalTerms();
//       setAllWords(words);

//       await loadMasteredWords();

//       const masteredMap: Record<string, boolean> = {};
//       for (const word of words) {
//         const key = `${word.category}_${word.en}`;
//         masteredMap[key] = isWordMastered(word.category, word.en);
//       }

//       const categoryMap: Record<string, GameCard[]> = {};
//       for (const word of words) {
//         if (!categoryMap[word.category]) categoryMap[word.category] = [];

//         const wordKey = `${word.category}_${word.en}`;
//         const mastered = masteredMap[wordKey];

//         categoryMap[word.category].push({
//           ...word,
//           correctCount: inMemoryCorrectCounts[wordKey] || 0,
//           mastered
//         });
//       }

//       const categoriesArray: Category[] = Object.entries(categoryMap).map(([name, cards]) => {
//         const masteredCount = cards.filter(card => card.mastered).length;
//         const progress = cards.length > 0 ? (masteredCount / cards.length) * 100 : 0;
//         const completed = masteredCount === cards.length && cards.length > 0;

//         return {
//           name,
//           cards,
//           completed,
//           progress
//         };
//       });

//       setCategories(categoriesArray);
//     };

//     if (user) {
//       loadCategories();
//     }
//   }, [user, loadMasteredWords, isWordMastered, inMemoryCorrectCounts]);

//   const startCategory = (category: Category) => {
//     setSelectedCategory(category);
//     setGameMode('playing');
//     nextCard(category);
//   };

//   const nextCard = (category: Category) => {
//     const unmastered = category.cards.filter(card => !card.mastered);
//     if (unmastered.length === 0) {
//       completeCategory(category);
//       return;
//     }

//     const randomCard = unmastered[Math.floor(Math.random() * unmastered.length)];
//     setCurrentCard(randomCard);

//     const correctAnswer = randomCard.he;
//     const wrongAnswers = allWords
//       .filter(word => word.he !== correctAnswer)
//       .map(word => word.he)
//       .sort(() => Math.random() - 0.5)
//       .slice(0, 3);

//     const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
//     setOptions(allOptions);
//     setFeedback({ type: null, message: '' });
//     setShowAnswer(false);
//   };

//   const handleAnswer = async (selectedAnswer: string) => {
//     if (!currentCard || !selectedCategory) return;

//     const isCorrect = selectedAnswer === currentCard.he;
//     setShowAnswer(true);

//     const wordKey = `${currentCard.category}_${currentCard.en}`;

//     if (isCorrect) {
//       setFeedback({ type: 'correct', message: 'Correct! Well done!' });

//       const newCorrectCount = (inMemoryCorrectCounts[wordKey] || 0) + 1;
//       setInMemoryCorrectCounts(prev => ({
//         ...prev,
//         [wordKey]: newCorrectCount
//       }));

//       if (newCorrectCount >= 2) {
//         await addMasteredWord(currentCard.category, currentCard.en);

//         const updatedCards = selectedCategory.cards.map(card =>
//           card.en === currentCard.en ? { ...card, mastered: true, correctCount: newCorrectCount } : card
//         );

//         const masteredCount = updatedCards.filter(card => card.mastered).length;
//         const progress = (masteredCount / updatedCards.length) * 100;
//         const completed = masteredCount === updatedCards.length;

//         const updatedCategory = { ...selectedCategory, cards: updatedCards, progress, completed };
//         const updatedCategories = categories.map(cat =>
//           cat.name === selectedCategory.name ? updatedCategory : cat
//         );

//         setCategories(updatedCategories);
//         setSelectedCategory(updatedCategory);

//         setTimeout(() => nextCard(updatedCategory), 1500);
//       } else {
//         const updatedCards = selectedCategory.cards.map(card =>
//           card.en === currentCard.en ? { ...card, correctCount: newCorrectCount } : card
//         );

//         const updatedCategory = { ...selectedCategory, cards: updatedCards };
//         setSelectedCategory(updatedCategory);

//         setTimeout(() => nextCard(updatedCategory), 1500);
//       }
//     } else {
//       setFeedback({ type: 'incorrect', message: `Incorrect. The correct answer is: ${currentCard.he}` });

//       setInMemoryCorrectCounts(prev => ({
//         ...prev,
//         [wordKey]: 0
//       }));

//       if (currentCard.mastered) {
//         await removeMasteredWord(currentCard.category, currentCard.en);

//         const updatedCards = selectedCategory.cards.map(card =>
//           card.en === currentCard.en ? { ...card, mastered: false, correctCount: 0 } : card
//         );

//         const masteredCount = updatedCards.filter(card => card.mastered).length;
//         const progress = (masteredCount / updatedCards.length) * 100;

//         const updatedCategory = { ...selectedCategory, cards: updatedCards, progress, completed: false };
//         const updatedCategories = categories.map(cat =>
//           cat.name === selectedCategory.name ? updatedCategory : cat
//         );

//         setCategories(updatedCategories);
//         setSelectedCategory(updatedCategory);
//       } else {
//         const updatedCards = selectedCategory.cards.map(card =>
//           card.en === currentCard.en ? { ...card, correctCount: 0 } : card
//         );

//         const updatedCategory = { ...selectedCategory, cards: updatedCards };
//         setSelectedCategory(updatedCategory);
//       }

//       setTimeout(() => nextCard(selectedCategory), 2000);
//     }
//   };

//   const handleResetProgress = async () => {
//     await resetProgress();
//     setInMemoryCorrectCounts({});

//     const words = await getMedicalTerms();
//     const categoryMap: Record<string, GameCard[]> = {};
//     for (const word of words) {
//       if (!categoryMap[word.category]) categoryMap[word.category] = [];
//       categoryMap[word.category].push({
//         ...word,
//         correctCount: 0,
//         mastered: false
//       });
//     }

//     const categoriesArray: Category[] = Object.entries(categoryMap).map(([name, cards]) => ({
//       name,
//       cards,
//       completed: false,
//       progress: 0
//     }));

//     setCategories(categoriesArray);
//   };

//   const completeCategory = (category: Category) => {
//     setFeedback({ type: 'correct', message: `🎉 Category "${category.name}" completed! All words mastered!` });
//     setTimeout(() => {
//       setGameMode('categories');
//       setSelectedCategory(null);
//       setCurrentCard(null);
//     }, 3000);
//   };

//   const backToCategories = () => {
//     setGameMode('categories');
//     setSelectedCategory(null);
//     setCurrentCard(null);
//     setFeedback({ type: null, message: '' });
//   };

//   const overallProgress = categories.length > 0
//     ? categories.reduce((sum, cat) => sum + cat.progress, 0) / categories.length
//     : 0;

//   // Render category selection view
//   if (gameMode === 'categories') {
//     return (
//       <>
//         <Helmet>
//           <title>Learning - Medical Terms Game</title>
//         </Helmet>
//         <div className="container mx-auto max-w-6xl space-y-8">
//           <header className="text-center space-y-4">
//             <h1 className="text-4xl font-bold">Learning Center</h1>
//             <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
//               Master medical terms through interactive card-based learning.
//             </p>
//             <div className="flex items-center justify-center gap-4 p-6 bg-card rounded-lg border">
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-primary">{Math.round(overallProgress)}%</div>
//                 <div className="text-sm text-muted-foreground">Overall Progress</div>
//               </div>
//               <Progress value={overallProgress} className="w-48" />
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-primary">
//                   {categories.filter(cat => cat.completed).length}/{categories.length}
//                 </div>
//                 <div className="text-sm text-muted-foreground">Categories Complete</div>
//               </div>
//               <Button variant="outline" size="sm" onClick={handleResetProgress} disabled={progressLoading} className="flex items-center gap-2">
//                 <RotateCcw className="h-4 w-4" />
//                 Reset Progress
//               </Button>
//             </div>
//           </header>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {categories.map(category => (
//               <Card key={category.name} onClick={() => startCategory(category)}
//                 className={`cursor-pointer transition-all hover:shadow-elegant ${
//                   category.completed ? 'bg-primary/5 border-primary' : 'hover:border-primary/50'
//                 }`}
//               >
//                 <CardHeader>
//                   <div className="flex items-center justify-between">
//                     <CardTitle className="text-lg flex items-center gap-2">
//                       {category.completed ? <Trophy className="h-5 w-5 text-primary" /> : <BookOpen className="h-5 w-5" />}
//                       {category.name}
//                     </CardTitle>
//                     {category.completed && <Badge variant="secondary">Complete</Badge>}
//                   </div>
//                   <CardDescription>{category.cards.length} terms</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-muted-foreground">Progress</span>
//                     <span className="font-medium">{Math.round(category.progress)}%</span>
//                   </div>
//                   <Progress value={category.progress} />
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-muted-foreground">Mastered</span>
//                     <span className="font-medium">
//                       {category.cards.filter(card => card.mastered).length}/{category.cards.length}
//                     </span>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </>
//     );
//   }

//   // Render game view
//   return (
//     <>
//       <Helmet>
//         <title>Learning - {selectedCategory?.name}</title>
//       </Helmet>
//       <div className="container mx-auto max-w-4xl space-y-6">
//         <header className="flex items-center justify-between">
//           <Button variant="outline" onClick={backToCategories} className="flex items-center gap-2">
//             <ArrowLeft className="h-4 w-4" />
//             Back
//           </Button>
//           <div className="text-center">
//             <h1 className="text-2xl font-bold">{selectedCategory?.name}</h1>
//             <p className="text-muted-foreground">
//               {selectedCategory?.cards.filter(card => card.mastered).length}/{selectedCategory?.cards.length} mastered
//             </p>
//           </div>
//           <div className="text-right">
//             <div className="text-lg font-semibold">{Math.round(selectedCategory?.progress || 0)}%</div>
//             <Progress value={selectedCategory?.progress || 0} className="w-24" />
//           </div>
//         </header>

//         {currentCard && (
//           <Card className="mx-auto max-w-2xl">
//             <CardHeader className="text-center">
//               <div className="flex items-center justify-center gap-2 mb-4">
//                 <Target className="h-6 w-6 text-primary" />
//                 <span className="text-sm text-muted-foreground">
//                   Need {2 - currentCard.correctCount} more to master
//                 </span>
//               </div>
//               <CardTitle className="text-3xl font-bold">{currentCard.rus}</CardTitle>
//               <CardDescription>Select the correct Hebrew translation</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 gap-3">
//                 {options.map((option, index) => (
//                   <Button
//                     key={index}
//                     variant={showAnswer ? (option === currentCard.he ? "default" : "outline") : "outline"}
//                     size="lg"
//                     onClick={() => handleAnswer(option)}
//                     disabled={showAnswer}
//                     className={`p-6 text-lg ${showAnswer && option === currentCard.he ? "bg-primary text-primary-foreground" : ""}`}
//                   >
//                     {option}
//                   </Button>
//                 ))}
//               </div>

//               {feedback.type && (
//                 <div className={`p-4 rounded-lg text-center font-medium ${
//                   feedback.type === 'correct'
//                     ? 'bg-primary/10 text-primary border border-primary/20'
//                     : 'bg-destructive/10 text-destructive border border-destructive/20'
//                 }`}>
//                   {feedback.message}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </>
//   );
// };

// export default Learning;
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getMedicalTerms, clearMedicalTermsCache } from "@/cache/medicalTermsCache";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Target, Trophy, ArrowLeft, RotateCcw } from "lucide-react";

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
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentCard, setCurrentCard] = useState<GameCard | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | null; message: string }>({ type: null, message: '' });
  const [gameMode, setGameMode] = useState<'categories' | 'playing'>('categories');
  const [showAnswer, setShowAnswer] = useState(false);
  const [inMemoryCorrectCounts, setInMemoryCorrectCounts] = useState<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const { user } = useAuth();
  const {
    loadMasteredWords,
    addMasteredWord,
    removeMasteredWord,
    isWordMastered,
    resetProgress,
    loading: progressLoading,
  } = useLearningProgress();

  // Load terms and progress once on user login or reset
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const words = await getMedicalTerms();
      setAllWords(words);

      await loadMasteredWords();

      // Build map for mastered words based on isWordMastered hook
      const masteredMap: Record<string, boolean> = {};
      words.forEach(word => {
        const key = `${word.category}_${word.en}`;
        masteredMap[key] = isWordMastered(word.category, word.en);
      });

      // Build categories with cards having mastered + correctCount states from memory
      const categoryMap: Record<string, GameCard[]> = {};
      words.forEach(word => {
        if (!categoryMap[word.category]) categoryMap[word.category] = [];

        const key = `${word.category}_${word.en}`;
        categoryMap[word.category].push({
          ...word,
          correctCount: inMemoryCorrectCounts[key] || 0,
          mastered: masteredMap[key] || false,
        });
      });

      // Convert to array of categories with progress
      const categoriesArray: Category[] = Object.entries(categoryMap).map(([name, cards]) => {
        const masteredCount = cards.filter(card => card.mastered).length;
        const progress = cards.length > 0 ? (masteredCount / cards.length) * 100 : 0;
        const completed = masteredCount === cards.length && cards.length > 0;
        return {
          name,
          cards,
          completed,
          progress,
        };
      });

      setCategories(categoriesArray);
    };

    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Start playing a category
  const startCategory = (category: Category) => {
    setSelectedCategory(category);
    setGameMode('playing');
    nextCard(category);
  };

  // Show next card in category
  const nextCard = (category: Category) => {
    const unmastered = category.cards.filter(card => !card.mastered);
    if (unmastered.length === 0) {
      completeCategory(category);
      return;
    }

    const randomCard = unmastered[Math.floor(Math.random() * unmastered.length)];
    setCurrentCard(randomCard);

    const correctAnswer = randomCard.he;
    // Pick 3 wrong options shuffled
    const wrongAnswers = allWords
      .filter(word => word.he !== correctAnswer)
      .map(word => word.he)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    setOptions(allOptions);

    setFeedback({ type: null, message: '' });
    setShowAnswer(false);
    setSelectedOption(null);
  };

  // Handle user answer selection
  const handleAnswer = async (selectedAnswer: string) => {
    if (!currentCard || !selectedCategory) return;

    setSelectedOption(selectedAnswer);
    setShowAnswer(true);

    const wordKey = `${currentCard.category}_${currentCard.en}`;
    const isCorrect = selectedAnswer === currentCard.he;

    if (isCorrect) {
      setFeedback({ type: 'correct', message: 'Correct! Well done!' });

      const newCorrectCount = (inMemoryCorrectCounts[wordKey] || 0) + 1;
      setInMemoryCorrectCounts(prev => ({
        ...prev,
        [wordKey]: newCorrectCount,
      }));

      // When correctCount reaches 2, mark as mastered and persist to DB
      if (newCorrectCount >= 2 && !currentCard.mastered) {
        await addMasteredWord(currentCard.category, currentCard.en);

        updateCardMastery(selectedCategory, currentCard.en, true, newCorrectCount);
      } else {
        // Just update correctCount locally
        updateCardMastery(selectedCategory, currentCard.en, currentCard.mastered, newCorrectCount);
      }

      // After short delay, show next card
      setTimeout(() => nextCard(selectedCategory), 1500);

    } else {
      setFeedback({ type: 'incorrect', message: `Incorrect. The correct answer is: ${currentCard.he}` });

      setInMemoryCorrectCounts(prev => ({
        ...prev,
        [wordKey]: 0,
      }));

      // If previously mastered, remove mastery in DB
      if (currentCard.mastered) {
        await removeMasteredWord(currentCard.category, currentCard.en);

        updateCardMastery(selectedCategory, currentCard.en, false, 0, false);
      } else {
        // Reset correctCount locally
        updateCardMastery(selectedCategory, currentCard.en, false, 0, false);
      }

      setTimeout(() => nextCard(selectedCategory), 2000);
    }
  };

  // Helper to update card mastery and category progress in local state
  const updateCardMastery = (
    category: Category,
    en: string,
    mastered: boolean,
    correctCount: number,
    recalcCompleted = true
  ) => {
    const updatedCards = category.cards.map(card =>
      card.en === en ? { ...card, mastered, correctCount } : card
    );

    const masteredCount = updatedCards.filter(card => card.mastered).length;
    const progress = (masteredCount / updatedCards.length) * 100;
    const completed = recalcCompleted ? masteredCount === updatedCards.length : category.completed;

    const updatedCategory = { ...category, cards: updatedCards, progress, completed };
    setSelectedCategory(updatedCategory);

    const updatedCategories = categories.map(cat =>
      cat.name === updatedCategory.name ? updatedCategory : cat
    );
    setCategories(updatedCategories);
  };

  // Reset all progress and clear cache
  const handleResetProgress = async () => {
    await resetProgress(); // clear DB progress
    clearMedicalTermsCache(); // clear cache

    setInMemoryCorrectCounts({});
    setSelectedOption(null);
    setCurrentCard(null);
    setSelectedCategory(null);
    setGameMode('categories');
    setFeedback({ type: null, message: '' });

    const words = await getMedicalTerms();
    setAllWords(words);

    // Reset all categories/cards with no mastery, no correctCount
    const categoryMap: Record<string, GameCard[]> = {};
    words.forEach(word => {
      if (!categoryMap[word.category]) categoryMap[word.category] = [];
      categoryMap[word.category].push({
        ...word,
        correctCount: 0,
        mastered: false,
      });
    });

    const categoriesArray: Category[] = Object.entries(categoryMap).map(([name, cards]) => ({
      name,
      cards,
      completed: false,
      progress: 0,
    }));

    setCategories(categoriesArray);
  };

  const completeCategory = (category: Category) => {
    setFeedback({ type: 'correct', message: `🎉 Category "${category.name}" completed! All words mastered!` });
    setTimeout(() => {
      setGameMode('categories');
      setSelectedCategory(null);
      setCurrentCard(null);
      setFeedback({ type: null, message: '' });
    }, 3000);
  };

  const backToCategories = () => {
    setGameMode('categories');
    setSelectedCategory(null);
    setCurrentCard(null);
    setFeedback({ type: null, message: '' });
    setSelectedOption(null);
  };

  const overallProgress =
    categories.length > 0
      ? categories.reduce((sum, cat) => sum + cat.progress, 0) / categories.length
      : 0;

  // --- Render ---

  if (gameMode === "categories") {
    return (
      <>
        <Helmet>
          <title>Learning - Medical Terms Game</title>
        </Helmet>
        <div className="container mx-auto max-w-6xl space-y-8">
          <header className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Learning Center</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Master medical terms through interactive card-based learning.
            </p>
            <div className="flex items-center justify-center gap-4 p-6 bg-card rounded-lg border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(overallProgress)}%
                </div>
                <div className="text-sm text-muted-foreground">Overall Progress</div>
              </div>
              <Progress value={overallProgress} className="w-48" />
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {categories.filter((cat) => cat.completed).length}/{categories.length}
                </div>
                <div className="text-sm text-muted-foreground">Categories Completed</div>
              </div>
            </div>
            <Button
              onClick={handleResetProgress}
              variant="destructive"
              className="mt-4"
              disabled={progressLoading}
              aria-label="Reset progress"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Progress
            </Button>
          </header>

          <main>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card
                  key={category.name}
                  onClick={() => startCategory(category)}
                  className={`cursor-pointer hover:shadow-lg transition-shadow ${
                    category.completed ? "border-green-600 border-2" : ""
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{category.name}</span>
                      {category.completed && <Trophy className="text-yellow-400" />}
                    </CardTitle>
                    <CardDescription>
                      {category.progress.toFixed(0)}% completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={category.progress} className="w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </>
    );
  }

  if (gameMode === "playing" && currentCard && selectedCategory) {
    return (
      <>
        <Helmet>
          <title>Learning - Playing {selectedCategory.name}</title>
        </Helmet>

        <div className="container mx-auto max-w-2xl p-6">
          <Button
            variant="ghost"
            onClick={backToCategories}
            aria-label="Back to categories"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>
                Translate this word into Hebrew:
              </CardTitle>
              <CardDescription className="text-xl font-semibold">
                <Target className="inline mr-2" />
                {currentCard.en}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {options.map((option) => (
                  <Button
                    key={option}
                    variant={
                      showAnswer
                        ? option === currentCard.he
                          ? "default"
                          : option === selectedOption
                          ? "destructive"
                          : "outline"
                        : "outline"
                    }
                    disabled={showAnswer}
                    onClick={() => handleAnswer(option)}
                    aria-pressed={selectedOption === option}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {feedback.type && (
                <p
                  className={`mt-4 font-semibold ${
                    feedback.type === "correct" ? "text-green-600" : "text-red-600"
                  }`}
                  role="alert"
                >
                  {feedback.message}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Badge variant="outline" className="mr-2">
              Progress: {selectedCategory.progress.toFixed(0)}%
            </Badge>
            {selectedCategory.completed && <Badge>Category Completed</Badge>}
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default Learning;

