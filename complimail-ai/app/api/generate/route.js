import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const { situation } = await req.json();

    const prompt = `
Classify the user's financial situation into ONE intent.

Possible intents:
- Payment Delay Request
- Extension Request
- Payment Reminder
- Clarification
- Payment Confirmation

Return ONLY valid JSON in this exact format:
{ "intent": "<one intent>" }

User situation:
"${situation}"
    `;

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: "You are a financial assistant that only returns valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0,
    });

    const aiResponse = completion.choices[0].message.content;

    return Response.json({
      success: true,
      intent: aiResponse,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
