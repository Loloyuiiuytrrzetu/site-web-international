/**
 * Affiche la grille de tampons d'une carte de fidélité.
 * Les tampons obtenus sont remplis avec la couleur du commerce,
 * les autres restent vides. Le dernier tampon obtenu « pop » (animation).
 *
 * Jusqu'à 15 tampons : on garde 5 colonnes maximum pour rester lisible
 * sur téléphone (5 × 3 = 15).
 */
export function StampGrid({
  count,
  goal,
  color,
}: {
  count: number;
  goal: number;
  color: string;
}) {
  const cols = Math.min(goal, 5);
  return (
    <div
      className="grid gap-2.5"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: goal }).map((_, i) => {
        const filled = i < count;
        const isReward = i === goal - 1;
        const isLast = i === count - 1; // dernier tampon obtenu
        return (
          <div
            key={i}
            className={`flex aspect-square items-center justify-center rounded-full border-2 text-base font-bold transition-all duration-300 ${
              isLast ? "animate-pop" : ""
            }`}
            style={{
              borderColor: color,
              backgroundColor: filled ? color : "transparent",
              color: filled ? "#fff" : color,
              transform: filled ? "scale(1)" : "scale(0.96)",
            }}
          >
            {isReward ? "★" : filled ? "✓" : i + 1}
          </div>
        );
      })}
    </div>
  );
}
