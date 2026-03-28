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

    const { outputLanguage = "en" } = body;
    const LANG_MAP = { en: "English", ta: "Tamil", hi: "Hindi" };
    const outputLangName = LANG_MAP[outputLanguage] || "English";

    const effectiveMode = mode || "generate";
    console.log("🟢 /api/generate effectiveMode:", effectiveMode, "outputLanguage:", outputLanguage);

    if (!situation || typeof situation !== "string" || !situation.trim()) {
      return Response.json(
        { success: false, error: "Situation text is required" },
        { status: 400 }
      );
    }

    // NOTE: Keep `situation` for UI 'Before' display; we interpret it for backend use.

    // Robust parser that tries normal parse then repairs common issues and retries
    function parseLLMJson(raw) {
      if (!raw) return null;

      // remove markdown fences
      let text = raw.replace(/```json|```/g, "").trim();

      // extract JSON object
      const first = text.indexOf("{");
      const last = text.lastIndexOf("}");
      if (first === -1 || last === -1) return null;

      let jsonStr = text.slice(first, last + 1);

      // ✅ 1) First attempt: normal parse (works for most outputs)
      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        // continue to repair
      }

      // ✅ 2) Repair only if needed: replace REAL newlines with \n
      // (ONLY real newlines, not already escaped ones)
      jsonStr = jsonStr.replace(/\r/g, "").replace(/\n/g, "\\n");

      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        return null;
      }
    }

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
          content: "Return ONLY valid JSON. No markdown. No commentary.",
        },
        { role: "user", content: interpretationPrompt },
      ],  
      temperature: 0.2,
    });

    const interpretationRaw = interpretationCompletion?.choices?.[0]?.message?.content || "";
    console.log("🟢 interpretation raw:", interpretationRaw.slice(0, 2000));

    const interpretationResult = parseLLMJson(interpretationRaw);
    if (!interpretationResult?.cleanedSituation) {
      console.error("🔴 Invalid interpretation JSON:", interpretationRaw);
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
          content: "Return ONLY valid JSON. No markdown. No commentary.",
        },
        { role: "user", content: intentPrompt },
      ],
      temperature: 0,
    });

    const intentRaw = intentCompletion?.choices?.[0]?.message?.content || "";
    console.log("🟢 intent raw:", intentRaw.slice(0, 2000));

    const intentResult = parseLLMJson(intentRaw);
    if (!intentResult?.intent) {
      console.error("🔴 Invalid intent JSON:", intentRaw);
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
${style === "Auto" ? "Choose the best writing style automatically based on situation and recipient." : style}

Emotional tone:
${tone === "Auto" ? "Choose the best emotional tone automatically based on situation and recipient." : tone}

Desired length:
${length}

Special instructions:
${instructions || "None"}

Output language:
${outputLangName}

Rules:
- The entire email must be written ONLY in ${outputLangName}
- Subject must also be in ${outputLangName}
- Do not mix languages
- Use culturally appropriate greetings for ${outputLangName}
- If Writing style or Emotional tone is Auto, decide the most appropriate one for this scenario
- Mention no explanation, just write the email

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

    CRITICAL JSON RULE:
    - Escape all newline characters in the body using \\n    - Do NOT include raw line breaks inside JSON strings
    Example:
    "body": "Line1\\n\\nLine2"

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
          content: "Return ONLY valid JSON. No markdown. No commentary.",
        },
        { role: "user", content: emailPrompt },
      ],
      temperature: 0.2,
    });

    const emailRaw = emailCompletion?.choices?.[0]?.message?.content || "";
    console.log("🟢 email raw:", emailRaw.slice(0, 2000));

    const emailResult = parseLLMJson(emailRaw);
    if (!emailResult?.subject || !emailResult?.body) {
      console.error("🔴 Invalid email JSON:", emailRaw);
      return Response.json(
        { success: false, error: "Invalid JSON from email generation step" },
        { status: 502 }
      );
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
          content: "Return ONLY valid JSON. No markdown. No commentary.",
        },
        { role: "user", content: auditPrompt },
      ],
      temperature: 0,
    });

    const auditRaw = auditCompletion?.choices?.[0]?.message?.content || "";
    console.log("🟢 audit raw:", auditRaw.slice(0, 2000));

    const auditResult = parseLLMJson(auditRaw);
    if (!auditResult?.riskLevel || !Array.isArray(auditResult?.issues)) {
      console.error("🔴 Invalid audit JSON:", auditRaw);
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
      outputLanguage,
      outputLangName,
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
