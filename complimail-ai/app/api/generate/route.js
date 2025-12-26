import Groq from "groq-sdk";

export const dynamic = "force-dynamic";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const {
      situation,
      recipient,
      style,
      tone,
      instructions,
      length,
    } = await req.json();

    // NOTE: Keep `situation` for UI 'Before' display; we interpret it for backend use.

    /* -------------------- INTERPRETATION: CLEAN RAW INPUT -------------------- */
    const interpretationPrompt = `
The following text is spoken by a user and may be unstructured, emotional, or repetitive.

User speech:
"${situation}"

Your task:
- Understand the user's core concern
- Identify key facts
- Remove filler words
- Keep emotional context
- Rewrite it as a clear, structured description

Return ONLY valid JSON:
{
  "cleanedSituation": "..."
}
`;

    const interpretationCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You interpret spoken input into structured understanding. Respond ONLY with JSON.",
        },
        { role: "user", content: interpretationPrompt },
      ],
      temperature: 0.3,
    });

    const interpretationResult = JSON.parse(
      interpretationCompletion.choices[0].message.content
    );

    const cleanedSituation = interpretationResult.cleanedSituation;

    /* -------------------- 1️⃣ INTENT DETECTION -------------------- */

    const intentPrompt = `
Identify the primary intent of the following financial message.

Message:
"${cleanedSituation}"

Return ONLY valid JSON:
{
  "intent": "..."
}
`;

    const intentCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are an intent classification assistant. Respond ONLY with JSON.",
        },
        { role: "user", content: intentPrompt },
      ],
      temperature: 0,
    });

    const intentResult = JSON.parse(
      intentCompletion.choices[0].message.content
    );

    const intent = intentResult.intent;

    /* -------------------- 2️⃣ EMAIL GENERATION -------------------- */

    const emailPrompt = `
You are writing a real human financial email, not a template.

Recipient:
${recipient || "the recipient"}

User situation:
"${cleanedSituation}"

Writing style:
${style}

Emotional tone:
${tone}

Desired length:
${length}

Special instructions:
${instructions || "None"}

Write the email with this structure:
1. Proper greeting based on recipient
2. Brief acknowledgment of the situation (1–2 lines)
3. Clear explanation without over-sharing
4. Polite request or clarification
5. Professional closing

Rules:
- Sound natural and human
- Avoid generic phrases like "I hope this email finds you well"
- Use the user's wording as inspiration, but rewrite it professionally
- Do NOT repeat the user's text word-for-word
- Do NOT include legal promises or guarantees
- Do NOT admit legal fault
- Keep it realistic and specific

Return ONLY valid JSON:
{
  "subject": "...",
  "body": "..."
}
`;

    const emailCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a professional financial email writer. Respond ONLY with JSON.",
        },
        { role: "user", content: emailPrompt },
      ],
      temperature: 0.4,
    });

    const emailResult = JSON.parse(
      emailCompletion.choices[0].message.content
    );

    /* -------------------- 3️⃣ RISK / COMPLIANCE AUDIT -------------------- */

    const auditPrompt = `
You are a compliance auditor reviewing a financial email.

Recipient:
${recipient || "Unknown"}

Email content:
"${emailResult.body}"
User situation:
"${cleanedSituation}"
User constraints:
"${instructions || "None"}"

Check for:
- Legal guarantees
- Absolute commitments
- Admission of fault
- Risky financial promises
- Overconfident language

Return ONLY valid JSON:
{
  "riskLevel": "Low | Medium | High",
  "issues": [
    {
      "line": "...",
      "reason": "...",
      "safeAlternative": "..."
    }
  ]
}
`;

    const auditCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a financial compliance auditor. Respond ONLY with JSON.",
        },
        { role: "user", content: auditPrompt },
      ],
      temperature: 0,
    });

    const auditResult = JSON.parse(
      auditCompletion.choices[0].message.content
    );

    /* -------------------- FINAL RESPONSE -------------------- */

    return Response.json({
      success: true,
      intent,
      cleanedSituation,
      email: emailResult,
      audit: auditResult,
      recipient,
      style,
      tone,
      instructions,
      length,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
