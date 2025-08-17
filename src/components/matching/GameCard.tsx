import { Card } from "@/types/matching";
import { cn } from "@/lib/utils";

interface GameCardProps {
  card: Card;
  isSelected: boolean;
  onClick: (card: Card) => void;
  className?: string;
}

export const GameCard = ({ card, isSelected, onClick, className }: GameCardProps) => {
  const handleClick = () => {
    if (
      card.matched ||
      card.type === "disappear" ||
      card.type === "empty" ||
      card.type === "replacing"
    ) {
      return;
    }
    onClick(card);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const getCardStyles = () => {
    const baseStyles = cn(
      "relative flex items-center justify-center h-24 sm:h-32 rounded-lg transition-all duration-300 select-none font-medium text-center",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "transform-gpu will-change-transform"
    );

    switch (card.type) {
      case "wrong":
        return cn(
          baseStyles,
          // "bg-destructive text-destructive-foreground shadow-lg animate-pulse cursor-pointer"
          "text-destructive-foreground shadow-lg animate-pulse cursor-pointer"

        );
      case "empty":
        return cn(
          baseStyles,
          "bg-muted/50 border-2 border-dashed border-muted-foreground/30 cursor-default"
        );
      case "disappear":
        return cn(
          baseStyles,
          "bg-accent text-accent-foreground shadow-md animate-out fade-out-0 zoom-out-95 duration-300"
        );
      case "replacing":
        return cn(
          baseStyles,
          "bg-primary/10 text-primary border border-primary/20 animate-in fade-in-0 zoom-in-95 duration-300"
        );
      default:
        if (card.matched) {
          return cn(
            baseStyles,
            "bg-accent text-accent-foreground shadow-md cursor-default"
          );
        }
        if (isSelected) {
          return cn(
            baseStyles,
            "bg-primary text-primary-foreground shadow-lg scale-105 cursor-pointer"
          );
        }
        return cn(
          baseStyles,
          "bg-card text-card-foreground border border-border hover:bg-accent hover:text-accent-foreground cursor-pointer shadow-sm hover:shadow-md hover:scale-102"
        );
    }
  };

  const isInteractive = card.type !== "empty" && card.type !== "disappear" && card.type !== "replacing" && !card.matched;

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(getCardStyles(), className)}
      role={isInteractive ? "button" : "presentation"}
      tabIndex={isInteractive ? 0 : -1}
      aria-label={
        card.matched
          ? "Matched card"
          : card.type === "empty"
          ? "Empty card slot"
          : `Card with word ${card.content}`
      }
      style={{
        wordBreak: "break-word",
        overflowWrap: "anywhere",
        userSelect: "none",
        touchAction: "manipulation",
      }}
    >
      <span className="text-sm sm:text-lg px-2">{card.content}</span>
      
      {/* Visual feedback indicators */}
      {card.type === "wrong" && (
        <div className="absolute inset-0 bg-destructive/20 rounded-lg animate-pulse" />
      )}
      
      {card.matched && (
        <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
          <span className="text-xs text-primary-foreground">✓</span>
        </div>
      )}
    </div>
  );
};
