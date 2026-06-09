/**
 * Affiche la grille de tampons d'une carte de fidélité.
 * Les tampons obtenus sont remplis avec la couleur du resto,
 * les autres restent vides.
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
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${Math.min(goal, 5)}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: goal }).map((_, i) => {
        const filled = i < count;
        const isReward = i === goal - 1;
        return (
          <div
            key={i}
            className="flex aspect-square items-center justify-center rounded-full border-2 text-lg font-bold transition-colors"
            style={{
              borderColor: color,
              backgroundColor: filled ? color : "transparent",
              color: filled ? "#fff" : color,
            }}
          >
            {isReward ? "★" : filled ? "✓" : i + 1}
          </div>
        );
      })}
    </div>
  );
}
