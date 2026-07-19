const Transaction = require("../models/Transaction");

// get all transactions for a user
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id });

    res.json(transactions);

  } catch (err) {
    console.error("Update Transaction Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};


// add new transaction
const addTransaction = async (req, res) => {
  try {
    console.log("Add Transaction Body:", req.body);
    const { title, amount, type, category, date } = req.body;
 
    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount,
      type,
      category,
      date: date || undefined
    });

    console.log("Created Transaction:", transaction);
    res.json(transaction);

  } catch (err) {
    console.error("Add Transaction Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// update transaction
const updateTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;
    console.log("Update Body:", req.body);

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    transaction.title = title || transaction.title;
    transaction.amount = amount || transaction.amount;
    transaction.type = type || transaction.type;
    transaction.category = category || transaction.category;
    if (date) transaction.date = date;

    const updated = await transaction.save();
    console.log("Updated Transaction:", updated);
    res.json(updated);

  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// delete transaction
const deleteTransaction = async (req, res) => {
  try {

    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found or not authorized" });
    }

    await transaction.deleteOne();

    res.json({ message: "Transaction deleted" });

  } catch (err) {
    console.error("Delete Transaction Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// get transactions grouped by date for a specific month
const getCalendarTransactions = async (req, res) => {
  try {
    const { month } = req.query; // format: YYYY-MM
    let yearVal, monthIndex;
    
    if (month) {
      const parts = month.split("-");
      yearVal = parseInt(parts[0]);
      monthIndex = parseInt(parts[1]) - 1; // 0-indexed month
    } else {
      const d = new Date();
      yearVal = d.getFullYear();
      monthIndex = d.getMonth();
    }

    const startOfMonth = new Date(yearVal, monthIndex, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(yearVal, monthIndex + 1, 0, 23, 59, 59, 999);

    const transactions = await Transaction.find({
      user: req.user._id,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    }).sort({ date: 1 });

    const grouped = {};
    transactions.forEach(t => {
      const localDate = new Date(t.date);
      const yearStr = localDate.getFullYear();
      const monthStr = String(localDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(localDate.getDate()).padStart(2, '0');
      const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push({
        _id: t._id,
        title: t.title,
        description: t.title,
        amount: t.amount,
        category: t.category,
        date: t.date,
        type: t.type
      });
    });

    res.json(grouped);

  } catch (err) {
    console.error("Get Calendar Transactions Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// get dashboard metrics
const getDashboardMetrics = async (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-11
    
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
    const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    
    const startOfPrevMonth = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0);
    const endOfPrevMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
    
    const dayOfWeek = today.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfCurrentWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysSinceMonday, 0, 0, 0, 0);

    const allTimeTotals = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      { $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);
    
    let allTimeIncome = 0;
    let allTimeExpense = 0;
    allTimeTotals.forEach(item => {
      if (item._id === 'income') allTimeIncome = item.total;
      else if (item._id === 'expense') allTimeExpense = item.total;
    });
    
    const netBalance = allTimeIncome - allTimeExpense;

    const todayTransactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startOfToday, $lte: endOfToday }
    });
    
    let todayExpense = 0;
    let todayIncome = 0;
    todayTransactions.forEach(t => {
      if (t.type === 'expense') todayExpense += t.amount;
      else if (t.type === 'income') todayIncome += t.amount;
    });

    const currentMonthTransactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth }
    });

    let currentMonthExpense = 0;
    let currentMonthIncome = 0;
    const categoryExpenses = {};
    currentMonthTransactions.forEach(t => {
      if (t.type === 'expense') {
        currentMonthExpense += t.amount;
        categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
      } else {
        currentMonthIncome += t.amount;
      }
    });

    const prevMonthTransactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth }
    });
    
    let prevMonthExpense = 0;
    let prevMonthIncome = 0;
    const prevCategoryExpenses = {};
    prevMonthTransactions.forEach(t => {
      if (t.type === 'expense') {
        prevMonthExpense += t.amount;
        prevCategoryExpenses[t.category] = (prevCategoryExpenses[t.category] || 0) + t.amount;
      } else {
        prevMonthIncome += t.amount;
      }
    });

    const smartInsights = [];
    
    let highestCategory = 'Other';
    let highestCatAmt = 0;
    Object.keys(categoryExpenses).forEach(cat => {
      if (categoryExpenses[cat] > highestCatAmt) {
        highestCatAmt = categoryExpenses[cat];
        highestCategory = cat;
      }
    });
    if (highestCatAmt > 0) {
      smartInsights.push(`💡 ${highestCategory} is your highest expense category this month.`);
    }

    if (prevMonthExpense > 0) {
      if (currentMonthExpense < prevMonthExpense) {
        const diff = prevMonthExpense - currentMonthExpense;
        smartInsights.push(`💡 You spent ₹${diff.toFixed(0)} less than last month.`);
      } else {
        const diff = currentMonthExpense - prevMonthExpense;
        smartInsights.push(`💡 Warning: You spent ₹${diff.toFixed(0)} more than last month.`);
      }
    } else {
      smartInsights.push(`💡 Keep tracking your expenses to build a month-over-month comparison.`);
    }

    const currentFood = categoryExpenses['Food'] || 0;
    const prevFood = prevCategoryExpenses['Food'] || 0;
    if (prevFood > 0) {
      const increasePct = ((currentFood - prevFood) / prevFood) * 100;
      if (increasePct > 5) {
        smartInsights.push(`💡 Food spending increased by ${increasePct.toFixed(0)}% compared to last month.`);
      } else if (increasePct < -5) {
        smartInsights.push(`💡 Amazing! Food spending decreased by ${Math.abs(increasePct).toFixed(0)}% compared to last month.`);
      }
    }

    const budgetLimitVal = req.query.budgetLimit ? Number(req.query.budgetLimit) : 10000;
    if (currentMonthExpense <= budgetLimitVal) {
      smartInsights.push(`💡 Great job! You stayed within your budget limits this month.`);
    } else {
      smartInsights.push(`💡 Warning: You have exceeded your monthly budget by ₹${(currentMonthExpense - budgetLimitVal).toFixed(0)}.`);
    }

    if (currentMonthIncome > 0) {
      const savingsPct = ((currentMonthIncome - currentMonthExpense) / currentMonthIncome) * 100;
      if (savingsPct > 0) {
        smartInsights.push(`💡 Your savings rate is at ${savingsPct.toFixed(0)}% of your income this month.`);
      }
    }

    const currentDayOfMonth = today.getDate();
    const avgDailyExpense = currentMonthExpense / currentDayOfMonth;

    const monthlyDailyExpenses = {};
    currentMonthTransactions.forEach(t => {
      if (t.type === 'expense') {
        const dateStr = new Date(t.date).toISOString().split('T')[0];
        monthlyDailyExpenses[dateStr] = (monthlyDailyExpenses[dateStr] || 0) + t.amount;
      }
    });

    let highestSpendDay = 'None';
    let highestSpendAmt = 0;
    let lowestSpendDay = 'None';
    let lowestSpendAmt = Infinity;

    Object.keys(monthlyDailyExpenses).forEach(dateStr => {
      const amt = monthlyDailyExpenses[dateStr];
      if (amt > highestSpendAmt) {
        highestSpendAmt = amt;
        highestSpendDay = dateStr;
      }
      if (amt < lowestSpendAmt) {
        lowestSpendAmt = amt;
        lowestSpendDay = dateStr;
      }
    });

    if (lowestSpendAmt === Infinity) lowestSpendAmt = 0;

    res.json({
      netBalance,
      totalIncome: allTimeIncome,
      totalExpense: allTimeExpense,
      todaySummary: {
        expense: todayExpense,
        income: todayIncome,
        transactionsCount: todayTransactions.length
      },
      currentMonthMetrics: {
        expense: currentMonthExpense,
        income: currentMonthIncome
      },
      smartInsights,
      weeklyAnalytics: {
        avgDailyExpense,
        highestSpendingDay: highestSpendDay !== 'None' ? {
          date: highestSpendDay,
          amount: highestSpendAmt
        } : null,
        lowestSpendingDay: lowestSpendDay !== 'None' ? {
          date: lowestSpendDay,
          amount: lowestSpendAmt
        } : null,
        transactionsCount: currentMonthTransactions.length,
        mostUsedCategory: highestCategory
      }
    });

  } catch (err) {
    console.error("Get Dashboard Metrics Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
  getCalendarTransactions,
  getDashboardMetrics
};