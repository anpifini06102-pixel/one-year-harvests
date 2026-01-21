/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                wood: {
                    dark: '#8b4513',
                    DEFAULT: '#a0522d',
                    light: '#d2b48c',
                },
                shadow: {
                    pixel: '#3e2723',
                }
            },
            fontFamily: {
                pixel: ['"Press Start 2P"', 'Courier New', 'monospace'],
            },
            boxShadow: {
                'pixel': '4px 4px 0px 0px #3e2723',
                'pixel-sm': '2px 2px 0px 0px #3e2723',
                'pixel-lg': '6px 6px 0px 0px #3e2723',
            },
            borderWidth: {
                '3': '3px',
            }
        },
    },
    plugins: [],
}
