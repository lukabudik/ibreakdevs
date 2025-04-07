"use client";

import { useGameStore } from "@/store/gameStore";
import { Bot, User, Clock } from "lucide-react";

const asciiLogo = `
██╗  ██████╗ ██████╗ ███████╗ █████╗ ██╗  ██╗  ██████╗ ███████╗██╗   ██╗███████╗
██║  ██╔══██╗██╔══██╗██╔════╝██╔══██╗██║ ██╔╝  ██╔══██╗██╔════╝██║   ██║██╔════╝
██║  ██████╔╝██████╔╝█████╗  ███████║█████╔╝   ██║  ██║█████╗  ██║   ██║███████╗
██║  ██╔══██╗██╔══██╗██╔══╝  ██╔══██║██╔═██╗   ██║  ██║██╔══╝  ╚██╗ ██╔╝╚════██║
██║  ██████╔╝██║  ██║███████╗██║  ██║██║  ██╗  ██████╔╝███████╗ ╚████╔╝ ███████║
╚═╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝  ╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝
`;

const accentColor = "#9d4edd";

export default function GameHeader() {
  const round = useGameStore((state) => state.currentRound);
  const scores = useGameStore((state) => state.scores);

  return (
    <>
      <div className="flex justify-center mb-1">
        <pre
          className="text-[8px] sm:text-[10px] leading-tight"
          style={{ color: accentColor }}
        >
          {asciiLogo}
        </pre>
      </div>

      <div className="flex items-center justify-between mb-2 border-b border-gray-700 pb-1 text-gray-300 text-xs sm:text-sm">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-1">
            <Clock size={14} color={accentColor} />
            <span>[RND: {round > 0 ? round : "-"}/5]</span>
          </div>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center">
            <User size={14} color={accentColor} />
            <span className="ml-1">DEV: {scores.player}</span>
          </div>
          <div className="flex items-center">
            <Bot size={14} color={accentColor} />
            <span className="ml-1">CPU: {scores.ai}</span>
          </div>
        </div>
      </div>
    </>
  );
}
