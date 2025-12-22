export default function InputForm() {
  return (
    <section>
      <h2>Input</h2>

      <textarea
        placeholder="Describe your financial situation"
        rows={5}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <select style={{ width: "100%", marginBottom: "10px" }}>
        <option>Bank Manager</option>
        <option>Tax Officer</option>
        <option>Client</option>
      </select>

      <select style={{ width: "100%", marginBottom: "10px" }}>
        <option>Professional</option>
        <option>Polite</option>
        <option>Firm</option>
        <option>Angry</option>
      </select>

      <select style={{ width: "100%", marginBottom: "10px" }}>
        <option>Apologetic</option>
        <option>Neutral</option>
        <option>Assertive</option>
      </select>

      <button>Generate Email</button>
    </section>
  );
}
