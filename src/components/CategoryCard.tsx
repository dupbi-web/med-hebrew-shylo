import { Category } from '@/types/translation';
import { cn } from '@/lib/utils';
import { User, Stethoscope, FlaskConical, ClipboardList } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  count: number;
  onClick: () => void;
  className?: string;
}

const iconMap = {
  user: User,
  stethoscope: Stethoscope,
  flask: FlaskConical,
  clipboard: ClipboardList,
};

const colorMap: Record<string, string> = {
  S: 'bg-category-s/10 text-category-s border-category-s/20 hover:bg-category-s/20',
  O: 'bg-category-o/10 text-category-o border-category-o/20 hover:bg-category-o/20',
  A: 'bg-category-a/10 text-category-a border-category-a/20 hover:bg-category-a/20',
  P: 'bg-category-p/10 text-category-p border-category-p/20 hover:bg-category-p/20',
};

const CategoryCard = ({ category, count, onClick, className }: CategoryCardProps) => {
  const Icon = iconMap[category.icon as keyof typeof iconMap] || User;
  const colorClass = colorMap[category.id] || colorMap.S;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full p-6 rounded-xl border-2 transition-all duration-300',
        'shadow-card hover:shadow-card-hover hover:scale-[1.02]',
        'flex flex-col items-center gap-4 text-center',
        colorClass,
        className
      )}
    >
      <div className={cn(
        'w-14 h-14 rounded-full flex items-center justify-center',
        'bg-current/10 transition-transform duration-300 group-hover:scale-110'
      )}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold hebrew-text">{category.name}</h3>
        <p className="text-sm opacity-70 russian-text">{category.nameRu}</p>
      </div>
      <span className="text-xs font-medium px-3 py-1 rounded-full bg-current/10">
        {count} משפטים
      </span>
    </button>
  );
};

export default CategoryCard;
