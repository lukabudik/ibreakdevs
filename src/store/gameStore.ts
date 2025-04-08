import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { StateCreator } from "zustand";
import type {
  GameState,
  GameStore,
  OpenAIMessage,
  E2BExecutionResult,
  JudgeResult,
} from "@/types";

let ws: WebSocket | null = null;
const WEBSOCKET_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8080"
    : "ws://localhost:8080";

const initialState: GameState = {
  gameId: null,
  status: "idle",
  language: "python",
  opponentModel: "gpt-4o",
  currentRound: 0,
  currentTask: null,
  playerCode: "",
  aiCodeStreamed: "",
  aiCodeFinal: null,
  playerExecutionResult: null,
  aiExecutionResult: null,
  judgeOutput: null,
  scores: { player: 0, ai: 0 },
  aiBanter: null,
  llmConversationHistory: [],
  isAiGenerating: false,
  errorDetails: null,
};

const gameStoreCreator: StateCreator<
  GameStore,
  [["zustand/immer", never]],
  [],
  GameStore
> = (set, get) => ({
  ...initialState,

  _connectWebSocket: () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log("Store: WebSocket already connected.");
      return;
    }
    get()._disconnectWebSocket();

    console.log(
      `Store: Attempting to connect WebSocket to ${WEBSOCKET_URL}...`
    );
    ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => {
      console.log("Store: WebSocket connected");
      const { status, currentTask, llmConversationHistory, opponentModel } =
        get();
      if (status === "coding" && currentTask) {
        console.log("Store: WS opened, triggering stream for current task.");
        set({ isAiGenerating: true });
        get()._sendMessageWebSocket({
          type: "startStream",
          task: currentTask,
          history: llmConversationHistory,
          opponentModel: opponentModel,
        });
      }
    };

    ws.onclose = () => {
      console.log("Store: WebSocket disconnected");
      ws = null;
    };

    ws.onerror = (event: Event) => {
      console.error("Store: WebSocket error:", event);
      set((state) => {
        state.status = "error";
        state.errorDetails = `WebSocket connection error: ${event.type}`;
      });
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Store: WebSocket message received:", message.type);

        switch (message.type) {
          case "connected":
            console.log("Server confirmation:", message.message);
            break;
          case "aiChunk":
            if (typeof message.chunk === "string") {
              // Append raw code delta
              set((state) => {
                state.aiCodeStreamed += message.chunk;
              });
            }
            break;
          case "aiStreamEnd":
            if (typeof message.finalCode === "string") {
              set((state) => {
                state.aiCodeFinal = message.finalCode;
                state.isAiGenerating = false;
              });
              console.log("Store: AI stream finished.");
            }
            break;
          case "error":
            console.error(
              "Store: WebSocket server error:",
              message.message,
              message.details
            );
            set((state) => {
              state.status = "error";
              state.errorDetails = `Server error: ${message.message}`;
            });
            break;
          default:
            console.warn(
              "Store: Received unknown WebSocket message type:",
              message.type
            );
        }
      } catch (error) {
        console.error(
          "Store: Failed to parse WebSocket message:",
          event.data,
          error
        );
        set((state) => {
          state.status = "error";
          state.errorDetails = "Failed to parse message from server.";
        });
      }
    };
  },

  _disconnectWebSocket: () => {
    if (ws) {
      console.log("Store: Disconnecting WebSocket...");
      ws.onopen = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;
      ws.close();
      ws = null;
    }
  },

  _sendMessageWebSocket: (message: {
    type: string;
    [key: string]: unknown;
  }) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
        console.log("Store: WebSocket message sent:", message.type);
      } catch (error) {
        console.error("Store: Failed to send WebSocket message:", error);
        set((state) => {
          state.status = "error";
          state.errorDetails = "Failed to send message to server.";
        });
      }
    } else {
      console.warn(
        "Store: WebSocket not connected or not open. Cannot send message:",
        message.type
      );
    }
  },

  initializeGame: async (language: "python", opponentModel: string) => {
    get()._disconnectWebSocket();
    set((state) => {
      Object.assign(state, initialState);
      state.language = language;
      state.opponentModel = opponentModel;
      state.status = "generating_task";
      state.errorDetails = null;
    });
    try {
      get()._connectWebSocket();

      const response = await fetch("/api/game/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, opponentModel }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initialize game");
      }

      const initialData: Partial<GameState> = await response.json();

      set((state) => {
        state.gameId = initialData.gameId ?? null;
        state.status = initialData.status ?? "coding";
        state.currentRound = initialData.currentRound ?? 1;
        state.currentTask = initialData.currentTask ?? null;
        state.llmConversationHistory = initialData.llmConversationHistory ?? [];
        if (state.status === "coding") {
          state.isAiGenerating = true;
        }
      });

      const {
        currentTask,
        llmConversationHistory: currentHistory,
        opponentModel: currentOpponentModel,
      } = get();
      if (currentTask && ws && ws.readyState === WebSocket.OPEN) {
        console.log("InitializeGame: Triggering initial stream via WebSocket.");
        get()._sendMessageWebSocket({
          type: "startStream",
          task: currentTask,
          history: currentHistory,
          opponentModel: currentOpponentModel,
        });
      } else if (!currentTask) {
        throw new Error("First task was not received from the backend.");
      } else {
        console.warn(
          "InitializeGame: WebSocket not open yet. Relying on onopen handler."
        );
      }
    } catch (error) {
      console.error("Error initializing game:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Unknown error during initialization";
      set((state) => {
        state.status = "error";
        state.errorDetails = errorMsg;
      });
      get()._disconnectWebSocket();
    }
  },

  setTask: (task: string) => {
    set((state) => {
      state.currentTask = task;
      state.status = "coding";
    });
    const {
      llmConversationHistory: currentHistory,
      opponentModel: currentOpponentModel,
    } = get();
    if (ws && ws.readyState === WebSocket.OPEN) {
      get()._sendMessageWebSocket({
        type: "startStream",
        task: task,
        history: currentHistory,
        opponentModel: currentOpponentModel,
      });
    }
  },

  updatePlayerCode: (code: string) => {
    set({ playerCode: code });
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  appendAIStreamChunk: (chunk: string) => {
    // No-op: Handled by WebSocket messages now
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setAICodeFinal: (code: string) => {
    // No-op: Handled by WebSocket messages now
  },

  submitCode: async () => {
    const {
      playerCode,
      aiCodeFinal,
      currentTask,
      currentRound,
      llmConversationHistory,
      gameId,
      isAiGenerating,
    } = get();

    // Check if player code is empty
    if (!playerCode || playerCode.trim() === "") {
      console.warn("Submit blocked: Player code is empty.");
      set({ errorDetails: "Cannot submit empty code." });
      return;
    }

    // Explicitly check the AI generating flag
    if (isAiGenerating) {
      console.warn("Submit blocked: AI is still generating.");
      set({ errorDetails: "Please wait for the AI opponent to finish." });
      return;
    }

    if (!aiCodeFinal) {
      set({
        status: "error",
        errorDetails: "AI code is not available for submission.",
      });
      return;
    }
    if (!currentTask) {
      set({
        status: "error",
        errorDetails: "No current task available for submission.",
      });
      return;
    }

    set({ status: "executing", errorDetails: null });

    try {
      const response = await fetch("/api/game/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerCode,
          aiCodeFinal,
          currentTask,
          currentRound,
          llmConversationHistory,
          gameId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process submission");
      }

      const resultData = await response.json();
      const {
        judgeResult,
        playerResult,
        aiResult,
        nextTask,
        updatedHistory,
        nextRound: receivedNextRound,
        aiBanter,
        isGameOver,
      }: {
        judgeResult: JudgeResult;
        playerResult: E2BExecutionResult;
        aiResult: E2BExecutionResult;
        nextTask: string | null; // Task can be null on game over
        updatedHistory: OpenAIMessage[];
        nextRound: number;
        aiBanter?: string | null;
        isGameOver: boolean;
      } = resultData;

      set((state) => {
        // Set status to 'game_over' if applicable, otherwise 'results'
        state.status = isGameOver ? "game_over" : "results";
        state.playerExecutionResult = playerResult;
        state.aiExecutionResult = aiResult;
        state.judgeOutput = judgeResult;
        state.aiBanter = aiBanter ?? null;
        state.llmConversationHistory = updatedHistory;
        state.scores.player += judgeResult.pointsPlayer.total;
        state.scores.ai += judgeResult.pointsAI.total;
        state.currentTask = nextTask;
        state.currentRound = receivedNextRound;
      });
    } catch (error) {
      console.error("Error submitting code:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Unknown error during submission";
      set((state) => {
        state.status = "error";
        state.errorDetails = errorMsg;
      });
    }
  },

  setExecutionResults: (
    playerResult: E2BExecutionResult,
    aiResult: E2BExecutionResult
  ) => {
    set({
      playerExecutionResult: playerResult,
      aiExecutionResult: aiResult,
      status: "judging",
    });
  },
  setJudgeResults: (judgeResult: JudgeResult) => {
    set((state) => {
      state.judgeOutput = judgeResult;
      state.status = "results";
      state.scores.player += judgeResult.pointsPlayer.total;
      state.scores.ai += judgeResult.pointsAI.total;
    });
  },

  nextRound: async () => {
    const {
      currentTask,
      llmConversationHistory: currentHistory,
      opponentModel: currentOpponentModel,
    } = get();
    if (currentTask) {
      set((state) => {
        state.status = "coding";
        state.isAiGenerating = true;
        state.playerExecutionResult = null;
        state.aiExecutionResult = null;
        state.judgeOutput = null;
        state.aiBanter = null;
        state.aiCodeStreamed = "";
        state.aiCodeFinal = null;
        state.playerCode = "";
      });
      get()._sendMessageWebSocket({
        type: "startStream",
        task: currentTask,
        history: currentHistory,
        opponentModel: currentOpponentModel,
      });
    } else {
      console.error("Next task not available when proceeding to next round.");
      set({
        status: "error",
        errorDetails: "Could not start next round: task missing.",
      });
    }
  },

  setError: (error: string) => {
    set({ status: "error", errorDetails: error });
  },

  resetGame: () => {
    get()._disconnectWebSocket();
    set(initialState);
  },
});

export const useGameStore = create<GameStore>()(immer(gameStoreCreator));
