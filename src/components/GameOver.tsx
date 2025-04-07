"use client";

import { useGameStore } from "@/store/gameStore";
import { RotateCcw, Trophy, Meh, Bot } from "lucide-react";

const accentColor = "#9d4edd";

const asciiLogo = `
██╗  ██████╗ ██████╗ ███████╗ █████╗ ██╗  ██╗  ██████╗ ███████╗██╗   ██╗███████╗
██║  ██╔══██╗██╔══██╗██╔════╝██╔══██╗██║ ██╔╝  ██╔══██╗██╔════╝██║   ██║██╔════╝
██║  ██████╔╝██████╔╝█████╗  ███████║█████╔╝   ██║  ██║█████╗  ██║   ██║███████╗
██║  ██╔══██╗██╔══██╗██╔══╝  ██╔══██║██╔═██╗   ██║  ██║██╔══╝  ╚██╗ ██╔╝╚════██║
██║  ██████╔╝██║  ██║███████╗██║  ██║██║  ██╗  ██████╔╝███████╗ ╚████╔╝ ███████║
╚═╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝  ╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝
`;

export default function GameOver() {
  const scores = useGameStore((state) => state.scores);
  const resetGame = useGameStore((state) => state.resetGame);

  const winner =
    scores.player > scores.ai
      ? "PLAYER"
      : scores.ai > scores.player
      ? "CPU"
      : "TIE";
  const winnerMessage =
    winner === "PLAYER"
      ? "VICTORY DETECTED! HUMANITY PREVAILS... FOR NOW."
      : winner === "CPU"
      ? "CPU DOMINANCE ACHIEVED. RESISTANCE IS FUTILE."
      : "STALEMATE REACHED. EQUAL MATCH.";

  const WinnerIcon =
    winner === "PLAYER" ? Trophy : winner === "CPU" ? Bot : Meh;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 font-mono text-green-300 bg-black">
      <pre className="text-xs leading-none mb-8" style={{ color: accentColor }}>
        {asciiLogo}
      </pre>
      <WinnerIcon
        size={64}
        className="mb-4 animate-bounce"
        color={accentColor}
      />
      <h2 className="text-3xl font-bold mb-2" style={{ color: accentColor }}>
        GAME OVER
      </h2>
      <p className="text-xl mb-4">{winnerMessage}</p>
      <div className="text-lg mb-6 border-y border-dashed border-gray-700 py-2 px-4">
        <p className="text-center font-semibold mb-1">-- FINAL SCORE --</p>
        <p>Player (DEV): {scores.player}</p>
        <p>AI (CPU): {scores.ai}</p>
      </div>
      <button
        onClick={resetGame}
        className="px-6 py-2 border-2 text-white hover:bg-gray-800 transition-colors flex items-center"
        style={{ borderColor: accentColor }}
      >
        <RotateCcw size={16} className="mr-2" />
        Play Again?
      </button>
    </div>
  );
}
