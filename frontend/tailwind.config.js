/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    bg: '#0F172A',      // Slate 900
                    card: '#1E293B',    // Slate 800
                    input: '#334155',   // Slate 700
                },
                brand: {
                    primary: '#6366F1',   // Indigo
                    secondary: '#8B5CF6', // Violet
                    accent: '#06B6D4',    // Cyan
                }
            },
            animation: {
                'blob': 'blob 7s infinite',
            },
            keyframes: {
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                }
            }
        },
    },
    plugins: [],
}
