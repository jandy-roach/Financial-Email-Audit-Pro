import Groq from "groq-sdk";

export const dynamic = "force-dynamic";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    // Read raw body for better diagnostics
    const rawBody = await req.text();
    console.log("🟢 /api/generate body:", rawBody ? rawBody.slice(0, 2000) : "(empty)");

    let body;
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch (parseErr) {
      console.error("🔴 Failed to parse JSON body:", parseErr, "rawBody:", rawBody);
      return Response.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      situation,
      recipient,
      style,
      tone,
      instructions,
      length,
      mode,
    } = body;

    const effectiveMode = mode || "generate";
    console.log("🟢 /api/generate effectiveMode:", effectiveMode);

    if (!situation || typeof situation !== "string" || !situation.trim()) {
      return Response.json(
        { success: false, error: "Situation text is required" },
        { status: 400 }
      );
    }

    // NOTE: Keep `situation` for UI 'Before' display; we interpret it for backend use.

    /* -------------------- INTERPRETATION: CLEAN RAW INPUT -------------------- */
    const interpretationPrompt = `
The following text comes from speech-to-text input and may contain:
- Pauses
- Partial sentences
- Repeated words
- Minor transcription mistakes
- Informal or emotional phrasing

User speech text:
"${situation}"

Your task:
- Infer what the user actually means
- Correct minor speech recognition mistakes
- Remove filler words and repetitions
- Preserve emotional intent (apology, urgency, concern, etc.)
- Rewrite it as a clear, concise description of the situation
- Do NOT add new facts

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

    const interpretationRaw = interpretationCompletion?.choices?.[0]?.message?.content || "";
    console.log("🟢 interpretation raw:", interpretationRaw.slice(0, 2000));

    let interpretationResult;
    try {
      interpretationResult = JSON.parse(interpretationRaw);
    } catch (err) {
      console.error("🔴 Failed to parse interpretation JSON:", err, "raw:", interpretationRaw);
      return Response.json({ success: false, error: "Invalid JSON from interpretation step" }, { status: 502 });
    }

    const cleanedSituation = interpretationResult.cleanedSituation;

    if (effectiveMode === "interpret") {
      return Response.json({ success: true, cleanedSituation });
    }

    /* -------------------- 1️⃣ INTENT DETECTION -------------------- */

    const intentPrompt = `
Identify the primary intent of the following message.

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

    const intentRaw = intentCompletion?.choices?.[0]?.message?.content || "";
    console.log("🟢 intent raw:", intentRaw.slice(0, 2000));

    let intentResult;
    try {
      intentResult = JSON.parse(intentRaw);
    } catch (err) {
      console.error("🔴 Failed to parse intent JSON:", err, "raw:", intentRaw);
      return Response.json({ success: false, error: "Invalid JSON from intent step" }, { status: 502 });
    }

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

    const emailRaw = emailCompletion?.choices?.[0]?.message?.content || "";
    console.log("🟢 email raw:", emailRaw.slice(0, 2000));

    let emailResult;
    try {
      emailResult = JSON.parse(emailRaw);
    } catch (err) {
      console.error("🔴 Failed to parse email JSON:", err, "raw:", emailRaw);
      return Response.json({ success: false, error: "Invalid JSON from email generation step" }, { status: 502 });
    }

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

    const auditRaw = auditCompletion?.choices?.[0]?.message?.content || "";
    console.log("🟢 audit raw:", auditRaw.slice(0, 2000));

    let auditResult;
    try {
      auditResult = JSON.parse(auditRaw);
    } catch (err) {
      console.error("🔴 Failed to parse audit JSON:", err, "raw:", auditRaw);
      return Response.json({ success: false, error: "Invalid JSON from audit step" }, { status: 502 });
    }

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
    console.error("🔴 /api/generate error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
