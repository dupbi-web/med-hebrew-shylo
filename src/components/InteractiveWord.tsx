import { useState, useRef, useEffect } from 'react';
import { Word } from '@/types/translation';
import { cn } from '@/lib/utils';

interface InteractiveWordProps {
  word: string;
  wordData?: Word;
  className?: string;
}

const InteractiveWord = ({ word, wordData, className }: InteractiveWordProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('top');
  const wordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (showTooltip && wordRef.current) {
      const rect = wordRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      setTooltipPosition(spaceAbove < 80 ? 'bottom' : 'top');
    }
  }, [showTooltip]);

  const handleInteraction = () => {
    if (wordData) {
      setShowTooltip(!showTooltip);
    }
  };

  const handleMouseEnter = () => {
    if (wordData && window.innerWidth >= 768) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 768) {
      setShowTooltip(false);
    }
  };

  // Close tooltip when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wordRef.current && !wordRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };

    if (showTooltip && window.innerWidth < 768) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showTooltip]);

  return (
    <span
      ref={wordRef}
      className={cn(
        'relative inline-block cursor-pointer transition-all duration-200',
        wordData && 'hover:text-primary underline decoration-dotted decoration-primary/40 underline-offset-4',
        showTooltip && 'text-primary',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleInteraction}
    >
      {word}
      {showTooltip && wordData && (
        <span
          className={cn(
            'absolute left-1/2 -translate-x-1/2 z-50 px-3 py-2 text-sm font-medium rounded-lg',
            'bg-tooltip text-tooltip-foreground shadow-tooltip',
            'animate-scale-in whitespace-nowrap',
            'hebrew-text',
            tooltipPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          )}
        >
          {wordData.target}
          <span
            className={cn(
              'absolute left-1/2 -translate-x-1/2 w-0 h-0',
              'border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent',
              tooltipPosition === 'top'
                ? 'top-full border-t-[6px] border-t-tooltip'
                : 'bottom-full border-b-[6px] border-b-tooltip'
            )}
          />
        </span>
      )}
    </span>
  );
};

export default InteractiveWord;
