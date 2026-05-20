import { useState, useEffect } from "react";
import api from "../utils/api";
import Analytics from "../components/Analytics";
import { FaArrowUp, FaArrowDown, FaWallet, FaSearch, FaPlus, FaDownload, FaEdit, FaTrash } from "react-icons/fa";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    type: "Income",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    title: "" // Added title to match backend model
  });
  
  const [editId, setEditId] = useState(null); // Use ID instead of index
  
  const [budgetLimit, setBudgetLimit] = useState(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const allLimits = JSON.parse(localStorage.getItem("budgetLimits")) || {};
    if (currentUser && allLimits[currentUser.email]) {
      return allLimits[currentUser.email];
    }
    return 10000;
  });
  
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [tempLimit, setTempLimit] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch from API
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

  // Save budget limit to localStorage (keep this local as backend doesn't have a limit model yet)
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return;

    const allLimits = JSON.parse(localStorage.getItem("budgetLimits")) || {};
    allLimits[currentUser.email] = budgetLimit;

    localStorage.setItem("budgetLimits", JSON.stringify(allLimits));
  }, [budgetLimit]);

  const handleSaveLimit = () => {
    const newLimit = Number(tempLimit);
    if (newLimit > 0) {
      setBudgetLimit(newLimit);
    }
    setIsEditingLimit(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!formData.amount || !formData.category || !formData.date) {
      alert("Fill all fields");
      return;
    }

    const amountNum = Number(formData.amount);
    
    if (formData.type.toLowerCase() === "expense") {
      const currentTotal = transactions
        .filter((t) => t.type?.toLowerCase() === "expense" && t._id !== editId)
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      
      if (currentTotal + amountNum > budgetLimit) {
        alert("Warning: This transaction exceeds your monthly budget limit of ₹" + budgetLimit + "!");
      }
    }

    try {
      if (editId !== null) {
        const { data } = await api.put(`/transactions/${editId}`, {
          ...formData,
          amount: amountNum,
          title: formData.title || formData.category // default title to category if empty
        });
        setTransactions(transactions.map(t => t._id === editId ? data : t));
        setEditId(null);
      } else {
        const { data } = await api.post("/transactions", {
          ...formData,
          amount: amountNum,
          title: formData.title || formData.category
        });
        setTransactions([...transactions, data]);
      }

      setFormData({
        type: "Income",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        title: ""
      });
    } catch (err) {
      console.error("Failed to save transaction:", err);
      alert("Error saving transaction");
    }
  };

  const handleDelete = async (idToDelete) => {
    try {
      await api.delete(`/transactions/${idToDelete}`);
      setTransactions(transactions.filter((t) => t._id !== idToDelete));
    } catch (err) {
      console.error("Failed to delete transaction:", err);
    }
  };

  const exportCSV = () => {
    if (transactions.length === 0) {
      alert("No transactions to export");
      return;
    }

    const headers = ["Title", "Type", "Amount", "Category", "Date"];
    const rows = transactions.map((t) => [t.title || t.category, t.type, t.amount, t.category, t.date?.split("T")[0]]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
  };

  const handleEdit = (transaction) => {
    setFormData({
      type: transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1), // Convert to TitleCase for form select
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date?.split("T")[0] || new Date().toISOString().split("T")[0],
      title: transaction.title || ""
    });
    setEditId(transaction._id);
  };

  // Sort all transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  const finalTransactions = sortedTransactions.filter((t) =>
    (t.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.amount || "").toString().includes(searchTerm) ||
    (t.type || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIncome = finalTransactions
    .filter((t) => t.type?.toLowerCase() === "income")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalExpense = finalTransactions
    .filter((t) => t.type?.toLowerCase() === "expense")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const balance = totalIncome - totalExpense;

  const percentage = Math.min((totalExpense / budgetLimit) * 100 || 0, 100);

  const categories = [
    "Food & Dining", "Transportation", "Housing & Rent", "Utilities",
    "Healthcare", "Entertainment", "Shopping", "Savings & Investments",
    "Personal Care", "Salary", "Other"
  ];

  const suggestionList = [...categories, "Income", "Expense"];
  const filteredSuggestions = searchTerm.length >= 3 
    ? suggestionList.filter(opt => opt.toLowerCase().startsWith(searchTerm.toLowerCase()))
    : [];

  return (
    <div 
      className="p-4 md:p-8 space-y-8 w-full"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Welcome back! Here's your financial overview.</p>
        </div>

        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            list="search-suggestions"
            className="w-full sm:w-72 pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-brand-dark border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 shadow-sm transition-all"
          />
          <datalist id="search-suggestions">
            {filteredSuggestions.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Income Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-900/10 p-6 rounded-2xl shadow-sm border border-emerald-200/50 dark:border-emerald-500/20 relative overflow-hidden group">
          <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
            <FaArrowUp size={24} />
          </div>
          <h2 className="text-slate-500 dark:text-emerald-100/70 font-medium mb-1">Monthly Income</h2>
            ₹{(totalIncome || 0).toLocaleString()}
        </div>

        {/* Expense Card */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/40 dark:to-rose-900/10 p-6 rounded-2xl shadow-sm border border-rose-200/50 dark:border-rose-500/20 relative overflow-hidden group">
          <div className="absolute top-4 right-4 bg-rose-500/10 text-rose-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
            <FaArrowDown size={24} />
          </div>
          <h2 className="text-slate-500 dark:text-rose-100/70 font-medium mb-1">Monthly Expense</h2>
            ₹{(totalExpense || 0).toLocaleString()}
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 dark:from-brand-primary/20 dark:to-brand-primary/5 p-6 rounded-2xl shadow-sm border border-brand-primary/20 relative overflow-hidden group">
          <div className="absolute top-4 right-4 bg-brand-primary/10 text-brand-primary dark:text-brand-secondary p-3 rounded-xl group-hover:scale-110 transition-transform">
            <FaWallet size={24} />
          </div>
          <h2 className="text-slate-500 dark:text-brand-light/70 font-medium mb-1">Monthly Balance</h2>
            ₹{(balance || 0).toLocaleString()}
        </div>

      </div>

      <div className="space-y-6 mt-6">
          
          {/* Monthly Budget */}
          <div className="bg-white dark:bg-brand-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-display font-semibold">Monthly Budget</h2>
              {isEditingLimit ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-500">₹</span>
                  <input
                    type="number"
                    value={tempLimit}
                    onChange={(e) => setTempLimit(e.target.value)}
                    className="w-20 px-2 py-1 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveLimit}
                    className="text-xs bg-brand-primary text-white px-3 py-1.5 rounded-lg hover:bg-brand-secondary transition-colors font-medium"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 font-medium cursor-pointer" onClick={() => { setTempLimit(budgetLimit); setIsEditingLimit(true); }}>
                    Limit: ₹{budgetLimit}
                  </span>
                  <button
                    onClick={() => { setTempLimit(budgetLimit); setIsEditingLimit(true); }}
                    className="text-slate-400 hover:text-brand-primary transition-colors p-1"
                    title="Edit Limit"
                  >
                    <FaEdit size={14} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full ${percentage >= 100 ? "bg-rose-500" : "bg-brand-primary"}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-sm text-slate-500 mt-3 font-medium flex justify-between">
              <span>Used</span>
              <span className={percentage >= 100 ? "text-rose-500" : "text-brand-primary"}>{percentage.toFixed(1)}%</span>
            </p>
          </div>

          {/* Add Transaction Form */}
          <div className="bg-white dark:bg-brand-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-full -z-10"></div>
            <h2 className="text-lg font-display font-semibold mb-5">{editId !== null ? "Edit Transaction" : "New Transaction"}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description/Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Monthly Rent"
                  className="w-full border border-gray-200 dark:border-white/10 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-gray-200 dark:border-white/10 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-medium [color-scheme:light] dark:[color-scheme:dark]"
                >
                  <option value="Income" className="dark:bg-slate-800">Income</option>
                  <option value="Expense" className="dark:bg-slate-800">Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="e.g. 5000"
                  className="w-full border border-gray-200 dark:border-white/10 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-200 dark:border-white/10 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-medium [color-scheme:light] dark:[color-scheme:dark]"
                >
                  <option value="" className="dark:bg-slate-800">Select a category</option>
                  <option value="Food & Dining" className="dark:bg-slate-800">Food & Dining</option>
                  <option value="Transportation" className="dark:bg-slate-800">Transportation</option>
                  <option value="Housing & Rent" className="dark:bg-slate-800">Housing & Rent</option>
                  <option value="Utilities" className="dark:bg-slate-800">Utilities</option>
                  <option value="Healthcare" className="dark:bg-slate-800">Healthcare</option>
                  <option value="Entertainment" className="dark:bg-slate-800">Entertainment</option>
                  <option value="Shopping" className="dark:bg-slate-800">Shopping</option>
                  <option value="Savings & Investments" className="dark:bg-slate-800">Savings & Investments</option>
                  <option value="Personal Care" className="dark:bg-slate-800">Personal Care</option>
                  <option value="Salary" className="dark:bg-slate-800">Salary</option>
                  <option value="Other" className="dark:bg-slate-800">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full border border-gray-200 dark:border-white/10 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-medium [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

            </div>
            
            <button
              type="button"
              onClick={handleAdd}
              className="w-full md:w-auto mt-6 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-medium px-8 py-3 rounded-xl shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              {editId !== null ? <FaEdit /> : <FaPlus />}
              {editId !== null ? "Update Transaction" : "Add Transaction"}
            </button>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white dark:bg-brand-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col">
            
            <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <h2 className="text-lg font-display font-semibold">Recent Transactions</h2>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                <FaDownload /> Export
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider text-xs font-semibold">
                  <tr>
                    <th className="p-4 rounded-tl-lg">Type</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {finalTransactions.length > 0 ? (
                      finalTransactions.map((t) => (
                      <tr 
                        key={t._id} 
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                      >
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            t.type?.toLowerCase() === "income" 
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                                : "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                          }`}>
                            {t.type?.toLowerCase() === "income" ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                            {t.type}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-700 dark:text-slate-200">₹{t.amount}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">
                          <div className="flex flex-col">
                            <span className="font-semibold">{t.title}</span>
                            <span className="text-xs text-slate-400">{t.category}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-500 text-sm whitespace-nowrap">{t.date?.split("T")[0]}</td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(t)}
                            className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(t._id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FaTrash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* Cash Flow Overview */}
          <div className="bg-white dark:bg-brand-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
            <h2 className="text-lg font-display font-semibold mb-4">Cash Flow Overview</h2>
            <Analytics transactions={finalTransactions} />
          </div>

      </div>
    </div>
  );
};

export default Dashboard;