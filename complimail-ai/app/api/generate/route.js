import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const {
      situation,
      recipient = "Bank Manager",
      style = "Professional",
      tone = "Apologetic",
    } = await req.json();

    if (!situation) {
      return Response.json(
        { success: false, error: "Situation is required" },
        { status: 400 }
      );
    }

    // -------- PROMPT 0: INTENT DETECTION --------
    const intentPrompt = `
Classify the user's financial situation into ONE intent.

Possible intents:
- Payment Delay Request
- Extension Request
- Payment Reminder
- Clarification
- Payment Confirmation

Return ONLY valid JSON:
{ "intent": "<one intent>" }

User situation:
"${situation}"
`;

    const intentCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a financial assistant. Respond ONLY with valid JSON.",
        },
        {
          role: "user",
          content: intentPrompt,
        },
      ],
      temperature: 0,
    });

    const intentJSON = intentCompletion.choices[0].message.content;
    const { intent } = JSON.parse(intentJSON);

    // -------- PROMPT 1: EMAIL GENERATION --------
    const emailPrompt = `
Write a ${style.toLowerCase()}, ${tone.toLowerCase()} financial email.

Recipient: ${recipient}
Intent: ${intent}

Rules:
- Be professional and clear
- Do NOT make legal promises
- Do NOT admit fault
- Use polite financial language

Return ONLY valid JSON in this format:
{
  "subject": "...",
  "body": "..."
}

User situation:
"${situation}"
`;

    const emailCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a professional financial email writer. Respond ONLY with valid JSON.",
        },
        {
          role: "user",
          content: emailPrompt,
        },
      ],
      temperature: 0.4,
    });

    const emailJSON = emailCompletion.choices[0].message.content;
    const email = JSON.parse(emailJSON);

    return Response.json({
      success: true,
      intent,
      email,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
