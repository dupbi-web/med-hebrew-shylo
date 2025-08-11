import React from "react";
import "./flashcard.css";

export interface FlashcardProps {
  en: string;
  he: string;
  flipped: boolean;
  onToggle: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ en, he, flipped, onToggle }) => {
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const prefersReduced = React.useMemo(() =>
    typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1
    const rotX = (0.5 - py) * 8; // deg
    const rotY = (px - 0.5) * 8; // deg
    setTilt({ x: rotX, y: rotY });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <div className="w-full max-w-xl mx-auto perspective-[1200px]">
      <div
        ref={cardRef}
        role="button"
        aria-pressed={flipped}
        aria-label={flipped ? "Hide Hebrew" : "Show Hebrew"}
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
        className="relative h-72 sm:h-80 md:h-96 cursor-pointer select-none"
        style={{
          transformStyle: "preserve-3d",
          transition: "var(--transition-smooth)",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        <div
          className="absolute inset-0 rounded-lg bg-card text-foreground border border-border shadow-elegant flex items-center justify-center text-center p-6 backface-hidden"
          style={{
            transform: `rotateY(${flipped ? 180 : 0}deg)`,
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
          }}
        >
          <div>
            <p className="text-sm text-muted-foreground mb-2">English</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">{en}</h2>
            <p className="mt-4 text-sm text-muted-foreground">Click or press Space to flip</p>
          </div>
        </div>
        <div
          className="absolute inset-0 rounded-lg bg-card text-foreground border border-border shadow-elegant flex items-center justify-center text-center p-6 backface-hidden"
          style={{
            transform: `rotateY(${flipped ? 0 : -180}deg)`,
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
          }}
        >
          <div>
            <p className="text-sm text-muted-foreground mb-2">Hebrew</p>
            <h2 dir="rtl" className="text-3xl sm:text-4xl font-semibold tracking-tight">{he}</h2>
            <p className="mt-4 text-sm text-muted-foreground">Click again to flip back</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
