/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0f172a',
                accent: '#10b981',
                'bg-dark': '#020617',
                'text-main': '#f8fafc',
                'text-muted': '#94a3b8',
                'glass-border': 'rgba(255, 255, 255, 0.1)',
                'success': '#2E7D32',
                'warning': '#ED6C02',
                'error': '#D32F2F',
                'info': '#0288D1',
            },
            backgroundImage: {
                'brand-gradient': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
