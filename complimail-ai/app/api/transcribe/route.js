import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export const dynamic = "force-dynamic";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No audio file received" },
        { status: 400 }
      );
    }

    console.log("🟢 Transcribe API hit");
    console.log("🟢 File received:", file ? "YES" : "NO");
    console.log("🟢 File type:", file.type);
    console.log("🟢 File name:", file.name);
    console.log("🟢 File size:", file.size);

    // Read language from form (default to 'en') and map names
    let language = (formData.get("language") || "en").toLowerCase();
    if (language === "auto") language = "en"; // fallback for auto-detect

    const LANGUAGE_NAME = {
      en: "English",
      ta: "தமிழ்",
      hi: "हिंदी",
      ml: "മലയാളം",
    };

    const languageName = LANGUAGE_NAME[language] || language;

    console.log("🟢 Transcription language:", language, languageName);

    // ✅ Groq Whisper (Speech-to-Text) — force the language
    const result = await groq.audio.transcriptions.create({
      file, // ✅ File object directly
      model: "whisper-large-v3",
      language,
      temperature: 0,
      response_format: "json",
      prompt: `Transcribe strictly in ${languageName}. Do not use any other language or script.`,
    });

    // Post-process with Groq chat model to normalize/clean the transcript in the target language
    let transcript = result.text || "";

    try {
      const normalize = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are a language normalization assistant.\nRewrite the text strictly in ${languageName}.\n- Use ONLY ${languageName} script\n- Correct speech recognition errors\n- Preserve meaning\n- Do NOT add new information\nReturn ONLY the cleaned text.`,
          },
          { role: "user", content: transcript },
        ],
        temperature: 0.2,
      });

      transcript = normalize.choices?.[0]?.message?.content?.trim() || transcript;
    } catch (err) {
      console.warn("⚠️ Normalization step failed, returning raw transcript", err?.message || err);
    }

    return NextResponse.json({
      success: true,
      text: transcript,
      language,
    });
  } catch (error) {
    console.error("🔴 Groq Transcription error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Transcription failed",
      },
      { status: 500 }
    );
  }
}
