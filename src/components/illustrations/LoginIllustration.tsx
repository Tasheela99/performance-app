export default function LoginIllustration() {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <circle cx="250" cy="250" r="200" fill="url(#gradient1)" opacity="0.1" />
      <circle cx="250" cy="250" r="150" fill="url(#gradient2)" opacity="0.15" />
      
      <ellipse cx="250" cy="420" rx="100" ry="15" fill="#E5E7EB" opacity="0.5" />
      
      <rect x="180" y="320" width="140" height="90" rx="4" fill="#1E40AF" />
      <rect x="185" y="325" width="130" height="70" fill="#3B82F6" />
      <rect x="170" y="410" width="160" height="8" rx="4" fill="#1E3A8A" />
      
      <rect x="190" y="330" width="120" height="60" fill="url(#screenGlow)" opacity="0.8" />
      
      <g transform="translate(230, 150)">
        <rect x="10" y="25" width="40" height="45" rx="5" fill="#10B981" />
        <path
          d="M20 25 C20 15, 40 15, 40 25"
          stroke="#10B981"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="30" cy="45" r="5" fill="white" />
        <rect x="28" y="45" width="4" height="10" fill="white" />
      </g>
      
      <g transform="translate(340, 180)">
        <path
          d="M0 0 L20 0 L20 30 L10 40 L0 30 Z"
          fill="#8B5CF6"
          opacity="0.6"
        />
        <path d="M5 10 L9 14 L15 8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      
      <g transform="translate(140, 200)">
        <circle cx="10" cy="10" r="10" fill="#F59E0B" opacity="0.6" />
        <rect x="15" y="8" width="25" height="4" fill="#F59E0B" opacity="0.6" />
        <rect x="35" y="5" width="3" height="10" fill="#F59E0B" opacity="0.6" />
      </g>
      
      <circle cx="100" cy="100" r="3" fill="#60A5FA" opacity="0.4" />
      <circle cx="400" cy="120" r="4" fill="#34D399" opacity="0.4" />
      <circle cx="380" cy="300" r="3" fill="#A78BFA" opacity="0.4" />
      <circle cx="120" cy="350" r="4" fill="#FBBF24" opacity="0.4" />
      
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="screenGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
