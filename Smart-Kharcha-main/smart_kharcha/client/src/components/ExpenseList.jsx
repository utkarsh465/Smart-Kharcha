const ExpenseList = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow mt-8">
      <h2 className="text-lg font-semibold mb-4">
        Transaction History
      </h2>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">Type</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-b">
            <td className="py-2 text-green-600">Income</td>
            <td>₹5000</td>
            <td>Salary</td>
            <td>01-03-2026</td>
          </tr>

          <tr>
            <td className="py-2 text-red-600">Expense</td>
            <td>₹1000</td>
            <td>Food</td>
            <td>02-03-2026</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseList;