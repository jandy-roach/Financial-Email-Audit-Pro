import { useState } from "react";
import InputForm from "../components/InputForm";
import OutputView from "../components/OutputView";

export default function Home() {
  const [result, setResult] = useState(null);
  const [situation, setSituation] = useState("");

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-4xl p-6 space-y-6">
        <h1 className="text-3xl font-bold text-center">
          CompliMail AI
        </h1>

        <InputForm
          setResult={setResult}
          situation={situation}
          setSituation={setSituation}
        />

        <OutputView situation={situation} result={result} />
      </div>
    </main>
  );
}
