"use client";

import { useState } from "react";

export default function InputForm() {
  const [situation, setSituation] = useState("");
  const [recipient, setRecipient] = useState("Bank Manager");
  const [style, setStyle] = useState("Professional");
  const [tone, setTone] = useState("Apologetic");
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setResponseText(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: situation || "Test situation",
          recipient,
          style,
          tone,
        }),
      });

      const data = await response.json();
      console.log(data);
      setResponseText(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
      setResponseText("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow mb-8">
      <h2 className="text-xl font-semibold mb-4">Input</h2>

      <textarea
        placeholder="Describe your financial situation"
        rows={5}
        className="w-full border rounded p-3 mb-4"
        value={situation}
        onChange={(e) => setSituation(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <select
          className="border rounded p-2"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        >
          <option>Bank Manager</option>
          <option>Tax Officer</option>
          <option>Client</option>
        </select>

        <select
          className="border rounded p-2"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        >
          <option>Professional</option>
          <option>Polite</option>
          <option>Firm</option>
          <option>Angry</option>
        </select>

        <select
          className="border rounded p-2"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
        >
          <option>Apologetic</option>
          <option>Neutral</option>
          <option>Assertive</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Email"}
      </button>

      {responseText && (
        <pre className="mt-4 bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">
          {responseText}
        </pre>
      )}
    </section>
  );
}