import React from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useMedicalSentences, type EnergyCategory, type MedicalSentence } from "@/hooks/useMedicalSentences";

type Language = "he" | "en" | "rus";

const categoryColors = [
  "from-blue-500 to-blue-600",
  "from-red-500 to-red-600",
  "from-green-500 to-green-600",
  "from-purple-500 to-purple-600",
  "from-orange-500 to-orange-600",
  "from-teal-500 to-teal-600",
  "from-indigo-500 to-indigo-600",
  "from-pink-500 to-pink-600",
];

interface SentenceCardProps {
  sentence: MedicalSentence;
  category: EnergyCategory;
  colorIndex: number;
  language: Language;
}

const SentenceCard: React.FC<SentenceCardProps> = ({ sentence, category, colorIndex, language }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const gradientClass = categoryColors[colorIndex % categoryColors.length];

  // Main card always shows Hebrew
  const mainText = sentence.he;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(mainText);
      toast({ title: "הועתק בהצלחה", description: "המשפט הועתק ללוח" });
    } catch {
      toast({ title: "שגיאה", description: "לא ניתן להעתיק את המשפט", variant: "destructive" });
    }
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} whileHover={{ y: -2 }} className="w-full">
      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className={`absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradientClass}`} />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 text-right">
              <p className="text-base leading-relaxed font-medium">{mainText}</p>
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
                      <p className="text-sm">{mainText}</p>
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
        {sentence.en !== sentence.he || sentence.rus !== sentence.he ? (
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
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 space-y-2 text-sm text-muted-foreground text-right">
                  {language !== "he" && <div><Badge variant="outline">עברית</Badge><p>{sentence.he}</p></div>}
                  {language !== "en" && <div><Badge variant="outline">English</Badge><p>{sentence.en}</p></div>}
                  {language !== "rus" && <div><Badge variant="outline">Русский</Badge><p>{sentence.rus}</p></div>}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        ) : null}
      </Card>
    </motion.div>
  );
};

const MedicalSentencesPage: React.FC = () => {
  const { t, i18n } = useTranslation();

  const description = t(
    "medical_sentences_description",
    "משפטים רפואיים מקצועיים לרופאים לפי קטגוריות - לשכנוע התחלת טיפול, הסברת חומרה, שינוי אורח חיים ועוד. תמיכה בעברית, אנגלית ורוסית."
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "משפטים רפואיים לרופאים",
    description,
    applicationCategory: "Medical",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      t("feature_category_sentences", "משפטים לפי קטגוריות רפואיות"),
      t("feature_three_languages", "תמיכה בשלוש שפות"),
      t("feature_quick_copy", "העתקה מהירה של משפטים"),
      t("feature_conversation_examples", "דוגמאות לשיחה"),
      t("feature_mobile_friendly", "ממשק ידידותי לנייד"),
    ],
  };

  const { categories, sentences, selectedCategoryId, loading, loadingSentences, selectCategory } = useMedicalSentences();

  // Determine target language from i18n
  const normalizeLang = (lang: string): Language => {
    if (lang.startsWith("he")) return "he";   // detect Hebrew
    if (lang.startsWith("ru")) return "rus";  // detect Russian
    return "en";                              // default English
  };

  const targetLang = normalizeLang(i18n.language);

  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);
  const selectedColorIndex = categories.findIndex((cat) => cat.id === selectedCategoryId);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 w-48 flex-shrink-0" />)}
          </div>
          <div className="grid gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <meta name="description" content={description} />
        <meta
          name="keywords"
          content="משפטים רפואיים, רופאים, טיפול רפואי, שיחה עם מטופלים, עברית רפואית, רוסית רפואית"
        />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="bg-card border-b">
          <div className="container mx-auto px-4 py-4 sm:py-6">
            <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400">
              <div className="flex gap-2 sm:gap-4 pb-4 min-w-max">
                {categories.map((category, index) => (
                  <Button
                    key={category.id}
                    variant={selectedCategoryId === category.id ? "default" : "outline"}
                    onClick={() => selectCategory(category.id)}
                    className={`h-auto p-3 sm:p-4 text-right flex-col items-start min-w-[140px] sm:min-w-[180px] relative overflow-hidden ${
                      selectedCategoryId === category.id
                        ? `bg-gradient-to-r ${categoryColors[index % categoryColors.length]} text-white border-none shadow-lg`
                        : "hover:shadow-md border-muted-foreground/20"
                    }`}
                  >
                    <div className="font-semibold text-xs sm:text-sm  leading-tight text-center">
                      {targetLang === "he" ? category.name_he : targetLang === "rus" ? category.name_ru : category.name_en}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-4 sm:py-8">
          {selectedCategory && (
            <div className="mb-4 sm:mb-6 text-center">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">
                {targetLang === "he" ? selectedCategory.name_he : targetLang === "rus" ? selectedCategory.name_ru : selectedCategory.name_en}
              </h2>
            </div>
          )}

          {loadingSentences ? (
            <div className="grid gap-4 max-w-4xl mx-auto">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 sm:h-32 w-full" />)}
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
                    language={targetLang}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("no_sentences_available", "אין משפטים זמינים עבור קטגוריה זו")}
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default MedicalSentencesPage;
