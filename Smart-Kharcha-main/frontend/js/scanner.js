import { transactionAPI, getToken } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (!getToken()) {
        window.location.href = 'index.html';
        return;
    }

    // Handle Logout
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    });

    // Mobile Drawer Navigation Toggles
    // Mobile Navbar toggle
    const navToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('mobile-nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('hidden');
        });
    }

    // Currency preference updates
    const getCurrencySymbol = () => localStorage.getItem('currency') || '₹';
    const updateCurrencyDisplay = () => {
        const symbol = getCurrencySymbol();
        document.querySelectorAll('.currency-symbol').forEach(el => {
            el.textContent = symbol;
        });
    };

    // Toast Notifications System
    function showToast(message, type = 'error') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm transform translate-y-2 opacity-0 transition-all duration-300 pointer-events-auto min-w-[280px]';
        
        if (type === 'success') {
            toast.classList.add('bg-emerald-500', 'shadow-emerald-500/20');
            toast.innerHTML = `<i class="ph-fill ph-check-circle text-xl"></i><span class="font-medium">${message}</span>`;
        } else if (type === 'warning') {
            toast.classList.add('bg-amber-500', 'shadow-amber-500/20');
            toast.innerHTML = `<i class="ph-fill ph-warning text-xl"></i><span class="font-medium">${message}</span>`;
        } else {
            toast.classList.add('bg-rose-500', 'shadow-rose-500/20');
            toast.innerHTML = `<i class="ph-fill ph-x-circle text-xl"></i><span class="font-medium">${message}</span>`;
        }
        
        container.appendChild(toast);
        setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
        
        setTimeout(() => {
            toast.classList.add('translate-y-2', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Scanner UI references
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const scanOverlay = document.getElementById('scan-overlay');
    const scanStatusText = document.getElementById('scan-status-text');
    const extractionEmpty = document.getElementById('extraction-empty');
    const extractionForm = document.getElementById('extraction-form');
    
    // Result Form Fields
    const extDesc = document.getElementById('ext-desc');
    const extAmount = document.getElementById('ext-amount');
    const extCategory = document.getElementById('ext-category');
    const extDate = document.getElementById('ext-date');

    // Drag-and-drop Events
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropzone.classList.add('border-primary/80', 'bg-indigo-50/10');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropzone.classList.remove('border-primary/80', 'bg-indigo-50/10');
        }, false);
    });

    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleUploadedFile(files[0]);
        }
    });

    dropzone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            handleUploadedFile(fileInput.files[0]);
        }
    });

    // File handler triggers simulated scanning
    const handleUploadedFile = (file) => {
        if (!file.type.startsWith('image/')) {
            showToast('Please upload an image file (PNG, JPG, JPEG)');
            return;
        }
        
        // Mock randomized results for custom images
        const randMerchant = ['Domino\'s Pizza', 'Walmart Grocery', 'Decathlon Sports', 'Netflix Subscription', 'Croma Electronics'][Math.floor(Math.random() * 5)];
        const randAmount = Math.floor(Math.random() * 2000) + 120;
        const randCategories = {
            'Domino\'s Pizza': 'Food',
            'Walmart Grocery': 'Food',
            'Decathlon Sports': 'Shopping',
            'Netflix Subscription': 'Entertainment',
            'Croma Electronics': 'Bills'
        };
        const randCat = randCategories[randMerchant] || 'Other';

        triggerScanSimulation({
            title: randMerchant,
            amount: randAmount,
            category: randCat,
            date: new Date().toISOString().split('T')[0]
        });
    };

    // Click trigger on Demo Receipt templates
    document.querySelectorAll('.demo-receipt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering dropzone click
            const type = btn.getAttribute('data-type');
            const todayStr = new Date().toISOString().split('T')[0];
            
            let mockData = {};
            if (type === 'starbucks') {
                mockData = {
                    title: 'Starbucks Coffee',
                    amount: 340,
                    category: 'Food',
                    date: todayStr
                };
            } else if (type === 'zara') {
                mockData = {
                    title: 'Zara Fashion Mall',
                    amount: 4999,
                    category: 'Shopping',
                    date: todayStr
                };
            } else if (type === 'uber') {
                mockData = {
                    title: 'Uber Cab Ride',
                    amount: 780,
                    category: 'Transport',
                    date: todayStr
                };
            }
            
            triggerScanSimulation(mockData);
        });
    });

    // Simulated scan engine pipeline
    const triggerScanSimulation = (data) => {
        scanOverlay.classList.remove('hidden');
        
        // Phase 1: Upload
        scanStatusText.textContent = 'Uploading document image...';
        
        // Phase 2: Coordinates alignment
        setTimeout(() => {
            scanStatusText.textContent = 'Aligning text coordinates...';
        }, 600);

        // Phase 3: OCR translation
        setTimeout(() => {
            scanStatusText.textContent = 'Translating characters (OCR)...';
        }, 1200);

        // Phase 4: Extraction mapping
        setTimeout(() => {
            scanStatusText.textContent = 'Mapping fields & extracting values...';
        }, 1800);

        // Final Phase: Complete
        setTimeout(() => {
            scanOverlay.classList.add('hidden');
            
            // Populates Form fields
            extDesc.value = data.title;
            extAmount.value = data.amount;
            extCategory.value = data.category;
            extDate.value = data.date;

            // Display adjustments
            extractionEmpty.classList.add('hidden');
            extractionForm.classList.remove('hidden');
            
            showToast('Receipt parsed successfully!', 'success');
        }, 2400);
    };

    // Save Extracted Results Form
    extractionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = extDesc.value;
        const amount = extAmount.value;
        const category = extCategory.value;
        const date = extDate.value;

        const saveBtn = extractionForm.querySelector('button[type="submit"]');
        const origText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        try {
            await transactionAPI.add({
                title,
                amount: Number(amount),
                category,
                date,
                type: 'expense' // Scanner records are always expenses
            });

            showToast('Transaction logged successfully!', 'success');
            
            // Reset extraction layout
            extractionForm.reset();
            extractionForm.classList.add('hidden');
            extractionEmpty.classList.remove('hidden');
        } catch (error) {
            showToast('Failed to save transaction');
        } finally {
            saveBtn.textContent = origText;
            saveBtn.disabled = false;
        }
    });

    // Init display
    updateCurrencyDisplay();
});
