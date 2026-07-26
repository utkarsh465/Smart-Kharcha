tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'sans-serif'],
                heading: ['Outfit', 'sans-serif'],
            },
            colors: {
                slate: {
                    50: 'rgb(var(--slate-50) / <alpha-value>)',
                    100: 'rgb(var(--slate-100) / <alpha-value>)',
                    200: 'rgb(var(--slate-200) / <alpha-value>)',
                    300: 'rgb(var(--slate-300) / <alpha-value>)',
                    400: 'rgb(var(--slate-400) / <alpha-value>)',
                    500: 'rgb(var(--slate-500) / <alpha-value>)',
                    600: 'rgb(var(--slate-600) / <alpha-value>)',
                    700: 'rgb(var(--slate-700) / <alpha-value>)',
                    800: 'rgb(var(--slate-800) / <alpha-value>)',
                    900: 'rgb(var(--slate-900) / <alpha-value>)',
                },
                white: 'rgb(var(--white) / <alpha-value>)',
                black: 'rgb(var(--black) / <alpha-value>)',
                primary: 'rgb(var(--primary) / <alpha-value>)',
                primaryDark: 'rgb(var(--primary-dark) / <alpha-value>)',
                success: 'rgb(var(--success) / <alpha-value>)',
                secondary: 'rgb(var(--success) / <alpha-value>)',
                danger: 'rgb(var(--danger) / <alpha-value>)',
                warning: 'rgb(var(--warning) / <alpha-value>)',
                accent: 'rgb(var(--accent) / <alpha-value>)',
                bgSlate: 'rgb(var(--slate-50) / <alpha-value>)',
                dark: 'rgb(var(--slate-900) / <alpha-value>)',
                slateCard: 'rgb(var(--slate-card) / 0.7)',
                
                // Override light background tints for dark mode compatibility
                emerald: {
                    50: 'rgb(var(--emerald-50) / <alpha-value>)',
                    100: 'rgb(var(--emerald-100) / <alpha-value>)',
                },
                rose: {
                    50: 'rgb(var(--rose-50) / <alpha-value>)',
                    100: 'rgb(var(--rose-100) / <alpha-value>)',
                },
                amber: {
                    50: 'rgb(var(--amber-50) / <alpha-value>)',
                    100: 'rgb(var(--amber-100) / <alpha-value>)',
                },
                indigo: {
                    50: 'rgb(var(--indigo-50) / <alpha-value>)',
                    100: 'rgb(var(--indigo-100) / <alpha-value>)',
                },
                blue: {
                    50: 'rgb(var(--blue-50) / <alpha-value>)',
                    100: 'rgb(var(--blue-100) / <alpha-value>)',
                },
                purple: {
                    50: 'rgb(var(--purple-50) / <alpha-value>)',
                    100: 'rgb(var(--purple-100) / <alpha-value>)',
                }
            }
        }
    }
};
