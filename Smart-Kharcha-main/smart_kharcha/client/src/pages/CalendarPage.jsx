import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import api from "../utils/api";

const CalendarPage = () => {
  const [date, setDate] = useState(new Date());
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await api.get("/transactions");
        setTransactions(data);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      }
    };
    fetchTransactions();
  }, []);

  
  // Filter transactions for selected date
  const transactionsOnDate = transactions.filter((t) => {
    if (!t.date) return false;
    const selected = new Date(date).toLocaleDateString('en-CA');
    const tDate = new Date(t.date).toLocaleDateString('en-CA');
    return tDate === selected;
  });

  return (
    <div className="p-6 space-y-8">

      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Expense Calendar
      </h1>

      {/* Centered Calendar */}
      <div className="flex justify-center">
        <div className="p-6 rounded shadow bg-white dark:bg-transparent">
          <Calendar
            onChange={setDate}
            value={date}
            tileContent={({ date, view }) => {
              if (view === "month") {
                const formatted = date.toLocaleDateString('en-CA');

                const dayTransactions = transactions.filter(
                  (t) => new Date(t.date).toLocaleDateString('en-CA') === formatted
                );

                const hasIncome = dayTransactions.some(
                  (t) => t.type?.toLowerCase() === "income"
                );

                const hasExpense = dayTransactions.some(
                  (t) => t.type?.toLowerCase() === "expense"
                );

                return (
                  <div className="flex justify-center gap-1 mt-1">
                    {hasIncome && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                    {hasExpense && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                );
              }
            }}
          />
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        {transactionsOnDate.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            No transactions on this date.
          </p>
        ) : (
          transactionsOnDate.map((t) => (
            <div key={t._id} className="py-2 border-b dark:border-gray-700">
              <span
                className={
                  t.type?.toLowerCase() === "income"
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {t.type?.charAt(0).toUpperCase() + t.type?.slice(1)}
              </span>{" "}
              ₹{t.amount} - {t.title || t.category}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default CalendarPage;