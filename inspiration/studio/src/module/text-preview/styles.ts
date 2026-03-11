export const styles = {
  editor: {
    padding: "1em",
    width: "100%", //37em
    maxWidth: "100%",
    height: "11.25em", // 11.25em
    borderRadius: "0.375em 0.375em 0 0",
    border: ".0469em solid rgba(0, 0, 0, 0.20)",
    opacity: "0.95",
    background: "rgba(255, 255, 255, 0.70)",
    backdropFilter: "blur(10px)",
    fontSize: "1.15em",
  },
  buttonContainer: {
    display: "flex",
    borderRadius: "0 0 0.375em 0.375em",
    border: ".0469em solid rgba(0, 0, 0, 0.20)",
    borderTop: "0",
    width: "100%",
    justifyContent: "flex-end",
    padding: "0.375em",
    background: "rgba(255, 255, 255, 0.70)",
  },

  copiedText: {
    color: "#212121",
    animation: "fadeIn 0.2s ease-in",
  },
};

// Add CSS animation via style tag or convert to Tailwind classes
if (typeof document !== 'undefined' && !document.getElementById('text-preview-animations')) {
  const style = document.createElement('style');
  style.id = 'text-preview-animations';
  style.textContent = `
    @keyframes fadeIn {
      0% {
        opacity: 0;
        transform: translateY(0.75rem);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}
