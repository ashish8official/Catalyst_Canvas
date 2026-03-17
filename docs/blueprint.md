# **App Name**: Catalyst Canvas

## Core Features:

- Context-Aware Intelligent Editor (CAIE): Provide a context-aware rich text/code editing surface (using Monaco) that supports basic formatting, selection-based operations, and automatic language detection (SQL, PL/SQL, text) for tailored editing experiences.
- Smart Prompt Console: An interactive console for users to input natural language prompts, offering predefined prompt templates, context-aware suggestions, and a prompt history and replay feature to streamline AI interaction.
- Core Prompt and Context Engine: The core intelligent layer that processes user prompts, generates structured prompts, and uses a tool to inject contextual information (selected text, document mode, domain modes like SQL/PLSQL/Telecom) to guide the LLM. It supports prompt templates and multi-step prompt pipelines.
- AI Content Generation Tool: A generative AI tool that leverages an LLM API to create new text content based on user prompts, which can be directly inserted into the editor.
- Contextual AI Refinement Tool: An AI tool that allows users to select existing text and apply LLM-powered operations (refine, expand, summarize, change tone) based on specific prompts, intelligently incorporating the selected content as context.
- AI Output Management System: Integrates AI-generated content into the editor with a diff view for version comparison. It provides options to accept, reject, or iteratively refine suggestions, coupled with response normalization and robust error handling for a smooth workflow.
- AI-Assisted Debugging Tool: A specialized AI tool that assists users in debugging code by providing explanations, suggesting fixes, and identifying potential issues based on the code context.

## Style Guidelines:

- A focused dark theme. Primary actions and interactive elements will use a deep, intelligent blue (#4775D1), contrasting cleanly against the dark background to evoke modernity and depth.
- The background will be a subtle, muted bluish-grey (#15181D), promoting concentration and reducing eye strain, especially during prolonged use in an editor.
- An accent color of bright, engaging purple (#B478EA) will highlight generative AI interactions and key prompts, providing a touch of creative energy.
- Headlines and prominent text elements will use 'Space Grotesk' (sans-serif) for its modern, slightly tech-infused aesthetic, suitable for an AI-powered application.
- Body text and the main editing area will utilize 'Inter' (sans-serif) for its highly legible, objective, and clean appearance, ensuring comfortable reading and writing.
- Employ a minimalist and modern set of icons, using clear line art or subtly filled geometric shapes that align with the app's clean and intelligent design.
- Implement a clean, two-panel layout distinguishing the primary editor from the prompt input and AI output areas, maximizing screen real estate for focused content creation.
- Incorporate subtle, fluid animations for AI content appearance, loading indicators, and user interactions to create a responsive and engaging experience without being distracting.