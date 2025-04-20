export function AviatorLogo() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B71C1C" />
          <stop offset="100%" stopColor="#E53935" />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <rect x="0" y="0" width="200" height="200" fill="url(#redGradient)" rx="20" ry="20" />
      
      {/* Airplane */}
      <path 
        d="M140,80 L110,110 L40,90 L110,110 L90,140 L110,110 L150,130 Z" 
        fill="white" 
        stroke="white" 
        strokeWidth="2" 
      />
      
      {/* Trail */}
      <path 
        d="M110,110 C100,120 90,130 50,140" 
        fill="none" 
        stroke="rgba(255,255,255,0.6)" 
        strokeWidth="3" 
        strokeDasharray="5,5" 
        strokeLinecap="round" 
      />
      
      {/* Text */}
      <text x="100" y="170" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">Aviator</text>
    </svg>
  );
}
