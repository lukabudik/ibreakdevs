# IBreakDevs

<div align="center">
  <h3>A competitive coding duel platform pitting humans against AI</h3>
  <p>Challenge AI models to solve coding tasks and have your solutions judged fairly</p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
  [![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-green)](https://openai.com/)
  [![E2B](https://img.shields.io/badge/E2B-Code%20Interpreter-orange)](https://e2b.dev/)
</div>

> **⚠️ IMPORTANT NOTE: This project is a work in progress and not yet finished. Many features are still under development.**

## 🚀 Overview

IBreakDevs is a competitive coding platform where developers can challenge AI models to solve programming tasks. The application provides a real-time coding environment where both the human and AI write solutions to the same problem, which are then executed and judged fairly.

## ✨ Features

- **🤖 AI Opponents**: Compete against OpenAI's GPT-4o model
- **💻 Real-time Coding**: Watch the AI generate its solution in real-time
- **⚡ Code Execution**: Both human and AI solutions are executed in secure sandboxes
- **🧠 Fair Judging**: Solutions are evaluated on correctness, efficiency, and style
- **🏆 Scoring System**: Track your performance across multiple rounds
- **🎮 Game Mechanics**: Engaging competitive format with multiple rounds
- **💬 AI Banter**: Enjoy light-hearted competitive banter from your AI opponent

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **State Management**: Zustand with Immer
- **Code Execution**: E2B Code Interpreter
- **AI Integration**: OpenAI API with GPT-4o
- **Real-time Communication**: WebSockets for streaming AI responses
- **Code Editor**: Monaco Editor (VS Code's editor)

## 🏁 Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/ibreakdevs.git
cd ibreakdevs

# Install dependencies
pnpm install

# Start the development server
pnpm dev

# In a separate terminal, start the WebSocket server
pnpm websocket
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
