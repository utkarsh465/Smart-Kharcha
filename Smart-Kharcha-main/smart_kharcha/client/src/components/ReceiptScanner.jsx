import { useState } from "react";
import Tesseract from "tesseract.js";

const ReceiptScanner = ({ setAmount }) => {
  const [loading, setLoading] = useState(false);

  const handleScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const { data } = await Tesseract.recognize(file, "eng");
      const text = data.text;
      const detectedAmount = extractAmount(text);
      
      if (detectedAmount) {
        setAmount(detectedAmount);
      }
    } catch (error) {
      console.error("OCR Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractAmount = (text) => {
    const lines = text.split("\n");
    let potentialAmounts = [];

    // Keywords to search for
    const targetKeywords = ["total", "net", "amount", "grand", "payable", "paid", "₹", "rs", "inr"];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      const hasKeyword = targetKeywords.some(kw => lowerLine.includes(kw));

      if (hasKeyword) {
        // Extract numbers from this interesting line
        const matches = line.match(/(\d+[\d.,]*)/g) || [];
        for (const match of matches) {
          const cleanNum = match.replace(/,/g, '');
          const num = parseFloat(cleanNum);
          if (!isNaN(num) && num > 0 && num < 100000) {
            potentialAmounts.push({
              value: num,
              priority: lowerLine.includes("total") || lowerLine.includes("grand") ? 3 : 2
            });
          }
        }
      }
    }

    // Fallback 1: Decimal numbers
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

    // Fallback 2: Any reasonable numbers
    if (potentialAmounts.length === 0) {
      const allNumbers = text.match(/(\d+(\.\d{1,2})?)/g) || [];
      for (const match of allNumbers) {
        const num = parseFloat(match);
        if (!isNaN(num) && num > 10 && num < 100000 && num !== 2024 && num !== 2025 && num !== 2026) {
          potentialAmounts.push({ value: num, priority: 0 });
        }
      }
    }

    if (potentialAmounts.length > 0) {
      potentialAmounts.sort((a, b) => b.priority - a.priority || b.value - a.value);
      return potentialAmounts[0].value;
    }

    return null;
  };

  return (
    <div className="mt-4">

      <label className="block mb-2 font-medium">
        Scan Receipt
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={handleScan}
      />

      {loading && (
        <p className="text-sm mt-2">
          Scanning receipt...
        </p>
      )}

    </div>
  );
};

export default ReceiptScanner;