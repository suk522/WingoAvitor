export function WingoLogo() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A148C" />
          <stop offset="100%" stopColor="#7B1FA2" />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <rect x="0" y="0" width="200" height="200" fill="url(#purpleGradient)" rx="15" ry="15" />
      
      {/* Ball 1 */}
      <circle cx="70" cy="70" r="30" fill="#6A1B9A" stroke="#9C27B0" strokeWidth="3" />
      <text x="70" y="80" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold">7</text>
      
      {/* Ball 2 */}
      <circle cx="130" cy="85" r="30" fill="#FFC107" stroke="#FFD54F" strokeWidth="3" />
      <text x="130" y="95" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold">8</text>
      
      {/* Crown */}
      <polygon points="100,35 120,55 80,55" fill="#FFC107" />
      <polygon points="80,55 120,55 130,70 70,70" fill="#FFC107" />
      <circle cx="90" cy="50" r="5" fill="#FF5722" />
      <circle cx="110" cy="50" r="5" fill="#FF5722" />
      
      {/* Text */}
      <text x="100" y="150" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold">WINGO</text>
    </svg>
  );
}
