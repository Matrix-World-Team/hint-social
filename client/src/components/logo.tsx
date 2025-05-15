import React from "react";

interface LogoProps {
  color?: "white" | "gradient";
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ color = "gradient", className = "h-8 w-auto" }) => {
  return (
    <svg className={className} viewBox="0 0 150 50" xmlns="http://www.w3.org/2000/svg">
      {color === "gradient" && (
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      )}

      {/* Connected nodes shape */}
      <path 
        d="M25,20 C25,15 30,15 30,20 L30,30 C30,35 35,35 35,30 L35,20 C35,15 40,15 40,20" 
        stroke={color === "gradient" ? "url(#logo-gradient)" : "white"} 
        strokeWidth="3" 
        fill="none" 
      />
      
      {/* Frame or message icon */}
      <rect 
        x="45" 
        y="15" 
        width="20" 
        height="20" 
        rx="5" 
        stroke={color === "gradient" ? "url(#logo-gradient)" : "white"} 
        strokeWidth="3" 
        fill="none" 
      />
      
      {/* Text "HINT" */}
      <text 
        x="70" 
        y="30" 
        fontFamily="Poppins, sans-serif" 
        fontWeight="700" 
        fontSize="24" 
        fill={color === "gradient" ? "url(#logo-gradient)" : "white"}
      >
        HINT
      </text>
    </svg>
  );
};

export default Logo;
