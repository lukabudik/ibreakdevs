"use client";

import { useGameStore } from "@/store/gameStore";

const accentColor = "#9d4edd";

const asciiLogo = `
██╗  ██████╗ ██████╗ ███████╗ █████╗ ██╗  ██╗  ██████╗ ███████╗██╗   ██╗███████╗
██║  ██╔══██╗██╔══██╗██╔════╝██╔══██╗██║ ██╔╝  ██╔══██╗██╔════╝██║   ██║██╔════╝
██║  ██████╔╝██████╔╝█████╗  ███████║█████╔╝   ██║  ██║█████╗  ██║   ██║███████╗
██║  ██╔══██╗██╔══██╗██╔══╝  ██╔══██║██╔═██╗   ██║  ██║██╔══╝  ╚██╗ ██╔╝╚════██║
██║  ██████╔╝██║  ██║███████╗██║  ██║██║  ██╗  ██████╔╝███████╗ ╚████╔╝ ███████║
╚═╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝  ╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝
`;

export default function GameSetup() {
  const initializeGame = useGameStore((state) => state.initializeGame);

  const handleStart = () => {
    initializeGame("python", "gpt-4o");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 font-mono text-green-300 bg-black">
      <pre className="text-xs leading-none mb-8" style={{ color: accentColor }}>
        {asciiLogo}
      </pre>
      <h2 className="text-xl font-semibold mb-4">Game Setup</h2>
      <p className="mb-4">Prepare for battle! (Defaults: Python, GPT-4o)</p>
      <div className="mb-6 p-3 border border-yellow-500 bg-yellow-900/30 text-yellow-300 max-w-md text-center text-sm">
        <p className="mb-2">
          <strong>⚠️ WORK IN PROGRESS ⚠️</strong>
        </p>
        <p>
          This application is still under active development and may not
          function perfectly. We&apos;re continuously working to improve it.
        </p>
      </div>
      <button
        onClick={handleStart}
        className="px-4 py-2 border-2 text-white hover:bg-gray-800 transition-colors"
        style={{ borderColor: accentColor }}
      >
        Start Duel
      </button>
    </div>
  );
}
