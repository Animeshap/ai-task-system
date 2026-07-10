// FAISS returns L2 distance (lower = more similar). Convert to a rough
// 0-5 "match strength" so results read like a card-catalog relevance gauge
// rather than a raw, hard-to-interpret distance number.
function scoreToTicks(distance) {
  const similarity = 1 / (1 + distance); // 0..1, higher = closer match
  return Math.max(1, Math.round(similarity * 5));
}

export default function MatchGauge({ score }) {
  const filled = scoreToTicks(score);

  return (
    <div className="match-gauge">
      <span className="match-gauge-label">Match</span>
      <div className="match-ticks">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`match-tick${i < filled ? " filled" : ""}`} />
        ))}
      </div>
    </div>
  );
}
