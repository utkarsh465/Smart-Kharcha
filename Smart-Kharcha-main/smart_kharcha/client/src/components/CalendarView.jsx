import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CalendarView = ({ transactions }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formattedDate = selectedDate.toISOString().split("T")[0];

  const filteredTransactions = (transactions || []).filter(
    (t) => t.date === formattedDate
  );

  return (
    <div>
      <h2 className="font-semibold mb-4">Expense Calendar</h2>

      <Calendar onChange={setSelectedDate} value={selectedDate} />

      <div className="mt-4">
        <h3 className="font-medium mb-2">
          Transactions on {formattedDate}
        </h3>

        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500">No transactions on this date.</p>
        ) : (
          <ul className="space-y-2">
            {filteredTransactions.map((t, index) => (
              <li
                key={index}
                className="p-2 border rounded flex justify-between"
              >
                <span>{t.category}</span>
                <span
                  className={
                    t.type === "Income"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  ₹{t.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CalendarView;