import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useMedicalSentences, type EnergyCategory, type MedicalSentence } from '@/hooks/useMedicalSentences';
import { toast } from '@/hooks/use-toast';

type Language = 'he' | 'en' | 'rus';

const categoryColors = [
  'from-blue-500 to-blue-600',
  'from-green-500 to-green-600',
  'from-purple-500 to-purple-600',
  'from-orange-500 to-orange-600',
  'from-red-500 to-red-600',
  'from-teal-500 to-teal-600',
  'from-indigo-500 to-indigo-600',
  'from-pink-500 to-pink-600',
];

interface SentenceCardProps {
  sentence: MedicalSentence;
  category: EnergyCategory;
  colorIndex: number;
  language: Language;
}

const SentenceCard: React.FC<SentenceCardProps> = ({ sentence, category, colorIndex, language }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const gradientClass = categoryColors[colorIndex % categoryColors.length];

  const getSentenceText = () => {
    switch (language) {
      case 'he':
        return sentence.he;
      case 'en':
        return sentence.en;
      case 'rus':
        return sentence.rus;
      default:
        return sentence.he;
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getSentenceText());
      toast({
        title: 'הועתק בהצלחה',
        description: 'המשפט הועתק ללוח',
      });
    } catch (err) {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להעתיק את המשפט',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className="w-full"
    >
      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className={`absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradientClass}`} />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 text-right">
              <p className="text-base leading-relaxed font-medium">{getSentenceText()}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 w-8 p-0">
                <Copy className="h-4 w-4" />
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-right">דוגמאות לשיחה</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 text-right">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="font-medium mb-2">המשפט:</p>
                      <p className="text-sm">{getSentenceText()}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">הקשר מומלץ:</p>
                      <p className="text-sm text-muted-foreground">
                        השתמש במשפט זה כאשר אתה רוצה {category.name_he.toLowerCase()}. המשפט מתאים במיוחד לתחילת השיחה או כאשר המטופל מראה התנגדות.
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        {sentence.en !== sentence.he && (
          <CardContent className="pt-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full justify-between text-xs text-muted-foreground hover:text-foreground"
            >
              <span>הצג תרגום</span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 space-y-2 text-sm text-muted-foreground text-right"
                >
                  {language !== 'en' && (
                    <div>
                      <Badge variant="outline" className="mb-1">
                        English
                      </Badge>
                      <p>{sentence.en}</p>
                    </div>
                  )}
                  {language !== 'rus' && (
                    <div>
                      <Badge variant="outline" className="mb-1">
                        Русский
                      </Badge>
                      <p>{sentence.rus}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};

const MedicalSentences: React.FC = () => {
  const { categories, sentences, selectedCategoryId, loading, loadingSentences, selectCategory } = useMedicalSentences();
  const [language, setLanguage] = useState<Language>('he');

  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);
  const selectedColorIndex = categories.findIndex((cat) => cat.id === selectedCategoryId);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-48 flex-shrink-0" />
            ))}
          </div>
          <div className="grid gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-right order-2 sm:order-1">משפטים רפואיים לרופאים</h1>
            {/* Removed language toggle here */}
          </div>
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400">
            <div className="flex gap-2 sm:gap-4 pb-4 min-w-max">
              {categories.map((category, index) => (
                <Button
                  key={category.id}
                  variant={selectedCategoryId === category.id ? 'default' : 'outline'}
                  onClick={() => selectCategory(category.id)}
                  className={`h-auto p-3 sm:p-4 text-right flex-col items-start min-w-[140px] sm:min-w-[180px] relative overflow-hidden ${
                    selectedCategoryId === category.id
                      ? `bg-gradient-to-r ${categoryColors[index % categoryColors.length]} text-white border-none shadow-lg`
                      : 'hover:shadow-md border-muted-foreground/20'
                  }`}
                >
                  <div className="font-semibold text-xs sm:text-sm leading-tight">{category.name_he}</div>
                  <div className="text-[10px] sm:text-xs opacity-80 mt-1 font-normal">{category.name_en}</div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-4 sm:py-8">
        {selectedCategory && (
          <div className="mb-4 sm:mb-6 text-center">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">{selectedCategory.name_he}</h2>
            <p className="text-sm sm:text-base text-muted-foreground">{selectedCategory.name_en}</p>
          </div>
        )}
        {loadingSentences ? (
          <div className="grid gap-4 max-w-4xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 sm:h-32 w-full" />
            ))}
          </div>
        ) : sentences.length > 0 ? (
          <motion.div className="grid gap-3 sm:gap-4 max-w-4xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AnimatePresence mode="popLayout">
              {sentences.map((sentence) => (
                <SentenceCard
                  key={sentence.id}
                  sentence={sentence}
                  category={selectedCategory!}
                  colorIndex={selectedColorIndex}
                  language={language}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-muted-foreground">אין משפטים זמינים עבור קטגוריה זו</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MedicalSentences;
