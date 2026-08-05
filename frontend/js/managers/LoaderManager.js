class LoaderManager {
    constructor() {
        this.loaderEl = null;
    }
    
    initialize() {
        this.createLoader();
    }
    
    createLoader() {
        if (!document.getElementById('global-loader')) {
            const loaderHtml = `
                <div id="global-loader" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300">
                    <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center">
                        <i class="ph ph-spinner-gap animate-spin text-4xl text-primary mb-3"></i>
                        <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Loading...</p>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', loaderHtml);
        }
        this.loaderEl = document.getElementById('global-loader');
    }

    show() {
        if (this.loaderEl) {
            this.loaderEl.classList.remove('opacity-0', 'pointer-events-none');
        }
    }

    hide() {
        if (this.loaderEl) {
            this.loaderEl.classList.add('opacity-0', 'pointer-events-none');
        }
    }

    destroy() {}
}
export default new LoaderManager();
