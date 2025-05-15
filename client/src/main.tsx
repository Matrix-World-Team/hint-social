import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global styles for glassmorphism and animations
const style = document.createElement('style');
style.textContent = `
  .bg-glass {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  .bg-glass-dark {
    background: rgba(17, 24, 39, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .shadow-glass {
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  }
  
  .btn-gradient {
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    transition: all 0.3s ease;
  }
  
  .btn-gradient:hover {
    background: linear-gradient(90deg, #4f46e5, #7c3aed);
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -10px rgba(79, 70, 229, 0.5);
  }
  
  .gradient-text {
    background: linear-gradient(90deg, #6366f1, #ec4899);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
