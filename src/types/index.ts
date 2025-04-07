export interface OpenAIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface E2BExecutionResult {
  stdout: string;
  stderr: string;
  error?: {
    name: string;
    value: string;
    traceback: string[];
  };
  results: Array<{
    text?: string;
    png?: string;
    jpeg?: string;
    gif?: string;
    svg?: string;
    html?: string;
    pdf?: string;
  }>;
}

export interface JudgeResult {
  feedbackPlayer: string;
  feedbackAI: string;
  pointsPlayer: {
    correctness: number;
    efficiency: number;
    style: number;
    total: number;
  };
  pointsAI: {
    correctness: number;
    efficiency: number;
    style: number;
    total: number;
  };
  overallWinner: "player" | "ai" | "tie";
  reasoning?: string;
}

export interface GameState {
  gameId: string | null;
  status:
    | "idle"
    | "setup"
    | "generating_task"
    | "coding"
    | "executing"
    | "judging"
    | "results"
    | "game_over"
    | "error";
  language: "python";
  opponentModel: string;
  currentRound: number;
  currentTask: string | null;
  playerCode: string;
  aiCodeStreamed: string;
  aiCodeFinal: string | null;
  playerExecutionResult: E2BExecutionResult | null;
  aiExecutionResult: E2BExecutionResult | null;
  judgeOutput: JudgeResult | null;
  scores: {
    player: number;
    ai: number;
  };
  aiBanter: string | null;
  llmConversationHistory: OpenAIMessage[];
  isAiGenerating: boolean;
  errorDetails: string | null;
}

export interface GameStore extends GameState {
  initializeGame: (language: "python", opponentModel: string) => Promise<void>;
  setTask: (task: string) => void;
  updatePlayerCode: (code: string) => void;
  appendAIStreamChunk: (chunk: string) => void;
  setAICodeFinal: (code: string) => void;
  submitCode: () => Promise<void>;
  setExecutionResults: (
    playerResult: E2BExecutionResult,
    aiResult: E2BExecutionResult
  ) => void;
  setJudgeResults: (judgeResult: JudgeResult) => void;
  nextRound: () => Promise<void>;
  setError: (error: string) => void;
  resetGame: () => void;
  _connectWebSocket: () => void;
  _disconnectWebSocket: () => void;
  _sendMessageWebSocket: (message: {
    type: string;
    [key: string]: unknown;
  }) => void;
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
}
