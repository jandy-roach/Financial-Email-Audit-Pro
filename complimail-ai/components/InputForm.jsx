"use client";

import { useState } from "react";

export default function InputForm() {
  const [situation, setSituation] = useState("");
  const [recipient, setRecipient] = useState("Bank Manager");
  const [style, setStyle] = useState("Professional");
  const [tone, setTone] = useState("Apologetic");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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
      }),
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow mb-8">
      <h2 className="text-xl font-semibold mb-4">Input</h2>

      <textarea
        value={situation}
        onChange={(e) => setSituation(e.target.value)}
        placeholder="Describe your financial situation"
        className="w-full border rounded p-3 mb-4"
        rows={5}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <select
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="border rounded p-2"
        >
          <option>Bank Manager</option>
          <option>Tax Officer</option>
          <option>Client</option>
        </select>

        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="border rounded p-2"
        >
          <option>Professional</option>
          <option>Polite</option>
          <option>Firm</option>
          <option>Angry</option>
        </select>

        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="border rounded p-2"
        >
          <option>Apologetic</option>
          <option>Neutral</option>
          <option>Assertive</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Email"}
      </button>

      {result?.email && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Generated Email</h3>
          <p className="mt-2 font-medium">
            Subject: {result.email.subject}
          </p>
          <pre className="mt-2 text-sm whitespace-pre-wrap">
            {result.email.body}
          </pre>
        </div>
      )}
    </section>
  );
}
