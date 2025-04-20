export function SlotsLogo() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFC107" />
          <stop offset="100%" stopColor="#FFD54F" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Background coin */}
      <circle cx="100" cy="100" r="85" fill="url(#goldGradient)" stroke="#FFA000" strokeWidth="5" filter="url(#glow)" />
      
      {/* Inner circle */}
      <circle cx="100" cy="100" r="65" fill="#FFC107" stroke="#FFA000" strokeWidth="2" />
      
      {/* 777 text */}
      <text x="100" y="115" textAnchor="middle" fill="#B71C1C" fontSize="48" fontWeight="bold" filter="url(#glow)">777</text>
      
      {/* Small decorative elements */}
      <circle cx="50" cy="70" r="8" fill="#FFD54F" />
      <circle cx="150" cy="70" r="8" fill="#FFD54F" />
      <circle cx="50" cy="130" r="8" fill="#FFD54F" />
      <circle cx="150" cy="130" r="8" fill="#FFD54F" />
    </svg>
  );
}
