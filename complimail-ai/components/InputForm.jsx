"use client";

import { useState } from "react";

export default function InputForm({ situation, setSituation, setResult }) {
  const [recipient, setRecipient] = useState("");
  const [style, setStyle] = useState("Professional");
  const [tone, setTone] = useState("Apologetic");
  const [instructions, setInstructions] = useState("");
  const [length, setLength] = useState("Medium");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      setSituation((prev) =>
        prev ? prev + " " + transcript : transcript
      );
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const handleSubmit = async () => {
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
      }),
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  };
 

  return (
    <section className="bg-white p-6 rounded-lg shadow mb-8">
      <h2 className="text-xl font-semibold mb-4">Input</h2>

      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={startListening}
          className={`px-4 py-2 rounded text-white ${
            listening ? "bg-red-500" : "bg-green-600"
          }`}
        >
          {listening ? "Listening..." : "🎙️ Speak"}
        </button>

        <span className="text-sm text-gray-500">
          Speak your situation instead of typing
        </span>
      </div>

      <textarea
        value={situation}
        onChange={(e) => setSituation(e.target.value)}
        placeholder="Describe your financial situation"
        className="w-full border rounded p-3 mb-4"
        rows={5}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">To Whom</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="e.g. Bank Manager, HR Manager, Loan Officer"
            className="w-full border rounded p-2"
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
          <label className="block text-sm font-medium mb-1">Writing Style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full border rounded p-2"
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
          <label className="block text-sm font-medium mb-1">Emotional Tone</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full border rounded p-2"
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

      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">Special Instructions (Optional)</label>
        <input
          type="text"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g. Avoid legal promises, keep it short"
          className="w-full border rounded p-2"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">Email Length</label>
        <select
          value={length}
          onChange={(e) => setLength(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option>Short</option>
          <option>Medium</option>
          <option>Detailed</option>
        </select>
      </div>


      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Email"}
      </button>



    </section>
  );
}
