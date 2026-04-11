# 🌌 Catalyst Canvas

**Catalyst Canvas** is a next-generation, AI-infused code and text editor. Built with **Next.js 15, Firebase Genkit, and Gemini 2.5 Flash**, it aims to seamlessly blend a high-performance editing experience with context-aware, native AI tooling.

![Next JS](https://img.shields.io/badge/Next-white?style=for-the-badge&logo=next.js&logoColor=black)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)

## 🚀 Features

### Core Intelligence
- **Context-Aware Editor**: Natively uses Monaco Editor (the engine behind VS Code) customized explicitly for AI-assisted document creation.
- **Smart Prompt Console**: A robust chat interface offering zero-shot templates, a history reel, and dynamic context injection.

### Phase 2 "Smart" Enhancements (Released)
- ✨ **Predictive Typing (Ghost Text)**: Real-time, inline AI code predictions powered by Gemini that appear transparently as you write.
- 🧠 **Project Memory & Context Vault**: Define global styling rules, database schemas, or architectural guidelines via the sidebar. The Vault mathematically injects these rules directly into the AI's internal reasoning loop on every prompt.
- 🎯 **Native Editor AI Actions**: Simply highlight code, right-click, and select natively integrated actions like **AI Explain**, **AI Fix**, or **AI Format**, instantly sending your selection exactly to the Genkit pipelines. 

---

## 💻 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed  
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

#### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ashish8official/Catalyst_Canvas.git
   cd Catalyst_Canvas
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the Environment:**
   Create a `.env.local` file in the root directory and add your API key safely:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Boot the engine:**
   ```bash
   npm run dev
   ```

Navigate to [http://localhost:3000](http://localhost:3000) (or the port your terminal assigns) in your browser.

---

## 🗺️ Roadmap (Phase 3 Evolution)

We are constantly expanding Catalyst Canvas to be a true agentic IDE:
- [ ] **Multi-File Workspace Awareness**: Enable AI refactoring across multiple components.
- [ ] **Embedded AI Terminal**: Let the AI propose and auto-run local shell commands.
- [ ] **Agentic Chat & Diff Merge Panel**: A dedicated visual interface to safely review, accept, or reject AI code changes exactly like a Pull Request.
- [ ] **Smart Runtime Diagnostics**: Hook into the compiler to instantly fetch AI explanations for any local red-squiggles.
