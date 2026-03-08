import { useState, useEffect } from 'react';

export function useGameLogic() {
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [lane, setLane] = useState(1); // 0, 1, 2, 3

  // Qui inseriremo le funzioni per muovere le auto e gestire i soldi
  const moveLeft = () => setLane((prev) => Math.max(0, prev - 1));
  const moveRight = () => setLane((prev) => Math.min(3, prev + 1));

  return { score, speed, lane, moveLeft, moveRight };
}