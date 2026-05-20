const BudgetCard = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-2">
        Monthly Budget
      </h2>

      <p className="text-gray-600 mb-4">
        Limit: ₹10,000
      </p>

      <div className="w-full bg-gray-200 rounded-full h-4">
        <div className="bg-blue-500 h-4 rounded-full w-1/2"></div>
      </div>

      <p className="mt-2 text-sm text-gray-500">
        50% Used
      </p>
    </div>
  );
};

export default BudgetCard;