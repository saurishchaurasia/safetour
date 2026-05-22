export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        safety: {
          green: "#16734b",
          blue: "#2563eb",
          amber: "#d97706",
          red: "#dc2626"
        }
      },
      boxShadow: {
        soft: "0 18px 42px rgba(21, 32, 28, 0.11)"
      }
    }
  },
  plugins: []
};
