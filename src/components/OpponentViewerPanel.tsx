"use client";

import { useGameStore } from "@/store/gameStore";
import { Bot } from "lucide-react";
import { useEffect, useRef } from "react";
import ExecutionOutput from "./ExecutionOutput";

const accentColor = "#9d4edd";

export default function OpponentViewerPanel() {
  const status = useGameStore((state) => state.status);
  const aiCodeStreamed = useGameStore((state) => state.aiCodeStreamed);
  const aiCodeFinal = useGameStore((state) => state.aiCodeFinal);
  const aiExecutionResult = useGameStore((state) => state.aiExecutionResult);
  const codeDisplayRef = useRef<HTMLPreElement>(null);

  const isCoding = status === "coding";
  const showResults = status === "results";

  useEffect(() => {
    if (codeDisplayRef.current) {
      codeDisplayRef.current.scrollTop = codeDisplayRef.current.scrollHeight;
    }
  }, [aiCodeStreamed]);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex items-center mb-1">
        <Bot size={14} color={accentColor} />
        <span className="ml-1 text-sm text-gray-300">CPU_TERMINAL</span>
        {isCoding && (
          <span className="ml-auto text-[10px] text-gray-500">[ENCRYPTED]</span>
        )}
      </div>
      <div
        className="flex-1 bg-gray-900 border overflow-hidden flex flex-col p-2 text-xs font-mono relative text-gray-300"
        style={{ borderColor: accentColor }}
      >
        <pre
          ref={codeDisplayRef}
          className={`whitespace-pre-wrap flex-grow overflow-auto transition-filter duration-300 ${
            isCoding ? "blur-sm select-none" : ""
          }`}
        >
          {showResults
            ? aiCodeFinal || "// AI Code Unavailable"
            : aiCodeStreamed || "// Awaiting CPU transmission..."}
        </pre>
      </div>
      {showResults && (
        <ExecutionOutput result={aiExecutionResult} title="AI Execution" />
      )}
    </div>
  );
}
