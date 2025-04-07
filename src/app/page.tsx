"use client";

import { useGameStore } from "@/store/gameStore";
import GameHeader from "@/components/GameHeader";
import TaskDisplay from "@/components/TaskDisplay";
import PlayerEditorPanel from "@/components/PlayerEditorPanel";
import OpponentViewerPanel from "@/components/OpponentViewerPanel";
import ResultsPanel from "@/components/ResultsPanel";
import GameSetup from "@/components/GameSetup";
import GameOver from "@/components/GameOver";

export default function Home() {
  const status = useGameStore((state) => state.status);
  const errorDetails = useGameStore((state) => state.errorDetails);
  const resetGame = useGameStore((state) => state.resetGame);

  const isSetup = status === "idle" || status === "setup";
  const showResults = status === "results";
  const isGameOver = status === "game_over";
  const isError = status === "error";
  const isLoading =
    status === "generating_task" ||
    status === "executing" ||
    status === "judging";

  if (isSetup) {
    return <GameSetup />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 font-mono text-red-500 bg-black">
        <GameHeader />
        <h2 className="text-2xl my-4">SYSTEM ERROR</h2>
        <p className="mb-4">{errorDetails || "Unknown error"}</p>
        <button
          onClick={resetGame}
          className="mt-4 p-2 border rounded border-red-500"
        >
          REBOOT
        </button>
      </div>
    );
  }

  if (isGameOver) {
    return <GameOver />;
  }

  return (
    <div className="flex flex-col h-screen bg-black text-green-300 p-2 md:p-3 lg:p-4 font-mono text-sm">
      <GameHeader />
      <TaskDisplay />

      <div className="flex flex-col md:flex-row flex-1 space-y-2 md:space-y-0 md:space-x-2 mb-2 min-h-0">
        <PlayerEditorPanel />
        <OpponentViewerPanel />
      </div>

      {showResults && <ResultsPanel />}

      {isLoading && (
        <div className="text-center p-2 text-purple-400 animate-pulse">
          ... SYSTEM PROCESSING ...
        </div>
      )}

      <div className="text-gray-600 text-center mt-1 text-[10px]">
        <pre>{`/* SYSTEM READY - V1.0.0 - IBREAKDEVS INTERFACE INITIALIZED */`}</pre>
      </div>
    </div>
  );
}
