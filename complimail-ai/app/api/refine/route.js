import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const {
      emailBody,
      feedback,
      intent,
      cleanedSituation,
      recipient,
      style,
      tone,
      instructions,
    } = await req.json();

    if (!emailBody || !feedback) {
      return Response.json(
        { success: false, error: "Email body and feedback are required" },
        { status: 400 }
      );
    }

    const refinePrompt = `
You are refining an existing financial email.

Original intent (DO NOT CHANGE):
${intent}

Interpreted user situation (this is the true meaning):
"${cleanedSituation}"

Recipient:
${recipient}

Writing style:
${style}

Emotional tone:
${tone}

User constraints:
${instructions || "None"}

User feedback:
"${feedback}"

Rules:
- Preserve intent and interpreted meaning
- Apply feedback carefully
- Maintain style and tone
- Do NOT add legal promises or admissions
- Do NOT reintroduce raw spoken fillers
- Improve clarity and professionalism

Return ONLY valid JSON:
{
  "updatedBody": "..."
}

Original email:
"${emailBody}"
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a professional financial email editor. Respond ONLY with valid JSON.",
        },
        {
          role: "user",
          content: refinePrompt,
        },
      ],
      temperature: 0.3,
    });

    const result = JSON.parse(
      completion.choices[0].message.content
    );

    return Response.json({
      success: true,
      updatedBody: result.updatedBody,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
