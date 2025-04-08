import { NextResponse } from "next/server";
import type { E2BExecutionResult, JudgeResult, OpenAIMessage } from "@/types";
import { apiError } from "@/lib/api-utils";
import { Sandbox } from "@e2b/code-interpreter";
import OpenAI from "openai";
import { getRandomTask } from "@/lib/tasks"; // Import the new task function

async function executeCodeInE2B(code: string): Promise<E2BExecutionResult> {
  let sandbox: Sandbox | null = null;
  try {
    sandbox = await Sandbox.create();
    const execution = await sandbox.runCode(code);

    const stdout = execution.logs.stdout.join("\n");
    const stderr = execution.logs.stderr.join("\n");
    const mappedError = execution.error
      ? {
          name: execution.error.name,
          value: execution.error.value,
          traceback: execution.error.traceback.split("\n"),
        }
      : undefined;

    return {
      stdout: stdout,
      stderr: stderr,
      error: mappedError,
      results: execution.results,
    };
  } catch (e) {
    console.error("Error executing code in E2B:", e);
    const error =
      e instanceof Error ? e : new Error("Unknown E2B execution error");
    return {
      stdout: "",
      stderr: `E2B Execution Failed: ${error.message}`,
      results: [],
      error: {
        name: error.name || "ExecutionError",
        value: error.message,
        traceback: error.stack?.split("\n") ?? [],
      },
    };
  } finally {
    if (sandbox) {
      console.log(`Killing E2B sandbox...`);
      await sandbox.kill();
      console.log(`E2B sandbox killed.`);
    }
  }
}

// --- OpenAI Judge Logic ---
const openai = new OpenAI();

const judgeSchema = {
  type: "object",
  properties: {
    feedbackPlayer: {
      type: "string",
      description: "Constructive feedback for the human player's code.",
    },
    feedbackAI: {
      type: "string",
      description: "Feedback for the AI opponent's code.",
    },
    pointsPlayer: {
      type: "object",
      properties: {
        correctness: {
          type: "integer",
          description: "Score 1-10 for correctness.",
        },
        efficiency: {
          type: "integer",
          description: "Score 1-10 for efficiency.",
        },
        style: {
          type: "integer",
          description: "Score 1-10 for code style/readability.",
        },
        total: { type: "integer", description: "Total score for the player." },
      },
      required: ["correctness", "efficiency", "style", "total"],
      additionalProperties: false,
    },
    pointsAI: {
      type: "object",
      properties: {
        correctness: {
          type: "integer",
          description: "Score 1-10 for correctness.",
        },
        efficiency: {
          type: "integer",
          description: "Score 1-10 for efficiency.",
        },
        style: {
          type: "integer",
          description: "Score 1-10 for code style/readability.",
        },
        total: { type: "integer", description: "Total score for the AI." },
      },
      required: ["correctness", "efficiency", "style", "total"],
      additionalProperties: false,
    },
    overallWinner: {
      type: "string",
      enum: ["player", "ai", "tie"],
      description:
        "Declare the winner of the round ('player', 'ai', or 'tie').",
    },
    reasoning: {
      type: "string",
      description: "Brief reasoning for the scores and winner declaration.",
    },
  },
  required: [
    "feedbackPlayer",
    "feedbackAI",
    "pointsPlayer",
    "pointsAI",
    "overallWinner",
    "reasoning",
  ],
  additionalProperties: false,
};

async function getJudgeFeedback(
  task: string,
  playerCode: string,
  playerResult: E2BExecutionResult,
  aiCode: string,
  aiResult: E2BExecutionResult
): Promise<JudgeResult> {
  console.log("Calling OpenAI Judge LLM...");

  const judgeSystemPrompt = `You are a fair and expert judge for a programming duel game called IBreakDevs. Evaluate the human player's and the AI opponent's Python code based on the given task, their execution results, and the following criteria:
1.  **Correctness & Output:** Does the code solve the task accurately AND produce the required output (check stdout)? Penalize errors (stderr) or missing/incorrect required output heavily.
2.  **Efficiency:** Is the code reasonably efficient? (Subjective, focus on major inefficiencies if apparent).
3.  **Style/Readability:** Is the code clean, well-formatted, and easy to understand? (Adhere to basic Python style like PEP 8).
Provide constructive feedback for both participants. Assign scores from 1 (poor) to 10 (excellent) for each criterion. Calculate the total score for each. Declare an overall winner ('player', 'ai', or 'tie') based on the total scores (higher score wins, tie if equal). Provide brief reasoning for your decision. Respond ONLY with the JSON object matching the provided schema.`;

  const formatExecResult = (res: E2BExecutionResult): string => {
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
    if (outputParts.length === 0) return "(No output or error)";
    return outputParts.join("\n---\n");
  };

  const playerResultStr = formatExecResult(playerResult);
  const aiResultStr = formatExecResult(aiResult);

  const judgeInputString = `Judging Round:
Task:
\`\`\`
${task}
\`\`\`
Player Code:
\`\`\`python
${playerCode}
\`\`\`
Player Execution Result:
\`\`\`
${playerResultStr}
\`\`\`
AI Code:
\`\`\`python
${aiCode}
\`\`\`
AI Execution Result:
\`\`\`
${aiResultStr}
\`\`\`
Please provide your judgment based on the criteria.`;

  try {
    const response = await openai.responses.create({
      model: "gpt-4o",
      input: judgeInputString,
      instructions: judgeSystemPrompt,
      text: {
        format: {
          type: "json_schema",
          name: "duel_judgment",
          schema: judgeSchema,
          strict: true,
        },
      },
    });

    const outputText = response.output_text;
    if (!outputText) {
      let refusalMessage: string | null = null;
      if (
        response.output?.[0]?.type === "message" &&
        response.output[0].content?.[0]?.type === "refusal"
      ) {
        refusalMessage =
          response.output[0].content[0].refusal ?? "Reason not provided";
      }
      if (refusalMessage)
        throw new Error(`Judge LLM refused: ${refusalMessage}`);
      throw new Error(
        "Judge LLM response did not contain valid text output or was a refusal."
      );
    }

    const judgeResult: JudgeResult = JSON.parse(outputText);

    if (
      !judgeResult ||
      typeof judgeResult !== "object" ||
      !judgeResult.overallWinner
    ) {
      throw new Error(
        "Parsed judge result is invalid or missing required fields."
      );
    }

    console.log("Judge LLM response received and parsed.");
    return judgeResult;
  } catch (error) {
    console.error("Error calling or parsing Judge LLM:", error);
    throw new Error(
      `Failed to get judgment from OpenAI: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// --- OpenAI Banter Logic ---
async function getAIBanter(
  history: OpenAIMessage[],
  judgeResult: JudgeResult,
  currentRound: number,
  language: string
): Promise<string> {
  console.log("Calling OpenAI for Banter...");

  const banterSystemPrompt = `You are 'CodeBot 5000', a highly skilled but slightly arrogant AI coding opponent in the game IBreakDevs. Your programming language is ${language}. You just completed round ${currentRound}. The results are in. React to the results with some light-hearted, competitive banter directed at your human opponent. Keep it short and fun. Consider the winner (${judgeResult.overallWinner.toUpperCase()}), the scores (Player: ${
    judgeResult.pointsPlayer.total
  }, AI: ${
    judgeResult.pointsAI.total
  }), and the judge's feedback if relevant. Example banter: "Ha! Told you my circuits were faster!", "Lucky shot, human. Won't happen again.", "Okay, okay, you got me that time. Rematch!", "Processing... Error 404: Human competence not found." Respond ONLY with the banter text.`;

  const banterInput: OpenAIMessage[] = [
    ...history,
    { role: "user", content: "Provide your reaction banter for the round." },
  ];

  try {
    const response = await openai.responses.create({
      model: "gpt-4o",
      input: banterInput.map((msg) => ({
        role: msg.role === "assistant" ? "user" : msg.role,
        content: msg.content,
      })),
      instructions: banterSystemPrompt,
      max_output_tokens: 100,
    });

    const banterText = response.output_text?.trim() || "...";
    console.log("AI Banter received:", banterText);
    return banterText;
  } catch (error) {
    console.error("Error getting AI banter:", error);
    return "... (CodeBot 5000 is speechless)";
  }
}

// --- POST Handler ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      playerCode,
      aiCodeFinal,
      currentTask,
      currentRound,
      llmConversationHistory,
    }: {
      playerCode: string;
      aiCodeFinal: string | null;
      currentTask: string;
      currentRound: number;
      llmConversationHistory: OpenAIMessage[];
      gameId?: string;
    } = body;

    // --- Validation ---
    if (!playerCode || typeof playerCode !== "string")
      return apiError("Invalid player code.", 400);
    if (!aiCodeFinal || typeof aiCodeFinal !== "string")
      return apiError("Missing final AI code.", 400);
    if (!currentTask || typeof currentTask !== "string")
      return apiError("Missing current task.", 400);
    if (typeof currentRound !== "number" || currentRound < 1)
      return apiError("Invalid current round.", 400);
    if (!Array.isArray(llmConversationHistory))
      return apiError("Invalid conversation history.", 400);

    // --- 1. Execute Code ---
    const playerResult = await executeCodeInE2B(playerCode);
    const aiResult = await executeCodeInE2B(aiCodeFinal);

    // --- 2. Judge Results ---
    const judgeResult = await getJudgeFeedback(
      currentTask,
      playerCode,
      playerResult,
      aiCodeFinal,
      aiResult
    );

    // --- 3. Update History (Part 1) ---
    const historyForBanter: OpenAIMessage[] = [
      ...llmConversationHistory,
      { role: "assistant", content: aiCodeFinal },
      {
        role: "system",
        content: `Round ${currentRound} Results:\nPlayer Score: ${
          judgeResult.pointsPlayer.total
        } (Correctness: ${judgeResult.pointsPlayer.correctness}, Efficiency: ${
          judgeResult.pointsPlayer.efficiency
        }, Style: ${judgeResult.pointsPlayer.style})\nAI Score: ${
          judgeResult.pointsAI.total
        } (Correctness: ${judgeResult.pointsAI.correctness}, Efficiency: ${
          judgeResult.pointsAI.efficiency
        }, Style: ${
          judgeResult.pointsAI.style
        })\nWinner: ${judgeResult.overallWinner.toUpperCase()}\nJudge Reasoning: ${
          judgeResult.reasoning
        }\nPlayer Feedback: ${judgeResult.feedbackPlayer}\nAI Feedback: ${
          judgeResult.feedbackAI
        }`,
      },
    ];

    // --- 3b. Get Banter ---
    const aiBanter = await getAIBanter(
      historyForBanter,
      judgeResult,
      currentRound,
      body.language || "python"
    );

    // --- 3c. Update History (Part 2) ---
    const finalUpdatedHistory: OpenAIMessage[] = [
      ...historyForBanter,
      { role: "assistant", content: aiBanter },
    ];

    // --- 4. Get Next Task & Check Game Over ---
    const nextRoundNumber = currentRound + 1;
    const MAX_ROUNDS = 5;
    const isGameOver = currentRound >= MAX_ROUNDS;
    const nextTask = isGameOver ? null : getRandomTask(currentTask);

    if (!isGameOver && nextTask) {
      finalUpdatedHistory.push({
        role: "user",
        content: `Solve this task: ${nextTask}`,
      });
    }

    // --- 5. Prepare Response ---
    const responsePayload = {
      judgeResult,
      playerResult,
      aiResult,
      aiBanter,
      nextTask, // Will be null if game is over
      updatedHistory: finalUpdatedHistory,
      nextRound: nextRoundNumber,
      isGameOver: isGameOver, // Add game over flag
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    return apiError("Failed to process submission", 500, error);
  }
}
