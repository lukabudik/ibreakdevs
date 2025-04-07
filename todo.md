# IBreakDevs - Development TODO List

## Guiding Principles & Key Technologies

- **Clean & Efficient Code:** Prioritize writing clean, readable, and maintainable code. Avoid overengineering; focus on practical and efficient solutions.
- **Modern Stack:** Leverage modern tools and libraries effectively. This includes:
  - **Zod:** For robust schema definition and validation, especially for API responses and potentially state management.
  - **Zustand:** For client-side state management.
  - **Next.js App Router:** Utilize its features for routing, API handling, etc.
  - **TypeScript:** Ensure strong typing throughout the application.
- **Documentation Focus:** Closely follow the provided `openai_docs.md` and `e2b_docs.md` for correct API usage and integration patterns.
- **Core Functionality First:** Concentrate on implementing the core game mechanics and AI/E2B integrations before focusing on extensive UI styling or secondary features.

---

# IBreakDevs - Development TODO List

This list outlines the tasks required to build the core functionality of the IBreakDevs application, based on `plan.md`. Styling and UI polish are excluded for now.

## 1. Project Setup & Foundation

- [x] Initialize Next.js project (App Router) with TypeScript. (Assumed pre-existing)
- [x] Install necessary dependencies: `zustand`, `openai`, `@e2b/code-interpreter`, `@monaco-editor/react`, `ws`, `socket.io-client`, `socket.io`.
- [x] Set up basic project structure (folders for components, hooks, api routes, store, types).
- [x] Configure environment variables (`OPENAI_API_KEY`, `E2B_API_KEY`) via `.env.local`.
- [x] Define core TypeScript types/interfaces (`GameState`, `E2BExecutionResult`, `JudgeResult`, `OpenAIMessage`, etc.) in `src/types/index.ts`.

## 2. Backend API Routes / Route Handlers

- [x] **Game Management API (`/api/game/...`)**
  - [x] `POST /api/game/start`: Basic structure created (`src/app/api/game/start/route.ts`).
    - Accepts language and opponent model.
    - Initializes game state (round 1, empty history, etc.).
    - Generates or retrieves the first task (placeholder).
    - Initializes LLM conversation history with system prompt.
    - Returns initial game state and task.
  - [x] `POST /api/game/submit`: Basic structure created (`src/app/api/game/submit/route.ts`).
    - Accepts player code and current game state context (e.g., round, history).
    - Retrieves final AI code (placeholder).
    - Orchestrates calls to E2B for execution (placeholder).
    - Orchestrates calls to OpenAI Judge LLM (placeholder).
    - Updates LLM conversation history (placeholder).
    - Generates/retrieves the next task (placeholder).
    - Returns judge results, AI final code, and next task.
- [x] **AI Interaction API (`/api/ai/...`)**
  - [ ] `POST /api/ai/generate` (or integrated into `/start` and `/submit`): Endpoint to handle non-streaming AI code generation if needed initially. (Deferred)
  - [x] **Streaming Endpoint (WebSocket):** Basic structure created (`src/websocket-server.ts`).
    - Establish connection endpoint (placeholder).
    - Accept game context (task, history) (placeholder).
    - Call OpenAI `responses.create` with `stream: true` (placeholder).
    - Process `response.output_text.delta` events (placeholder).
    - Apply "blurring" logic (placeholder).
    - Push blurred chunks to the connected client (placeholder).
    - Accumulate the _actual_ AI code server-side (placeholder).
- [x] **Error Handling:** Utility created (`src/lib/api-utils.ts`) and integrated into `start` and `submit` routes.

## 3. Frontend Development

- [x] **State Management (Zustand):**
  - [x] Create the Zustand store based on the `GameState` interface (`src/store/gameStore.ts`).
  - [x] Implement actions to update the state (`initializeGame`, `setTask`, `updatePlayerCode`, etc.) (Initial implementation in store).
- [x] **Core UI Components:**
  - [x] `GameSetup`: Placeholder created (`src/components/GameSetup.tsx`).
  - [x] `TaskDisplay`: Placeholder created (`src/components/TaskDisplay.tsx`).
  - [x] `PlayerEditor`: Placeholder created (`src/components/PlayerEditor.tsx`).
  - [x] `OpponentViewer`: Placeholder created (`src/components/OpponentViewer.tsx`).
  - [x] `ResultsDisplay`: Placeholder created (`src/components/ResultsDisplay.tsx`).
  - [x] `Scoreboard`: Placeholder created (`src/components/Scoreboard.tsx`).
  - [x] `GameStatusIndicator`: Placeholder created (`src/components/GameStatusIndicator.tsx`).
- [x] **API Integration (Client-side):**
  - [x] Create functions/hooks to call backend API routes (`/api/game/start`, `/api/game/submit`). (Done within store actions).
  - [x] Handle API responses and update Zustand store accordingly. (Done within store actions).
- [x] **WebSocket Client:**
  - [x] Implement client-side logic to connect to the streaming endpoint (`useWebSocket` hook created and integrated in `page.tsx`).
  - [x] Handle incoming blurred code chunks and update the `OpponentViewer` component / Zustand state (`aiCodeStreamedBlurred`) (Done within hook).
- [x] **Game Flow Logic:**
  - [x] Implement UI logic to transition between game states (`setup` -> `coding` -> `judging` -> `results` -> `coding`) (Done via conditional rendering in `page.tsx`).
  - [x] Handle user actions (start game, submit code, next round) (Done via button `onClick` handlers in components calling store actions).

## 4. E2B Integration (Backend)

- [x] **SDK Setup:** Initialize E2B SDK with API key (Handled automatically by SDK via env var).
- [x] **Code Execution Logic (within `/api/game/submit`):**
  - [x] Create/manage E2B sandboxes (Implemented: new sandbox per execution in `executeCodeInE2B`).
  - [x] Implement `sandbox.runCode()` calls for both player and AI code (Implemented in `executeCodeInE2B`).
  - [x] Handle various outputs: `stdout`, `stderr`, `results`, and `error` (Implemented basic mapping in `executeCodeInE2B`).
  - [x] Format E2B results consistently for the Judge LLM and frontend display (Refined `formatExecResult` in `submit/route.ts`).
  - [ ] Consider necessary Python packages in the sandbox (may require custom E2B template later) (Deferred).

## 5. OpenAI Integration (Backend)

- [x] **SDK Setup:** Initialize OpenAI SDK with API key (Done in `submit/route.ts` and `websocket-server.ts`).
- [x] **Opponent LLM Logic:**
  - [x] Implement streaming call (`responses.create` with `stream: true`) using the correct model, task prompt, and adapted history (Implemented in `websocket-server.ts`).
  - [x] Define system prompt for opponent persona and "trash talk" (optional) (Refined code-gen prompt in `start/route.ts`, banter prompt in `submit/route.ts`).
- [x] **Judge LLM Logic:**
  - [x] Define clear judging criteria and scoring rubric (Refined `judgeSystemPrompt` within `submit/route.ts`).
  - [x] Create the JSON Schema for the desired structured output (feedback, scores) (Done as `judgeSchema` within `submit/route.ts`).
  - [x] Implement prompt construction for the judge, including task, code, execution results (Done within `getJudgeFeedback` in `submit/route.ts`).
  - [x] Implement call to `responses.create` using `text.format` with the defined JSON Schema (Done within `getJudgeFeedback` in `submit/route.ts`).
  - [x] Parse the structured JSON response from the judge (Done within `getJudgeFeedback` in `submit/route.ts`).
  - [x] Implement separate post-verdict banter generation call (Done via `getAIBanter` in `submit/route.ts`).
- [x] **Conversation History Management:**
  - [x] Implement logic to correctly append system, user, assistant messages (including code, judge summary, banter, next task) to the history array (Implemented in `submit/route.ts`).

## 6. Core Game Loop

- [ ] Tie all components together to enable the full round cycle: Setup -> Task -> Code -> Submit -> Execute -> Judge -> Results -> Next Task.
- [x] Tie all components together to enable the full round cycle: Setup -> Task -> Code -> Submit -> Execute -> Judge -> Results -> Next Task. (Initial loop functional)
- [x] Ensure state updates correctly drive UI changes. (Initial pass done)

## 7. Testing & Refinement (Initial)

- [x] **Task Generation:**
  - [x] Create `src/lib/tasks.ts` with a larger list (~50) of varied difficulty tasks. (Added ~40 tasks)
  - [x] Ensure tasks require tangible output (e.g., print statements, return values tested). (Tasks updated)
  - [x] Update API routes (`start`, `submit`) to randomly select tasks from the list.
- [x] **Enforce Output:** Modify judging prompt/criteria slightly to emphasize checking for required output based on task description.
- [x] **Game End Condition:**
  - [x] Add `game_over` status to `GameState`.
  - [x] Modify `submit` API route to detect final round and return a game over indicator.
  - [x] Modify `submitCode` store action to handle game over state.
  - [x] Create `src/components/GameOver.tsx` component.
  - [x] Update `page.tsx` to render `GameOver` component.
- [ ] **Button Logic:** Disable "Next Round" button when game is over. (Handled by `ResultsPanel` not rendering in `game_over` state).
- [ ] Manual testing of the end-to-end game flow, focusing on edge cases and state transitions. (Next Step)
- [ ] Refine Judge LLM prompts and schema based on initial results. (Next Step)
- [ ] Refine Opponent LLM prompts (code-gen and banter).
- [ ] Prevent user code execution before AI finishes generating code.
- [ ] Prevent copying of blurred AI code during the coding phase.

## 8. UI Refactor & Polishing (Terminal/Cyberpunk Style)

- [x] Install `lucide-react` for icons.
- [x] Apply global styles (CRT effect, font, background) in `globals.css` / `layout.tsx`.
- [ ] **Component Refactor:** Re-create and implement components for better structure:
  - [x] `src/components/GameHeader.tsx` (Logo, Round, Scores)
  - [x] `src/components/TaskDisplay.tsx` (Task text, title, cursor)
  - [x] `src/components/PlayerEditorPanel.tsx` (Editor, header, button)
  - [x] `src/components/OpponentViewerPanel.tsx` (Code display, header, blur overlay)
  - [x] `src/components/ResultsPanel.tsx` (Judge feedback, banter, execution outputs, next round button)
  - [x] `src/components/GameSetup.tsx` (Initial setup screen)
- [x] **Refactor `src/app/page.tsx`:** Use new components to structure the layout, handle conditional rendering based on `status`.
- [ ] **AI Code Blurring (Visual):**
  - [x] Update `websocket-server.ts` to send raw code deltas.
  - [x] Update `gameStore.ts` to store raw streamed code (`aiCodeStreamed`).
  - [x] Implement CSS blur effect (`blur-sm`) in `OpponentViewerPanel.tsx` conditionally during `coding` status.
- [x] **Cursor Logic:** Ensure blinking cursor `█` appears only on the relevant active section title (Handled in `TaskDisplay`).
- [x] **Sizing & Layout:** Adjust component sizing, padding, margins, fonts for a compact, responsive terminal feel (Initial pass done in components).
- [x] **Styling Details:** Apply consistent terminal styling (borders, backgrounds, accent color) across all components (Initial pass done in components).
- [ ] **Responsiveness:** Ensure layout adapts reasonably to different screen sizes (stacking editors on small screens) (Partially addressed with `md:flex-row` in `page.tsx`, needs testing/refinement).
- [x] **Results Display Refactor:**
  - [x] Create `src/components/ExecutionOutput.tsx`.
  - [x] Integrate `ExecutionOutput` below editors in `PlayerEditorPanel.tsx` and `OpponentViewerPanel.tsx` (visible on results).
  - [x] Refactor `ResultsPanel.tsx` to only show Judge Verdict & Banter.
  - [x] Adjust `page.tsx` to remove old results section and place `ResultsPanel` appropriately.
