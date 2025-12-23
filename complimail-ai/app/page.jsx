import InputForm from "../components/InputForm";
import OutputView from "../components/OutputView";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-4xl p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          CompliMail AI
        </h1>

        <InputForm />
        <OutputView />
      </div>
    </main>
  );
}
