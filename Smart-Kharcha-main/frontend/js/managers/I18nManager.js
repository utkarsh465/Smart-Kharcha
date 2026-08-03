class I18nManager {
    constructor() {
        this.initialized = false;
        this.defaultLanguage = 'en';
    }

    initialize() {
        if (this.initialized) return;

        // Ensure language is set in localStorage
        const activeLanguage = localStorage.getItem('language') || this.defaultLanguage;
        
        // Always enforce the googtrans cookie to match the active language so Google Translate picks it up
        document.cookie = `googtrans=/en/${activeLanguage}; path=/`;

        // Inject Google Translate Scripts
        this.injectGoogleTranslate();
        this.addStyles();
        
        this.initialized = true;
    }

    injectGoogleTranslate() {
        // Create the element where Google Translate will mount (hidden)
        const gtDiv = document.createElement('div');
        gtDiv.id = 'google_translate_element';
        gtDiv.style.display = 'none';
        document.body.appendChild(gtDiv);

        // Inject the callback function script
        const cbScript = document.createElement('script');
        cbScript.type = 'text/javascript';
        cbScript.innerHTML = `
            function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                    pageLanguage: 'en',
                    autoDisplay: false
                }, 'google_translate_element');
            }
        `;
        document.body.appendChild(cbScript);

        // Inject the main Google Translate API script
        const apiScript = document.createElement('script');
        apiScript.type = 'text/javascript';
        apiScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(apiScript);
    }

    addStyles() {
        // Hide the Google Translate top banner (which says "Translated to X" and provides a "Show original" button)
        // because it ruins the app's premium aesthetic.
        const style = document.createElement('style');
        style.innerHTML = `
            .goog-te-banner-frame.skiptranslate { display: none !important; }
            body { top: 0px !important; }
            .goog-tooltip { display: none !important; }
            .goog-tooltip:hover { display: none !important; }
            .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
        `;
        document.head.appendChild(style);
    }
}

export default new I18nManager();
