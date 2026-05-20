import React from "react";
import { FaPlusCircle, FaCamera, FaChartPie, FaCalendarAlt, FaDownload, FaWallet, FaLightbulb } from "react-icons/fa";

const HowToUse = () => {
  const steps = [
    {
      icon: <FaWallet className="text-brand-primary" size={24} />,
      title: "1. Manage Your Dashboard",
      description: "Your dashboard is the control center.",
      details: [
        "Set your Monthly Budget limit at the top to track your spending.",
        "Add manually by choosing Income or Expense, entering the amount, category, and date.",
        "Edit or Delete any past transactions directly from the Recent Transactions list."
      ]
    },
    {
      icon: <FaCamera className="text-emerald-500" size={24} />,
      title: "2. Smart Receipt Scanner",
      description: "Save time by scanning your bills.",
      details: [
        "Go to the 'Scan Receipt' page from the sidebar.",
        "Upload a clear image of your bill or receipt.",
        "Our AI will automatically detect the Total Amount.",
        "Verify the amount, choose a category, and click 'Add to Expenses'."
      ]
    },
    {
      icon: <FaChartPie className="text-purple-500" size={24} />,
      title: "3. Analyze Your Spending",
      description: "Understand where your money goes.",
      details: [
        "Visit the Analytics page to see visual breakdowns of your expenses.",
        "View beautiful Pie Charts categorized by exactly how you spend.",
        "Check Bar Charts to see your cash flow (Income vs Expense) over time."
      ]
    },
    {
      icon: <FaCalendarAlt className="text-amber-500" size={24} />,
      title: "4. Calendar View",
      description: "Track your daily spending habits.",
      details: [
        "The Calendar highlights dates where you made transactions.",
        "Click on any specific date to see exactly what you spent or earned on that day."
      ]
    },
    {
      icon: <FaDownload className="text-blue-500" size={24} />,
      title: "5. Export Your Data",
      description: "Keep backups of your finances.",
      details: [
        "At the top of your Recent Transactions list, click the 'Export' button.",
        "This will download a CSV file of all your data directly to your device."
      ]
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 w-full">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-800 dark:text-white">
          How to Use Smart Kharcha
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
          Master your personal finances in minutes. Here is your complete guide to getting the most out of our features.
        </p>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-brand-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent group-hover:via-brand-primary transition-colors"></div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                {step.icon}
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold text-slate-800 dark:text-white">
                  {step.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {step.description}
                </p>
              </div>
            </div>

            <ul className="space-y-3 text-slate-600 dark:text-slate-300 ml-2">
              {step.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0"></div>
                  <span className="text-sm leading-relaxed">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Pro Tip Card - spans full width on desktop */}
        <div className="bg-gradient-to-br from-brand-primary/5 to-brand-primary/10 dark:from-brand-primary/20 dark:to-brand-primary/5 p-6 rounded-2xl border border-brand-primary/20 md:col-span-2 flex flex-col sm:flex-row items-center gap-6 mt-2">
          <div className="p-4 bg-white dark:bg-brand-dark rounded-full shadow-sm shrink-0">
            <FaLightbulb className="text-amber-500 text-3xl" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-slate-800 dark:text-white mb-2">Pro Tip: Dark Mode</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your eyes matter! Smart Kharcha supports a beautiful Dark Mode. You can toggle between light and dark themes using the icon in the top navigation bar. Your preference is automatically saved!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToUse;