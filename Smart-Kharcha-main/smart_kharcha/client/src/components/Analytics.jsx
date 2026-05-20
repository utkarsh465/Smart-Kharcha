import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const Analytics = ({ transactions }) => {

  const totalIncome = transactions
    .filter(t => t.type?.toLowerCase() === "income")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type?.toLowerCase() === "expense")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const balance = Math.max(0, totalIncome - totalExpense);

  const pieData = [
    { name: "Balance", value: balance },
    { name: "Expense", value: totalExpense }
  ];

  const COLORS = ["#16a34a", "#dc2626"];

  // Monthly grouping
  const monthlyData = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  transactions.forEach(t => {
    try {
      if (!t.date) return;
      const dateObj = new Date(t.date);
      if (isNaN(dateObj)) return;
      const monthIndex = dateObj.getMonth();
      const month = monthNames[monthIndex];
      const year = dateObj.getFullYear();
      const key = `${month} ${year}`;
      
      if (!monthlyData[key]) {
        monthlyData[key] = { month: key, income: 0, expense: 0, sortKey: year * 100 + monthIndex };
      }
      
      if (t.type?.toLowerCase() === "income") {
        monthlyData[key].income += (Number(t.amount) || 0);
      } else if (t.type?.toLowerCase() === "expense") {
        monthlyData[key].expense += (Number(t.amount) || 0);
      }
    } catch { /* ignore parse errors */ }
  });

  const barData = Object.values(monthlyData).sort((a, b) => a.sortKey - b.sortKey);

  return (
    <div className="grid md:grid-cols-2 gap-6">

      {/* Pie Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          Budget Distribution (Spent vs Remaining)
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              outerRadius={100}
              innerRadius={60}
              paddingAngle={5}
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-sm text-slate-500 font-medium">Balance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <span className="text-sm text-slate-500 font-medium">Expense</span>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          Monthly Cash Flow
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="income" fill="#16a34a" radius={[4, 4, 0, 0]} name="Income" />
            <Bar dataKey="expense" fill="#dc2626" radius={[4, 4, 0, 0]} name="Expense" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default Analytics;