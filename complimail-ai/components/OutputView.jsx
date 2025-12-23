export default function OutputView() {
  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Output</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Before</h3>
          <p className="text-sm text-gray-600">
            User input will appear here
          </p>
        </div>

        <div>
          <h3 className="font-medium mb-2">After</h3>
          <p className="text-sm text-gray-600">
            AI-generated email will appear here
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-medium mb-2">Risk Analysis</h3>
        <p className="text-sm text-gray-600">
          Risk analysis will appear here
        </p>
      </div>

      <div className="mt-4">
        <h3 className="font-medium mb-2">Confidence Meter</h3>
        <p className="text-sm text-gray-600">
          Not evaluated yet
        </p>
      </div>
    </section>
  );
}
