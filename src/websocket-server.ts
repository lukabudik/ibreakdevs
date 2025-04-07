import { WebSocketServer, WebSocket } from "ws";
import type { OpenAIMessage } from "./types";
import OpenAI from "openai";
import { JSONParser } from "@streamparser/json";

const openai = new OpenAI();

const codeSchema = {
  type: "object",
  properties: {
    code: {
      type: "string",
      description: "The Python code solution.",
    },
  },
  required: ["code"],
  additionalProperties: false,
};

console.log("Attempting to start WebSocket server...");

const port = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: parseInt(port.toString()) });

console.log(`WebSocket server listening on port ${port}`);

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

  ws.on("message", async (message: Buffer) => {
    console.log("Received message:", message.toString());
    try {
      const data = JSON.parse(message.toString());

      if (data.type === "startStream" && data.task && data.history) {
        const task: string = data.task;
        const history: OpenAIMessage[] = data.history;
        const opponentModel: string = data.opponentModel || "gpt-4o";

        console.log(
          `Starting OpenAI stream for task "${task.substring(
            0,
            50
          )}..." using ${opponentModel}`
        );

        // --- Actual OpenAI Streaming Call with Structured Output ---
        const apiInput = history.map((msg) => ({
          role: msg.role === "assistant" ? "user" : msg.role,
          content: [{ type: "input_text" as const, text: msg.content }],
        }));
        apiInput.push({
          role: "user",
          content: [
            { type: "input_text" as const, text: `Solve this task: ${task}` },
          ],
        });

        const stream = await openai.responses.create({
          model: opponentModel,
          input: apiInput,
          instructions: `You are 'CodeBot 5000', an AI coding opponent. Your programming language is python. Your current task is ONLY to provide the Python code solution for the given task. Respond ONLY with a valid JSON object containing the code, like this: { "code": "..." }. Do NOT include any other text, comments, explanations, or banter outside the JSON structure.`,
          text: {
            format: {
              type: "json_schema",
              name: "code_output",
              schema: codeSchema,
              strict: true,
            },
          },
          stream: true,
        });

        let accumulatedCode = "";
        let currentCodeChunk = ""; // Still needed to accumulate the final code

        // Setup streaming JSON parser
        const parser = new JSONParser({
          stringBufferSize: undefined,
          paths: ["$.code"], // Only extract the code value
          keepStack: false,
        });
        let lastSentCodeLength = 0; // Track length for delta calculation
        parser.onValue = ({ value, key }) => {
          // Accumulate the code value as it's parsed
          if (key === "code" && typeof value === "string") {
            currentCodeChunk = value; // Store latest full code string

            // Calculate and send the delta (new part of the code)
            const delta = currentCodeChunk.substring(lastSentCodeLength);
            lastSentCodeLength = currentCodeChunk.length;

            if (delta && ws.readyState === WebSocket.OPEN) {
              // Send the raw code delta (frontend will handle blurring)
              ws.send(JSON.stringify({ type: "aiChunk", chunk: delta }));
            }
          }
        };

        for await (const event of stream) {
          if (event.type === "response.output_text.delta") {
            parser.write(event.delta);
          } else if (event.type === "response.refusal.delta") {
            console.warn("AI Refusal Delta:", event.delta);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: `AI Refusal: ${event.delta}`,
                })
              );
            }
          }
        }
        // --- End Streaming Call ---

        // After the stream, the last value processed by the parser for 'code' is the final code
        accumulatedCode = currentCodeChunk;

        console.log("Stream finished.");
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({ type: "aiStreamEnd", finalCode: accumulatedCode })
          );
        }
      } else {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({ type: "error", message: "Invalid message format" })
          );
        }
      }
    } catch (error) {
      console.error("Failed to process message or stream:", error);
      if (ws.readyState === WebSocket.OPEN) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Server error processing request",
            details: errorMsg,
          })
        );
      }
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.on("error", (error: Error) => {
    console.error("WebSocket error:", error);
  });

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: "connected",
        message: "WebSocket connection established",
      })
    );
  }
});

console.log("WebSocket server setup complete.");

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing WebSocket server");
  wss.close(() => {
    console.log("WebSocket server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing WebSocket server");
  wss.close(() => {
    console.log("WebSocket server closed");
    process.exit(0);
  });
});
