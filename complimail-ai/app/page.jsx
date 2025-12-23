import InputForm from "../components/InputForm";
import OutputView from "../components/OutputView";

export default function Home() {
  return (
    <main style={{ padding: "20px" }}>
      <h1 className="text-4xl font-bold text-red-500 underline">
        Tailwind Working
      </h1>

      <InputForm />
      <OutputView />
    </main>
  );
}
