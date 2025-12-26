import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No audio file" },
        { status: 400 }
      );
    }

    const audioBuffer = Buffer.from(await file.arrayBuffer());

    const transcription = await groq.audio.transcriptions.create({
      file: new File([audioBuffer], "audio.wav", { type: "audio/wav" }),
      model: "whisper-large-v3",
    });

    return NextResponse.json({
      success: true,
      text: transcription.text,
    });

  } catch (error) {
    console.error("🔴 Groq Transcription error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
