import { Translation } from '@/types/translation';
import InteractiveWord from './InteractiveWord';
import { cn } from '@/lib/utils';

interface RussianSentenceProps {
  translation: Translation;
  className?: string;
}

const RussianSentence = ({ translation, className }: RussianSentenceProps) => {
  const sentence = translation.source.sentence;
  const words = translation.words;

  // Split sentence into words while preserving punctuation
  const sentenceWords = sentence.split(/(\s+)/).filter(Boolean);

  const findWordData = (word: string) => {
    // Remove punctuation for matching
    const cleanWord = word.replace(/[.,!?;:]/g, '').toLowerCase();
    return words.find(w => w.source.toLowerCase() === cleanWord);
  };

  return (
    <div className={cn('russian-text text-xl md:text-2xl leading-relaxed', className)}>
      {sentenceWords.map((word, index) => {
        if (/^\s+$/.test(word)) {
          return <span key={index}>{word}</span>;
        }

        const wordData = findWordData(word);
        const punctuation = word.match(/[.,!?;:]$/)?.[0] || '';
        const cleanWord = punctuation ? word.slice(0, -1) : word;

        return (
          <span key={index}>
            <InteractiveWord word={cleanWord} wordData={wordData} />
            {punctuation}
          </span>
        );
      })}
    </div>
  );
};

export default RussianSentence;
