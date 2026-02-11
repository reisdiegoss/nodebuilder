/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#09090b', // Zinc-950
                foreground: '#fafafa', // Zinc-50
                accent: {
                    DEFAULT: '#2563eb', // Blue-600
                    foreground: '#ffffff',
                }
            }
        },
    },
    plugins: [],
}
