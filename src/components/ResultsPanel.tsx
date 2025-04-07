"use client";

import { useGameStore } from "@/store/gameStore";
import { Crown } from "lucide-react";

const accentColor = "#9d4edd";

export default function ResultsPanel() {
  const judgeOutput = useGameStore((state) => state.judgeOutput);
  const aiBanter = useGameStore((state) => state.aiBanter);
  const nextRoundAction = useGameStore((state) => state.nextRound);
  const round = useGameStore((state) => state.currentRound);

  if (!judgeOutput) {
    return (
      <div
        className="bg-black border p-2 overflow-auto max-h-48 text-xs"
        style={{ borderColor: accentColor }}
      >
        <div className="flex items-center mb-1">
          <Crown size={14} color={accentColor} />
          <span className="ml-1 text-sm text-gray-300">RESULTS PENDING...</span>
        </div>
        <p className="text-center animate-pulse">Judging in progress...</p>
      </div>
    );
  }

  return (
    <div
      className="bg-black border p-2 overflow-auto max-h-48 text-xs"
      style={{ borderColor: accentColor }}
    >
      <div className="flex items-center mb-1">
        <Crown size={14} color={accentColor} />
        <span className="ml-1 text-sm text-gray-300">
          ROUND {round - 1} VERDICT
        </span>
      </div>
      <div className="text-xs">
        <div className="mb-2">
          <h4 className="font-semibold underline mb-0.5">
            Judge&apos;s Verdict:
          </h4>
          <p>
            <strong style={{ color: accentColor }}>Player:</strong>{" "}
            {judgeOutput.feedbackPlayer}
          </p>
          <p>
            <strong style={{ color: accentColor }}>AI:</strong>{" "}
            {judgeOutput.feedbackAI}
          </p>
          <p>
            <strong style={{ color: accentColor }}>Reasoning:</strong>{" "}
            {judgeOutput.reasoning}
          </p>
          <p className="mt-1 font-bold text-center">
            WINNER: {judgeOutput.overallWinner.toUpperCase()}
          </p>
        </div>
        {aiBanter && (
          <div className="my-1 italic text-center border-y border-dashed border-gray-700 py-0.5">
            <p>
              <strong style={{ color: accentColor }}>CodeBot 5000:</strong>{" "}
              &ldquo;
              {aiBanter}&rdquo;
            </p>
          </div>
        )}
        <div className="text-center mt-2">
          <button
            onClick={nextRoundAction}
            className="px-4 py-1 border text-xs text-white hover:bg-purple-900/50 transition-colors"
            style={{ borderColor: accentColor, color: accentColor }}
          >
            NEXT_ROUND ({round})
          </button>
        </div>
      </div>
    </div>
  );
}
