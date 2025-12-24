import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const { emailBody, feedback, intent } = await req.json();

    const prompt = `
You are revising an existing financial email.

Intent: ${intent}

User feedback:
"${feedback}"

Rules:
- Keep the same intent
- Improve tone based on feedback
- Do NOT add legal promises
- Do NOT change meaning

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
            "You are a professional financial email editor. Respond ONLY with JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
    });

    const result = JSON.parse(
      completion.choices[0].message.content
    );

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
