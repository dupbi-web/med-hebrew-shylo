import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import translationData from '@/data/translation.json';
import { TranslationData, Category } from '@/types/translation';
import CategoryCard from '@/components/CategoryCard';
import TranslationPractice from '@/components/TranslationPractice';
import { Button } from '@/components/ui/button';
import { Stethoscope, BarChart3 } from 'lucide-react';

const TypingGame = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const data = translationData as TranslationData;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    data.translations.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [data.translations]);

  const filteredTranslations = useMemo(() => {
    if (!selectedCategory) return [];
    return data.translations.filter((t) => t.category === selectedCategory.id);
  }, [selectedCategory, data.translations]);

  if (selectedCategory) {
    return (
      <TranslationPractice
        translations={filteredTranslations}
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)}
      />
    );
  }

  return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl font-semibold text-foreground mb-6 hebrew-text">
          בחר קטגוריה
        </h2>
                  <div className="flex justify-start mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/statistics')}
              className="gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hebrew-text">הסטטיסטיקות שלי</span>
            </Button>
          </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up">
          {data.categories.map((category, index) => (
            <div
              key={category.id}
              style={{ animationDelay: `${index * 100}ms` }}
              className="animate-slide-up"
            >
              <CategoryCard
                category={category}
                count={categoryCounts[category.id] || 0}
                onClick={() => setSelectedCategory(category)}
              />
            </div>
          ))}
        </div>
      </main>
  );
};

export default TypingGame;
