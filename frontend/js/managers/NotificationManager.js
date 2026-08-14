class NotificationManager {
    constructor() {}
    
    initialize() {}
    
    destroy() {}

    showToast(message, type = 'error') {
        let container = document.getElementById('toast-container-wrapper');
        if (!container) {
            container = document.body;
        }

        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'fixed top-5 right-5 z-[99999] flex flex-col gap-3 pointer-events-none';
            container.appendChild(toastContainer);
        } else {
            toastContainer.style.zIndex = '99999';
        }

        const toast = document.createElement('div');
        toast.className = 'flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl text-white text-sm transform translate-y-2 opacity-0 transition-all duration-300 pointer-events-auto min-w-[300px] border backdrop-blur-md';
        
        if (type === 'success') {
            toast.classList.add('bg-emerald-600', 'border-emerald-400/40', 'shadow-emerald-900/30');
            toast.innerHTML = `<i class="ph-fill ph-check-circle text-2xl text-emerald-200 shrink-0"></i><span class="font-bold text-white tracking-wide text-xs md:text-sm">${message}</span>`;
        } else if (type === 'warning') {
            toast.classList.add('bg-amber-600', 'border-amber-400/40', 'shadow-amber-900/30');
            toast.innerHTML = `<i class="ph-fill ph-warning text-2xl text-amber-200 shrink-0"></i><span class="font-bold text-white tracking-wide text-xs md:text-sm">${message}</span>`;
        } else if (type === 'info') {
            toast.classList.add('bg-blue-600', 'border-blue-400/40', 'shadow-blue-900/30');
            toast.innerHTML = `<i class="ph-fill ph-info text-2xl text-blue-200 shrink-0"></i><span class="font-bold text-white tracking-wide text-xs md:text-sm">${message}</span>`;
        } else {
            toast.classList.add('bg-rose-600', 'border-rose-400/40', 'shadow-rose-900/30');
            toast.innerHTML = `<i class="ph-fill ph-x-circle text-2xl text-rose-200 shrink-0"></i><span class="font-bold text-white tracking-wide text-xs md:text-sm">${message}</span>`;
        }
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('translate-y-2', 'opacity-0');
        }, 10);
        
        setTimeout(() => {
            toast.classList.add('translate-y-2', 'opacity-0');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    }

    success(msg) { this.showToast(msg, 'success'); }
    error(msg) { this.showToast(msg, 'error'); }
    info(msg) { this.showToast(msg, 'info'); }
    warning(msg) { this.showToast(msg, 'warning'); }
}
export default new NotificationManager();
