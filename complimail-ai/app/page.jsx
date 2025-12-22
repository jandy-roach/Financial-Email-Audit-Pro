import InputForm from "../components/InputForm";
import OutputView from "../components/OutputView";

export default function Home() {
  return (
    <main style={{ padding: "20px" }}>
      <h1>CompliMail AI</h1>
      <InputForm />
      <OutputView />
    </main>
  );
}
