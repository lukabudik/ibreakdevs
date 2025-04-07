# IBreakDevs - Application Plan

This document outlines the plan for building the IBreakDevs application, a web app where users engage in coding duels against an LLM.

## 1. Core Concept & Flow

The application pits a human player against an LLM in a series of timed coding challenges.

**User Flow:**

1.  **Setup:** User selects a programming language (initially Python) and an opponent LLM model.
2.  **Round Start:** A coding task is presented to both the user and the AI.
3.  **Coding Phase:**
    - User writes their solution in a client-side editor.
    - User sees a blurred, real-time stream of the AI's code generation.
4.  **Submission:** User indicates they have finished coding.
5.  **Reveal:** The AI's complete code is shown.
6.  **Execution:** Both the user's and the AI's code are executed in a secure E2B sandbox.
7.  **Judging:** The code, execution outputs, and the ongoing "battle context" are sent to a separate Judge LLM (OpenAI).
8.  **Feedback & Scoring:** The Judge LLM provides feedback and assigns points based on predefined criteria (e.g., correctness, efficiency, style). Results are displayed.
9.  **Next Round:** The process repeats with a new task.

**Key Features:**

- Real-time, blurred view of AI opponent coding.
- Secure code execution via E2B.
- LLM-based judging and feedback.
- Persistent "battle thread" context for the LLMs (opponent and judge) enabling contextual responses and potential "trash talk".
- Database-less design using local client-side state management.

## 2. Technology Stack

- **Framework:** Next.js (App Router recommended for modern features)
- **Language:** TypeScript
- **API:** Next.js API Routes (or Route Handlers in App Router)
- **State Management:** Zustand (Client-side state)
- **AI Opponent & Judge:** OpenAI API (Models like GPT-4o recommended for capability)
- **Code Execution:** E2B Code Interpreter SDK
- **Styling:** Tailwind CSS (or user preference)
- **Code Editor:** Monaco Editor (or similar client-side editor)

## 3. Architecture

```mermaid
graph TD
    subgraph Browser (Client)
        direction LR
        UI(Next.js Frontend - React Components)
        State(Zustand Store)
        Editor(Code Editor)
        WebSocket(WebSocket/SSE Client)
    end

    subgraph Server (Next.js Backend)
        direction LR
        API(API Routes / Route Handlers)
        WebSocketServer(WebSocket/SSE Server) --> API
    end

    subgraph External Services
        direction LR
        OpenAI(OpenAI API - Opponent & Judge)
        E2B(E2B Code Interpreter API)
    end

    UI -- Manages/Displays --> State
    UI -- User Input --> Editor
    Editor -- Player Code --> State
    UI -- Game Actions (Start, Submit) --> API
    State -- Updates UI --> UI

    API -- Updates State (via response) --> UI
    API -- Fetches Task/Results --> UI
    API -- Initiates AI Coding --> OpenAI
    API -- Streams AI Code --> WebSocketServer
    WebSocketServer -- Streams Blurred Code --> WebSocket
    WebSocket -- Updates Blurred View --> UI
    API -- Sends Code for Execution --> E2B
    E2B -- Execution Results --> API
    API -- Sends Code/Results for Judging --> OpenAI
    OpenAI -- Judge Results --> API
    API -- Manages --> LLM_Context(LLM Battle Thread History)

    style Browser fill:#f9f,stroke:#333,stroke-width:2px
    style Server fill:#ccf,stroke:#333,stroke-width:2px
    style External Services fill:#cfc,stroke:#333,stroke-width:2px
```

**Components:**

- **Frontend (Next.js):**
  - Renders the UI (task display, code editor, opponent view, scoreboard).
  - Manages user interactions.
  - Holds client-side state using Zustand.
  - Communicates with the backend via API Routes.
  - Handles WebSocket/SSE connection for real-time AI code view.
- **Backend (Next.js API Routes):**
  - Handles game logic orchestration.
  - Interfaces with OpenAI API for task generation (optional), opponent code generation, and judging.
  - Interfaces with E2B API for code execution.
  - Manages the persistent "battle thread" context for LLM calls.
  - (Optional) Hosts WebSocket/SSE server for streaming AI code to the client.
- **Zustand Store:**
  - Stores the entire game state: `gameId`, `language`, `opponentModel`, `currentRound`, `task`, `playerCode`, `aiCodeStreamed`, `aiCodeFinal`, `playerOutput`, `aiOutput`, `judgeFeedback`, `scores`, `llmConversationHistory`, `gameState` (e.g., 'setup', 'coding', 'judging', 'results').
- **OpenAI API:**
  - **Opponent LLM:** Generates Python code solutions based on the task and conversation history. Supports streaming output. Can be prompted for "personality" / "trash talk".
  - **Judge LLM:** Receives task, code, outputs, and history. Evaluates submissions based on predefined criteria. Returns structured feedback and scores (using Structured Outputs feature is highly recommended).
- **E2B Code Interpreter:**
  - Provides secure, isolated sandboxes for running Python code.
  - Accepts code strings via SDK.
  - Returns `stdout`, `stderr`, execution results (like plots if generated), and errors.

## 4. Detailed AI & E2B Integration Flow

1.  **Game Initialization (`/api/game/start`):**

    - Client sends selected language and opponent model.
    - Backend initializes the game state object and the LLM conversation history (with an initial system prompt defining the game rules/AI persona).
    - Backend potentially generates the first task (or retrieves a predefined one).
    - Backend returns initial game state (including the first task) to the client, which updates the Zustand store.

2.  **AI Code Generation & Streaming (`/api/ai/stream` or WebSocket):**

    - Triggered after round start.
    - Backend sends the current task and the full conversation history to the OpenAI Opponent LLM using `responses.create` with `stream: true`.
    - **Backend API Route/WebSocket Server:** Receives streaming text deltas (`response.output_text.delta`) from OpenAI.
    - **Processing:** Optionally applies a "blurring" transformation (e.g., replacing characters, showing placeholders).
    - **Forwarding:** Sends the processed/blurred code chunks to the client via WebSocket or SSE.
    - Client receives chunks and updates the "opponent coding" view in real-time.
    - Backend also accumulates the _actual_ AI code from the stream for later execution.

3.  **Code Submission & Execution (`/api/game/submit`):**

    - Client sends the final `playerCode` when the user finishes.
    - Backend retrieves the final `aiCodeFinal` (accumulated from the stream).
    - Backend prepares calls to the E2B SDK:
      - `sandbox.runCode(playerCode)`
      - `sandbox.runCode(aiCodeFinal)`
      - These might run sequentially or in parallel in separate sandboxes/executions.
    - Backend captures results: `stdout`, `stderr`, `error`, `results` (e.g., image data if matplotlib was used) for both player and AI. Store these results temporarily.

4.  **Judging (`/api/game/judge` - could be part of `submit`):**

    - Backend constructs a detailed prompt for the Judge LLM (OpenAI). Include:
      - System prompt defining the judging criteria and desired output format (JSON Schema for Structured Outputs).
      - Full LLM conversation history ("battle thread").
      - Current Task description.
      - `playerCode` and its `executionResults` (stdout, stderr, errors).
      - `aiCodeFinal` and its `executionResults`.
    - Backend calls OpenAI `responses.create` using the Judge LLM model, specifying the JSON Schema via `text.format`.
    - Backend parses the structured JSON response containing feedback and scores.

5.  **Update State & Next Round:**
    - Backend sends the judge's results (feedback, scores) and the AI's _unblurred_ final code back to the client.
    - Client updates the Zustand store. UI transitions to show results.
    - Backend generates/retrieves the next task and updates the state for the next round, adding the judge's feedback to the LLM conversation history.

## 5. State Management (Zustand)

- **Store Structure:**

  ```typescript
  interface GameState {
    gameId: string | null;
    status:
      | "idle"
      | "setup"
      | "coding"
      | "executing"
      | "judging"
      | "results"
      | "error";
    language: string; // e.g., 'python'
    opponentModel: string; // e.g., 'gpt-4o'
    currentRound: number;
    currentTask: string | null;
    playerCode: string;
    aiCodeStreamedBlurred: string; // For display
    aiCodeFinal: string | null; // Actual AI code
    playerExecutionResult: E2BExecutionResult | null;
    aiExecutionResult: E2BExecutionResult | null;
    judgeOutput: JudgeResult | null;
    scores: { player: number; ai: number };
    llmConversationHistory: OpenAIMessage[]; // Array of { role: 'user' | 'assistant' | 'system' | 'tool', content: string | ... }
    errorDetails: string | null;
  }

  interface E2BExecutionResult {
    stdout: string;
    stderr: string;
    error?: { name: string; value: string; traceback: string[] };
    results: Array<{
      png?: string;
      text?: string /* other E2B result types */;
    }>;
  }

  interface JudgeResult {
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
  }
  ```

- **Actions:** `initializeGame`, `setTask`, `updatePlayerCode`, `updateAIStream`, `submitCode`, `setExecutionResults`, `setJudgeResults`, `nextRound`, `setError`. Actions are typically called in response to API calls finishing.

## 6. LLM Conversation ("Battle Thread")

- Managed by the backend.
- Stored as an array of messages (`OpenAIMessage[]`) compatible with the OpenAI API `input` format.
- Starts with a system message setting the context (e.g., "You are a coding opponent in a duel. Solve the tasks and feel free to add some competitive banter.").
- Each round adds:
  - The task (as a `user` message perhaps, or contextually).
  - The AI's code attempt (as `assistant` message).
  - The player's code attempt (maybe summarized, as `user` message).
  - Execution results (potentially summarized or added via `tool` role if using function calling for E2B).
  - The Judge's feedback (as `system` or `user` message providing context for the next round).
- This full history is passed to both the Opponent and Judge LLMs on relevant calls.

## 7. Key Challenges & Considerations

- **Real-time Streaming:** WebSockets (more complex setup) or Server-Sent Events (SSE - simpler, unidirectional) are needed for streaming AI code. Edge functions might be suitable. Latency needs management.
- **E2B Sandbox Management:** Each execution likely needs a fresh sandbox or careful state clearing. API keys and potential costs need handling. Ensure required Python libraries for tasks are available (custom E2B templates might be needed eventually).
- **Judge LLM Reliability:** Prompt engineering is crucial for consistent judging. Structured Outputs helps, but the quality of evaluation depends heavily on the prompt and model. Defining clear scoring rubrics is essential.
- **State Synchronization:** Ensuring the client's Zustand state accurately reflects the backend game progression, especially with async operations.
- **Error Handling:** Robustly handle errors from OpenAI, E2B, network issues, and code execution failures. Provide clear feedback to the user.
- **Cost Management:** Monitor OpenAI token usage (opponent, judge, streaming) and E2B compute time. GPT-4o is capable but more expensive than smaller models. E2B pricing depends on usage.
- **Security:** While E2B sandboxes code, ensure no sensitive data is accidentally included in code sent for execution. Protect API keys.

## 8. Next Steps (Conceptual)

1.  Set up the basic Next.js project structure.
2.  Implement the core UI components (Editor, Task Display, etc.).
3.  Set up the Zustand store.
4.  Create the basic API routes (`/api/game/start`, `/api/game/submit`).
5.  Integrate the E2B SDK in the `submit` route for basic code execution.
6.  Integrate the OpenAI SDK for the Opponent and Judge LLMs (initially without streaming or structured output).
7.  Implement the streaming logic (OpenAI -> Backend -> Frontend).
8.  Refine Judge LLM interaction using Structured Outputs.
9.  Implement the full game loop logic and state transitions.
10. Add styling and polish.
