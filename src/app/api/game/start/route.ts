import { NextResponse } from "next/server";
import type { GameState, OpenAIMessage } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { apiError } from "@/lib/api-utils";
import { getRandomTask } from "@/lib/tasks"; // Import the new task function

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { language, opponentModel } = body;

    if (language !== "python") {
      return NextResponse.json(
        {
          error:
            "Invalid language selected. Only Python is supported initially.",
        },
        { status: 400 }
      );
    }
    if (!opponentModel || typeof opponentModel !== "string") {
      return NextResponse.json(
        { error: "Invalid opponent model specified." },
        { status: 400 }
      );
    }

    const gameId = uuidv4();
    const firstTask = getRandomTask();

    const initialHistory: OpenAIMessage[] = [
      {
        role: "system",
        content: `You are 'CodeBot 5000', an AI coding opponent in the game IBreakDevs. Your programming language is ${language}.
Your SOLE purpose right now is to generate the Python code solution for the upcoming user task.
You MUST respond ONLY with a single JSON object containing the key "code", where the value is a string of the complete, valid Python code.
Example response format: {"code": "def solve():\\n  print('Hello')"}
ABSOLUTELY NO other text, comments, explanations, or banter should be included in your response. Just the JSON.`,
      },
      // The user task will be added by the websocket server later
      // Note: The websocket server will add the "Solve this task:" prefix later
      // { role: "user", content: firstTask }, // Let's add the task prompt in the websocket server instead
    ];

    // Initial game state
    const initialGameState: Partial<GameState> = {
      gameId: gameId,
      status: "coding", // Transition to coding state immediately after start
      language: language,
      opponentModel: opponentModel,
      currentRound: 1,
      currentTask: firstTask,
      playerCode: "", // Initial empty code
      aiCodeStreamed: "", // Use renamed field
      aiCodeFinal: null,
      playerExecutionResult: null,
      aiExecutionResult: null,
      judgeOutput: null,
      scores: { player: 0, ai: 0 },
      llmConversationHistory: initialHistory,
      errorDetails: null,
    };

    // In a real app, you might store this initial state associated with the gameId
    // For now, we just return it

    return NextResponse.json(initialGameState);
  } catch (error) {
    // Use the standardized error utility
    return apiError("Failed to start game", 500, error);
  }
}
