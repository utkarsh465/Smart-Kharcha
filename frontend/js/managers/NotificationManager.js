class NotificationManager {
    constructor() {}
    
    initialize() {}
    
    destroy() {}

    showToast(message, type = 'error') {
        const container = document.getElementById('toast-container-wrapper');
        if (!container) return;

        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'fixed top-4 right-4 z-[60] flex flex-col gap-3 pointer-events-none';
            container.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = 'flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm transform translate-y-2 opacity-0 transition-all duration-300 pointer-events-auto min-w-[280px]';
        
        if (type === 'success') {
            toast.classList.add('bg-emerald-500', 'shadow-emerald-500/20');
            toast.innerHTML = `<i class="ph-fill ph-check-circle text-xl"></i><span class="font-medium">${message}</span>`;
        } else if (type === 'warning') {
            toast.classList.add('bg-amber-500', 'shadow-amber-500/20');
            toast.innerHTML = `<i class="ph-fill ph-warning text-xl"></i><span class="font-medium">${message}</span>`;
        } else if (type === 'info') {
            toast.classList.add('bg-blue-500', 'shadow-blue-500/20');
            toast.innerHTML = `<i class="ph-fill ph-info text-xl"></i><span class="font-medium">${message}</span>`;
        } else {
            toast.classList.add('bg-rose-500', 'shadow-rose-500/20');
            toast.innerHTML = `<i class="ph-fill ph-x-circle text-xl"></i><span class="font-medium">${message}</span>`;
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
