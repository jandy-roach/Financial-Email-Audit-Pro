export default function OutputView({ situation, result }) {
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

          {/* BEFORE vs AFTER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-red-50 border rounded">
              <h4 className="font-semibold mb-2">Before (User Input)</h4>
              <p className="text-sm whitespace-pre-wrap">{situation}</p>
            </div>

            <div className="p-4 bg-green-50 border rounded">
              <h4 className="font-semibold mb-2">After (AI Email)</h4>
              <p className="text-sm whitespace-pre-wrap">
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
