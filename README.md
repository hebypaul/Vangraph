# Vangraph

![Vangraph Banner](public/og-image.png)

> **Autonomous Project Management powered by AI Agents.**  
> Stop managing tickets. Start shipping software. Vangraph replaces manual project management with intelligent, autonomous agents that refine your backlog, plan your sprints, and unblock your team.

![Status](https://img.shields.io/badge/Status-Prototype-blue)
![Tech](https://img.shields.io/badge/Tech-Next.js_15_|_Tambo_|_Supabase-black)
![License](https://img.shields.io/badge/License-MIT-green)

## The Problem

Project management is broken. It's **manual**, **reactive**, and fundamentally **disconnected** from the code. Developers spend hours updating tickets, attending status meetings, and manually moving cards across infinite columns. The tools we use are static databases of "to-do" lists that don't help us actually *ship*.

## The Solution

**Vangraph** is an autonomous project management platform. It doesn't just store your tasks; it actively helps you complete them. By integrating specialized **AI Agents** (Coder, QA, Architect) directly into your workflow, Vangraph transforms project management from a chore into a superpower.

*   **Don't write tickets.** Chat with the AI to capture requirements, and let it generate the structured tasks.
*   **Don't guess velocity.** Let the AI analyze your team's throughput and plan accurate sprints.
*   **Don't get blocked.** Receive real-time architectural and quality feedback from "Consultant" agents.

---

## Key Features

### 🤖 AI-Powered Workspace
Vangraph isn't just a dashboard; it's an intelligent workspace.
*   **Chat-to-Action**: Interact with your project using natural language. "Create a sprint for the new auth flow" or "What's blocking the frontend team?"
*   **Generative UI**: The interface adapts to your needs. Ask for a status report, and Vangraph *generates* a visual report component on the fly.
*   **Context-Aware**: The AI understands your project's history, tech stack, and current status.

### 📊 Intelligent Kanban Canvas
We've reimagined the Kanban board as an infinite, collaborative canvas.
*   **Smart Grouping**: Automatically organize tasks by status, priority, or assignee.
*   **Drag-to-Scroll**: Navigate large projects effortlessly with our "grab-and-pan" canvas interaction.
*   **Inline Editing**: Update task details directly on the board without losing context.

### 🧠 Agentic Insights
Vangraph includes a suite of specialized agents:
*   **The Architect**: Reviews task technical requirements and suggests implementation details.
*   **The QA Bot**: Generates test cases and acceptance criteria for every user story.
*   **The Scrum Master**: Monitors sprint progress and flags potential bottlenecks before they become delays.

---

## Technical Deep Dive

Vangraph is built on the absolute bleeding edge of the React ecosystem.

### Core Stack
*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19)
*   **AI Integration**: [Tambo SDK](https://tambo.ai) (Streaming Generative UI)
*   **Language**: TypeScript
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Backend**: [Supabase](https://supabase.com/) (Postgres, Auth, Realtime)
*   **State Management**: Nuqs (URL-based state), Zustand

### How It Works (The "Magic")
1.  **User Intent**: You send a message via the Chat Interface.
2.  **Tambo Agent**: The request is processed by a Tambo-powered agent running on the server.
3.  **Tool Execution**: The agent decides which tools to call (e.g., `createTask`, `getProjectStats`, `analyzeBacklog`).
4.  **Generative Component**: Instead of just text, the agent streams back a **React Component** (e.g., a `TaskCard` or `ProjectDashboard`) that is rendered instantly in the client.
5.  **Persistence**: All data is securely stored in Supabase with Row Level Security (RLS) enabled.

---

## Quick Start

### Prerequisites
*   Node.js 18+
*   [Supabase Account](https://supabase.com/)
*   [Tambo Account](https://tambo.ai/)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/hebypaul/Vangraph.git
    cd vangraph
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Configure Environment**
    Copy the example environment file:
    ```bash
    cp .env.example .env.local
    ```
    
    Fill in your API keys in `.env.local`:
    ```env
    # Tambo (AI)
    NEXT_PUBLIC_TAMBO_API_KEY=your_tambo_api_key_here
    
    # Supabase (Backend)
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the application**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Project Structure

```bash
src/
├── actions/              # Server Actions (Mutations)
├── app/                  # Next.js App Router (Pages)
│   ├── (dashboard)/      # Protected dashboard routes
│   │   ├── board/        # The Kanban Canvas
│   │   ├── chat/         # AI Chat Interface
│   │   └── projects/     # Project Management
│   └── api/              # API Routes
├── components/           # React Components
│   ├── atomic/           # Reusable UI primitives (Buttons, Inputs)
│   ├── kanban/           # Kanban board logic & drag-and-drop
│   ├── layout/           # Sidebar, Header, Shell
│   └── tambo/            # AI-Generatable Components (The "Magic" UI)
├── hooks/                # Custom React Hooks (useDraggableScroll, etc.)
├── lib/                  # Utilities & Configuration
│   └── tambo.ts          # Tambo AI Configuration
└── services/             # Backend Services (Supabase wrappers)
```

## Future Roadmap

*   **GitHub Integration**: Two-way sync with GitHub Issues and PRs.
*   **Slack Bot**: Interact with Vangraph directly from your team's Slack channel.
*   **Voice Commands**: "Hey Vangraph, add a bug to the backlog."
*   **Multi-Workspace Support**: Manage multiple organizations from a single account.

## Demo Access

To quickly test the application, you can use the following demo credentials:

*   **Email**: `john_v2@example.com`
*   **Password**: `password123`
  ---
*   **Email**: `alice@example.com`
*   **Password**: `password123`
  ---
*   **Email**: `bob@example.com`
*   **Password**: `password123`
  ---


> **Note**: These credentials are for the hosted demo. If running locally, please ensure you have created this user in your Supabase Auth dashboard.

## License

This project is licensed under the MIT License.
