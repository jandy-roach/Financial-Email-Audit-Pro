export default function InputForm() {
  return (
    <section className="bg-white p-6 rounded-lg shadow mb-8">
      <h2 className="text-xl font-semibold mb-4">Input</h2>

      <textarea
        placeholder="Describe your financial situation"
        rows={5}
        className="w-full border rounded p-3 mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <select className="border rounded p-2">
          <option>Bank Manager</option>
          <option>Tax Officer</option>
          <option>Client</option>
        </select>

        <select className="border rounded p-2">
          <option>Professional</option>
          <option>Polite</option>
          <option>Firm</option>
          <option>Angry</option>
        </select>

        <select className="border rounded p-2">
          <option>Apologetic</option>
          <option>Neutral</option>
          <option>Assertive</option>
        </select>
      </div>

      <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
        Generate Email
      </button>
    </section>
  );
}