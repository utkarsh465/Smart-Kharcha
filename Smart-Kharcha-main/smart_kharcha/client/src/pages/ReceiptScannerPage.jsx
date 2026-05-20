import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Tesseract from "tesseract.js";

const ReceiptScannerPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(null);

    const handleScan = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));
        setLoading(true);

        try {
            const { data } = await Tesseract.recognize(file, "eng");
            const text = data.text;
            const detectedAmount = extractAmount(text);
            
            if (detectedAmount) {
                setAmount(detectedAmount);
            } else {
                console.log("No amount detected");
            }
        } catch (error) {
            console.error("OCR Error:", error);
            alert("Failed to scan receipt. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const extractAmount = (text) => {
        const lines = text.split("\n");
        let potentialAmounts = [];

        // 1. Look for lines with payment-related keywords
        const targetKeywords = ["total", "net", "amount", "grand", "payable", "paid", "₹", "rs", "inr"];
        
        for (const line of lines) {
            const lowerLine = line.toLowerCase();
            const hasKeyword = targetKeywords.some(kw => lowerLine.includes(kw));

            if (hasKeyword) {
                // Find all numbers in this line
                const matches = line.match(/(\d+[\d.,]*)/g) || [];
                for (const match of matches) {
                    const cleanNum = match.replace(/,/g, '');
                    const num = parseFloat(cleanNum);
                    if (!isNaN(num) && num > 0 && num < 100000) { // Reasonable limit for daily kharcha
                        potentialAmounts.push({
                            value: num,
                            priority: lowerLine.includes("total") || lowerLine.includes("grand") ? 3 : 2
                        });
                    }
                }
            }
        }

        // 2. If no keywords found or captured, look for the largest number that looks like a price (has decimals)
        if (potentialAmounts.length === 0) {
            const allMatches = text.match(/(\d+[.,]\d{2})/g) || [];
            for (const match of allMatches) {
                const cleanNum = match.replace(/,/g, '');
                const num = parseFloat(cleanNum);
                if (!isNaN(num) && num > 0 && num < 100000) {
                    potentialAmounts.push({ value: num, priority: 1 });
                }
            }
        }

        // 3. Fallback: just find the largest reasonable number
        if (potentialAmounts.length === 0) {
            const allNumbers = text.match(/(\d+(\.\d{1,2})?)/g) || [];
            for (const match of allNumbers) {
                const num = parseFloat(match);
                // Avoid picking up dates (often match \d{2}-\d{2}-\d{4} or similar)
                // If it looks like a year (2023-2026), skip it
                if (!isNaN(num) && num > 10 && num < 100000 && num !== 2024 && num !== 2025 && num !== 2026) {
                    potentialAmounts.push({ value: num, priority: 0 });
                }
            }
        }

        if (potentialAmounts.length > 0) {
            // Sort by priority (desc) then value (desc)
            potentialAmounts.sort((a, b) => b.priority - a.priority || b.value - a.value);
            return potentialAmounts[0].value;
        }

        return null;
    };
  const [preview, setPreview] = useState(null);

  const handleAddExpense = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const allTransactions =
      JSON.parse(localStorage.getItem("transactions")) || {};

    const userTransactions =
      allTransactions[currentUser.email] || [];

    const newTransaction = {
      type: "Expense",
      amount: amount.toString(),
      category: "Other",
      date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
    };

    const updatedTransactions = [...userTransactions, newTransaction];

    allTransactions[currentUser.email] = updatedTransactions;

    localStorage.setItem(
      "transactions",
      JSON.stringify(allTransactions)
    );

    alert("Expense added successfully");
    setAmount(null);
    navigate("/dashboard");
  };

  return (
    <div className="p-6 flex justify-center">

      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-96 space-y-4">

        <h2 className="text-xl font-bold text-center dark:text-white">
          Receipt Scanner
        </h2>

        <input
          type="file"
          accept="image/*"
          onChange={handleScan}
        />

        {preview && (
            <div className="flex justify-center">
                <img
                    src={preview}
                    alt="Receipt Preview"
                    className="max-h-60 rounded shadow"
                />
            </div>
        )}

        {loading && (
          <p className="text-sm text-gray-500">
            Scanning receipt...
          </p>
        )}

        {amount && (
          <>
            <div className="text-center">
              <p className="text-gray-500">Detected Amount</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{amount}
              </p>
            </div>

            <button
              onClick={handleAddExpense}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
            >
              Add to Expenses
            </button>
          </>
        )}

      </div>

    </div>
  );
};

export default ReceiptScannerPage;