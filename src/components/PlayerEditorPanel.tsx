"use client";

import { useGameStore } from "@/store/gameStore";
import { User, Send } from "lucide-react";
import Editor from "@monaco-editor/react";
import ExecutionOutput from "./ExecutionOutput";

const accentColor = "#9d4edd";

export default function PlayerEditorPanel() {
  const status = useGameStore((state) => state.status);
  const playerCode = useGameStore((state) => state.playerCode);
  const updatePlayerCode = useGameStore((state) => state.updatePlayerCode);
  const submitCode = useGameStore((state) => state.submitCode);
  const playerExecutionResult = useGameStore(
    (state) => state.playerExecutionResult
  );
  const isAiGenerating = useGameStore((state) => state.isAiGenerating);

  const isCoding = status === "coding";
  const showResults = status === "results";

  const handleEditorChange = (value: string | undefined) => {
    updatePlayerCode(value || "");
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex items-center mb-1">
        <User size={14} color={accentColor} />
        <span className="ml-1 text-sm text-gray-300">DEV_TERMINAL</span>
      </div>
      <div
        className="flex-1 bg-gray-900 border overflow-hidden flex flex-col"
        style={{ borderColor: accentColor }}
      >
        <div
          className="bg-black px-2 py-0.5 text-[10px] flex justify-between text-gray-400 border-b"
          style={{ borderColor: accentColor }}
        >
          <span>$_python</span>
          <span>{playerCode.split("\n").length} lines</span>
        </div>
        <div className="flex-grow relative">
          <Editor
            language="python"
            theme="vs-dark"
            value={playerCode}
            onChange={handleEditorChange}
            options={{
              readOnly: !isCoding,
              minimap: { enabled: false },
              fontSize: 12,
              lineNumbers: "off",
              glyphMargin: false,
              folding: false,
              lineDecorationsWidth: 5,
              lineNumbersMinChars: 0,
              scrollBeyondLastLine: false,
              contextmenu: false,
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
            }}
          />
        </div>
      </div>
      {isCoding && (
        <button
          onClick={submitCode}
          disabled={isAiGenerating || !playerCode.trim()}
          className={`mt-2 flex items-center justify-center p-1 border text-xs transition-colors ${
            isAiGenerating || !playerCode.trim()
              ? "opacity-50 cursor-not-allowed"
              : "text-white hover:bg-purple-900/50"
          }`}
          style={{
            borderColor: accentColor,
            color: isAiGenerating || !playerCode.trim() ? "gray" : accentColor,
          }}
        >
          <Send size={12} className="mr-1" />
          {isAiGenerating
            ? "AI THINKING..."
            : !playerCode.trim()
            ? "CODE IS EMPTY"
            : "EXECUTE()"}
        </button>
      )}
      {showResults && (
        <ExecutionOutput
          result={playerExecutionResult}
          title="Player Execution"
        />
      )}
    </div>
  );
}
