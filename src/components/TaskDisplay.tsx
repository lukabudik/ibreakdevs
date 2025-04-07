"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { Code } from "lucide-react";

const accentColor = "#9d4edd";

export default function TaskDisplay() {
  const task = useGameStore((state) => state.currentTask);
  const status = useGameStore((state) => state.status);
  const [cursorVisible, setCursorVisible] = useState(true);

  const isCoding = status === "coding";

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isCoding) {
      interval = setInterval(() => {
        setCursorVisible((prev) => !prev);
      }, 530);
    } else {
      setCursorVisible(false); // Ensure cursor is off when not coding
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCoding]);

  return (
    <div
      className="bg-gray-900 p-2 mb-2 border"
      style={{ borderColor: accentColor }}
    >
      <div className="flex items-start">
        <div className="text-sm text-gray-300 w-full">
          <div className="flex items-center">
            <Code size={16} color={accentColor} className="mr-1" />
            <span style={{ color: accentColor }} className="font-bold">
              MISSION_
            </span>
            {isCoding && cursorVisible && (
              <span className="ml-1 animate-pulse">█</span>
            )}
          </div>
          <p className="mt-1 whitespace-pre-wrap">
            {task || "Awaiting mission parameters..."}
          </p>
        </div>
      </div>
    </div>
  );
}
