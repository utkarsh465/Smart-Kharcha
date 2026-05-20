const ExpenseForm = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow mt-8">
      <h2 className="text-lg font-semibold mb-4">
        Add Transaction
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <select className="p-2 border rounded">
          <option>Income</option>
          <option>Expense</option>
        </select>

        <input
          type="number"
          placeholder="Amount"
          className="p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Category"
          className="p-2 border rounded"
        />

        <input
          type="date"
          className="p-2 border rounded"
        />
      </div>

      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Add
      </button>
    </div>
  );
};

export default ExpenseForm;