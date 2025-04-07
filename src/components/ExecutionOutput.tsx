import type { E2BExecutionResult } from "@/types";

interface ExecutionOutputProps {
  result: E2BExecutionResult | null;
  title: string;
}

const accentColor = "#9d4edd";

export default function ExecutionOutput({
  result,
  title,
}: ExecutionOutputProps) {
  if (!result) {
    return (
      <div className="mt-1 p-1 border rounded bg-gray-800 text-gray-500 text-[10px] font-mono h-20 overflow-auto">
        <h5
          className="font-semibold mb-0.5 text-xs"
          style={{ color: accentColor }}
        >
          {title}:
        </h5>
        <p>No execution data yet.</p>
      </div>
    );
  }

  const formatOutput = (res: E2BExecutionResult): string => {
    const outputParts: string[] = [];
    if (res.stdout) outputParts.push(`STDOUT:\n${res.stdout}`);
    if (res.stderr) outputParts.push(`STDERR:\n${res.stderr}`);
    if (res.error) {
      outputParts.push(`ERROR: ${res.error.name}: ${res.error.value}`);
      if (res.error.traceback && res.error.traceback.length > 0) {
        const shortTraceback = res.error.traceback.slice(-5).join("\n");
        outputParts.push(`TRACEBACK (last 5 lines):\n${shortTraceback}`);
      }
    }
    const nonTextCount = res.results?.filter((r) => !r.text).length ?? 0;
    if (nonTextCount > 0) {
      outputParts.push(
        `${nonTextCount} non-text result(s) generated (e.g., plots).`
      );
    }
    if (outputParts.length === 0) return "(No output)";
    return outputParts.join("\n---\n");
  };

  return (
    <div className="mt-1 p-1 border rounded bg-gray-800 text-gray-400 text-[10px] font-mono h-20 overflow-auto">
      <h5
        className="font-semibold mb-0.5 text-xs"
        style={{ color: accentColor }}
      >
        {title}:
      </h5>
      <pre className="whitespace-pre-wrap">{formatOutput(result)}</pre>
    </div>
  );
}
