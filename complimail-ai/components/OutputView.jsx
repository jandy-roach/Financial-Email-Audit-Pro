import { useState } from "react";

export default function OutputView({ situation, result, setResult }) {
  const [feedback, setFeedback] = useState("");

  if (!result) {
    return (
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Output</h2>
        <p className="text-gray-500">Generate an email to see the output here.</p>
      </section>
    );
  }

  const handleRefine = async () => {
    if (!feedback || !result?.email) return;

    const response = await fetch("/api/refine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailBody: result?.email?.body || "",
        feedback,
        intent: result?.intent || "",
        cleanedSituation: result?.cleanedSituation || "",
        recipient: result?.recipient || "",
        style: result?.style || "",
        tone: result?.tone || "",
        instructions: result?.instructions || "",
      }),
    });

    const data = await response.json();

    if (data.success) {
      setResult({
        ...result,
        email: {
          ...(result?.email || {}),
          body: data.updatedBody,
        },
      });
      setFeedback("");
    } else {
      console.error("Refine failed", data.error);
    }
  };

  const riskLevel = result?.audit?.riskLevel || "Unknown";

  return (
    <section className="space-y-6">
        <>
          {/* INTENT */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3">
              <h3 className="text-sm font-bold text-white">Detected Intent</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-lg font-semibold text-purple-700">{result?.intent || "—"}</span>
              </div>
            </div>
          </div>

          {/* GENERATED EMAIL */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Generated Email</h3>
              <p className="text-green-100 text-sm mt-1">AI-crafted professional communication</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Subject Line</div>
                <p className="text-base font-semibold text-gray-900">{result?.email?.subject || "—"}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Email Body</div>
                <div className="prose prose-sm max-w-none">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">{result?.email?.body || "—"}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* REFINEMENT SECTION */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-3">
              <h3 className="text-sm font-bold text-white">Refine Email</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Provide specific feedback to improve the email tone, content, or style</p>
              
              <textarea
                placeholder="Examples: Make it more confident • Reduce emotional tone • Be more respectful but firm • Avoid sounding desperate"
                className="w-full border border-gray-300 rounded-lg p-4 text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />

              <button
                onClick={handleRefine}
                disabled={!feedback}
                className="w-full bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                🔄 Update Email
              </button>
            </div>
          </div>

          {/* BEFORE vs AFTER */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
              <h3 className="text-sm font-bold text-white">Comparison: Before & After</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h4 className="font-semibold text-gray-900">Before (Your Input)</h4>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{situation}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="font-semibold text-gray-900">After (AI Email)</h4>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{result?.email?.body || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RISK ANALYSIS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Risk Analysis</h3>
              <p className="text-orange-100 text-sm mt-1">Compliance and safety evaluation</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-sm font-semibold text-gray-700">Risk Level:</span>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  riskLevel === "Low" ? "bg-green-100 text-green-800" :
                  riskLevel === "Medium" ? "bg-yellow-100 text-yellow-800" :
                  riskLevel === "Unknown" ? "bg-gray-100 text-gray-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {riskLevel}
                </span>
              </div>

              {result?.audit?.issues?.length > 0 ? (
                <div className="space-y-3">
                  {result?.audit?.issues?.map((issue, idx) => (
                    <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-semibold text-red-900">Problem:</span>
                          <p className="text-gray-700 mt-1">{issue?.line || "—"}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-red-900">Why:</span>
                          <p className="text-gray-700 mt-1">{issue?.reason || "—"}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-green-900">Safer Alternative:</span>
                          <p className="text-gray-700 mt-1">{issue?.safeAlternative || "—"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="text-green-600 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-green-800">No compliance issues detected</p>
                  <p className="text-xs text-green-600 mt-1">Email appears safe to send</p>
                </div>
              )}
            </div>
          </div>

          {/* CONFIDENCE METER */}
          <div className={`rounded-xl shadow-sm border-2 overflow-hidden ${
            riskLevel === "Low" ? "bg-green-50 border-green-300" :
            riskLevel === "Medium" ? "bg-yellow-50 border-yellow-300" :
            riskLevel === "Unknown" ? "bg-gray-50 border-gray-300" :
            "bg-red-50 border-red-300"
          }`}>
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">
                {riskLevel === "Low" ? "✅" : riskLevel === "Medium" ? "⚠️" : riskLevel === "Unknown" ? "❓" : "❌"}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confidence Assessment</h3>
              <p className={`text-base font-semibold ${
                riskLevel === "Low" ? "text-green-700" : riskLevel === "Medium" ? "text-yellow-700" : riskLevel === "Unknown" ? "text-gray-700" : "text-red-700"
              }`}>
                {riskLevel === "Low" ? "Safe to Send" : riskLevel === "Medium" ? "Review Suggested" : riskLevel === "Unknown" ? "Not Evaluated" : "High Risk — Revise Required"}
              </p>
            </div>
          </div>
        </>
    </section>
  );
}