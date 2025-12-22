# Learning Log – CompliMail AI

## Implementation Research
I researched how to implement a GenAI-based financial email assistant using a simple and scalable architecture. The focus was on separating content generation and compliance checking to improve safety and clarity.

## Technical Approach
- Use a form-based UI to collect raw user input, recipient type, and tone
- Send this data to a backend API built with Node.js
- Use prompt chaining:
  1. First prompt generates a professional email
  2. Second prompt audits the generated email for risky or non-compliant statements

## AI Design Decisions
- System prompts will control tone and professionalism
- Structured JSON output will be used to extract subject, body, and risk flags
- Risky phrases will be highlighted and replaced with safer suggestions

## Frontend Rendering Plan
- Render generated email and audit results separately
- Highlight risky lines for easy review
- Provide copy-to-clipboard functionality

## Status
✔ Implementation approach researched  
⬜ Development in progress
