🗓️ 3-Day Development Plan (Hackathon 1)


🟢 Day 1: Foundation & Project Setup

Objective:
Understand the problem clearly and set up the basic project structure and UI.

Tasks:

Finalize project scope and feature list

Set up the Next.js project and basic folder structure

Design a simple, form-based UI to collect:

User’s raw financial situation

Recipient type (Bank Manager / Tax Officer / Client)

Writing style (Professional / Polite / Firm / Angry)

Tone goal (Apologetic / Neutral / Assertive)

Create placeholder sections for:

Before (raw input)

After (generated email)

Risk analysis

Confidence meter

Document initial learning and planning in learned.md

Outcome:
A clear understanding of the workflow and a working UI without AI integration.

🟡 Day 2: Core AI Logic & Prompt Engineering

Objective:
Implement the main GenAI functionality using prompt chaining and structured outputs.

Tasks:

Implement Intent Detection to classify the user’s request (e.g., payment delay, extension request)

Build the Email Generation prompt using:

System prompts

Few-shot prompting

Recipient-specific rules

Add a Tone Consistency Check to verify alignment with the selected tone

Implement a Compliance Audit prompt to:

Assign a risk score (Low / Medium / High)

Identify risky statements

Explain why they are risky

Suggest safer alternatives

Connect backend AI responses to the frontend using structured JSON

Outcome:
The application can generate a professional email and audit it for compliance and risk.

🔵 Day 3: UX Improvements, Iteration & Demo Readiness

Objective:
Improve usability, add learning-focused features, and prepare for demo.

Tasks:

Implement Before vs After comparison view

Highlight risky lines with explanations and safer alternatives

Add a Confidence Meter indicating whether the email is safe to send

Enable user feedback-based modification, allowing users to refine the email using natural language instructions

Polish UI for clarity and readability

Test common edge cases

Prepare a clear demo explanation aligned with Hackathon 1 objectives

Outcome:
A complete, polished, and demo-ready GenAI application showcasing prompt engineering and AI safety.



##Resolving Errors

## Learing About Next.js Because I can't able to run