"use client";
import { useState } from "react";
import InputForm from "../components/InputForm";
import OutputView from "../components/OutputView";

export default function Home() {
  const [result, setResult] = useState(null);
  const [situation, setSituation] = useState("");

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-3">
            CompliMail AI
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Generate professional, compliant financial emails with AI-powered risk analysis
          </p>
        </div>

        <div className="space-y-8">
          <InputForm
            situation={situation}
            setSituation={setSituation}
            setResult={setResult}
          />

          <OutputView
            situation={situation}
            result={result}
            setResult={setResult}
          />
        </div>

        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Powered by AI • Built for professionals • Designed for compliance</p>
        </div>
      </div>
    </main>
  );
}