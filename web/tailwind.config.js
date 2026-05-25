/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07111f",
        mist: "#e7f0ff",
        aqua: "#72e6ff",
        coral: "#ff8a5b",
        lime: "#b7f171",
      },
      boxShadow: {
        panel: "0 24px 80px rgba(7, 17, 31, 0.24)",
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(114,230,255,0.24), transparent 34%), radial-gradient(circle at bottom right, rgba(255,138,91,0.18), transparent 28%)",
      },
    },
  },
  plugins: [],
};
