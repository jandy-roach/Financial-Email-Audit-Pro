"use client";

import { useState } from "react";

export default function InputForm() {
  const [situation, setSituation] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation }),
      });

      const data = await response.json();
      setResult(data);
      console.log("Groq intent result:", data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Generate Email"}
      </button>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
          <strong>AI Response:</strong>
          <pre className="mt-2">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
