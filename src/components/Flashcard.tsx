import React from "react";
import "./flashcard.css";

export interface FlashcardProps {
  translation: string;
  targetLang: "en" | "rus";
  he: string;
  flipped: boolean;
  onToggle: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ translation, targetLang, he, flipped, onToggle }) => {
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });

  const prefersReduced = React.useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotX = (0.5 - py) * 8;
    const rotY = (px - 0.5) * 8;
    setTilt({ x: rotX, y: rotY });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <div className="w-full max-w-2xl mx-auto perspective-[1200px] px-4">
      <div
        ref={cardRef}
        role="button"
        aria-pressed={flipped}
        aria-label={flipped ? "Show Hebrew" : `Show ${targetLang === "en" ? "English" : "Russian"}`}
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        onMouseMove={handleMove}
        onMouseLeave={resetTilt}
        className="relative h-80 sm:h-96 md:h-[28rem] cursor-pointer select-none group"
        style={{
          transformStyle: "preserve-3d",
          transition: "var(--transition-smooth)",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {/* Back side — Translation */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-card to-card/95 text-foreground border border-border shadow-xl flex items-center justify-center text-center p-8 backface-hidden group-hover:shadow-2xl transition-shadow duration-300"
          style={{
            transform: `rotateY(${flipped ? 180 : 0}deg)`,
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="space-y-6 max-w-full">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                {targetLang === "en" ? "English" : "Russian"}
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight break-words">
                {translation}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full inline-block">
              Tap to see Hebrew translation
            </p>
          </div>
        </div>

        {/* Front side — Hebrew */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 text-foreground border border-primary/20 shadow-xl flex items-center justify-center text-center p-8 backface-hidden group-hover:shadow-2xl transition-shadow duration-300"
          style={{
            transform: `rotateY(${flipped ? 0 : -180}deg)`,
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="space-y-6 max-w-full">
            <div>
              <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">
                Hebrew
              </p>
              <h2 dir="rtl" className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight break-words">
                {he}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground bg-primary/10 px-4 py-2 rounded-full inline-block">
              Tap to see original term
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
