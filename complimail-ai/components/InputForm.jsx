"use client";

import { useState, useRef } from "react";

export default function InputForm({ situation, setSituation, setResult }) {
  const [recipient, setRecipient] = useState("");
  const [style, setStyle] = useState("Professional");
  const [tone, setTone] = useState("Apologetic");
  const [instructions, setInstructions] = useState("");
  const [length, setLength] = useState("Medium");
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [loading, setLoading] = useState(false);



  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      const formData = new FormData();
      formData.append("file", audioBlob);

      try {
        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.text) {
          setSituation((prev) => (prev ? prev + " " + data.text : data.text));
        }
      } catch (err) {
        console.error("Transcription failed", err);
      }
    };

    mediaRecorderRef.current.stop();
    setRecording(false);
  };



  const handleSubmit = async () => {
    if (situation.trim().length < 10) {
      alert("Please describe your situation in a bit more detail (min 10 characters).");
      return;
    }

    setLoading(true);
    setResult(null);

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        situation,
        recipient,
        style,
        tone,
        instructions,
        length,
        mode: "generate",
      }),
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  };
 

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Input Details</h2>
        <p className="text-blue-100 text-sm mt-1">Describe your situation and preferences</p>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <p className="text-sm text-gray-500 mb-4">Type your situation below — include details so the generated email is accurate.</p> 

          <div className="flex gap-3 mb-4">
            {!recording ? (
              <button
                type="button"
                onClick={startRecording}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                🎙️ Start Recording
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                ⏹️ Stop & Transcribe
              </button>
            )}
          </div>

          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="Describe your financial situation in detail..."
            className="w-full border border-gray-300 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
            rows={6}
          />


        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Email Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Recipient</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Bank Manager"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                list="recipient-suggestions"
              />
              <datalist id="recipient-suggestions">
                <option value="Bank Manager" />
                <option value="HR Manager" />
                <option value="Tax Officer" />
                <option value="Client" />
                <option value="Loan Officer" />
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Writing Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option>Professional</option>
                <option>Polite</option>
                <option>Formal</option>
                <option>Firm</option>
                <option>Friendly</option>
                <option>Concise</option>
                <option>Legal-safe</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Emotional Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option>Apologetic</option>
                <option>Neutral</option>
                <option>Calm</option>
                <option>Respectful</option>
                <option>Assertive</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Email Length</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option>Short</option>
                <option>Medium</option>
                <option>Detailed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Special Instructions (Optional)</label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Avoid legal promises"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "⏳ Generating Email..." : "✨ Generate Email"}
          </button>
        </div>
      </div>
    </section>
  );
}