import { useState } from "react";

export default function OutputView({ situation, result, setResult }) {
  const [feedback, setFeedback] = useState("");

  const handleRefine = async () => {
    if (!feedback || !result?.email) return;

    const response = await fetch("/api/refine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailBody: result.email.body,
        feedback,
        intent: result.intent,
        cleanedSituation: result.cleanedSituation,
        recipient: result.recipient,
        style: result.style,
        tone: result.tone,
        instructions: result.instructions,
      }),
    });

    const data = await response.json();

    if (data.success) {
      setResult({
        ...result,
        email: {
          ...result.email,
          body: data.updatedBody,
        },
      });
      setFeedback("");
    } else {
      console.error("Refine failed", data.error);
    }
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Output</h2>

      {!result ? (
        <div className="text-sm text-gray-600">
          No analysis yet. Generate an email to see results.
        </div>
      ) : (
        <div className="mt-8 space-y-6">

          {/* INTENT */}
          <div className="p-4 bg-blue-50 border rounded">
            <p className="font-semibold">
              Detected Intent:
              <span className="ml-2 text-blue-700">{result.intent}</span>
            </p>
          </div>

          {/* GENERATED EMAIL */}
          <div className="p-4 bg-gray-100 border rounded">
            <h3 className="font-semibold mb-2">Generated Email</h3>
            <p className="font-medium mb-2">
              Subject: {result.email.subject}
            </p>
            <pre className="text-sm whitespace-pre-wrap">
              {result.email.body}
            </pre>
          </div>

          <div className="mt-6 p-4 border rounded bg-gray-50">
            <h3 className="font-semibold mb-2">Improve this email</h3>

            <textarea
              placeholder="Examples: Make it more confident • Reduce emotional tone • Be more respectful but firm • Avoid sounding desperate"
              className="w-full border rounded p-3 mb-3"
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />

            <button
              onClick={handleRefine}
              className="bg-gray-800 text-white px-4 py-2 rounded"
            >
              Update Email
            </button>
          </div>

          {/* BEFORE vs AFTER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-red-50 border rounded">
              <h4 className="font-semibold mb-2">Before (User Input)</h4>
              <p className="text-sm whitespace-pre-wrap bg-gray-100 p-3 rounded border-l-4 border-gray-400">
                {situation}
              </p>
            </div>

            <div className="p-4 bg-green-50 border rounded">
              <h4 className="font-semibold mb-2">After (AI Email)</h4>
              <p className="text-sm whitespace-pre-wrap bg-green-50 p-3 rounded border-l-4 border-green-400">
                {result.email.body}
              </p>
            </div>
          </div>

          {/* RISK ANALYSIS */}
          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">Risk Analysis</h3>
            <p>
              Risk Level:
              <span className="ml-2 font-bold">
                {result.audit.riskLevel}
              </span>
            </p>

            {result.audit?.issues?.length > 0 ? (
              <ul className="mt-3 list-disc list-inside text-sm space-y-2">
                {result.audit.issues.map((issue, idx) => (
                  <li key={idx}>
                    <strong>Problem:</strong> {issue.line}<br />
                    <strong>Why:</strong> {issue.reason}<br />
                    <strong>Safer:</strong> {issue.safeAlternative}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm mt-2 text-green-600">
                No compliance issues detected.
              </p>
            )}
          </div>

          {/* CONFIDENCE METER */}
          <div className="p-4 bg-yellow-50 border rounded font-semibold">
            Confidence:
            <span className="ml-2">
              {result.audit.riskLevel === "Low"
                ? "Safe to Send ✅"
                : result.audit.riskLevel === "Medium"
                ? "Review Suggested ⚠️"
                : "High Risk – Revise Required ❌"}
            </span>
          </div>

        </div>
      )}
    </section>
  );
}
