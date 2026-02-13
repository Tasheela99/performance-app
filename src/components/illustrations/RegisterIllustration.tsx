export default function RegisterIllustration() {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <circle cx="250" cy="250" r="180" fill="url(#regGradient)" opacity="0.1" />
      
      <g transform="translate(220, 150)">
        <ellipse cx="30" cy="100" rx="35" ry="15" fill="#EF4444" opacity="0.3" />
        <path d="M30 20 L50 100 L10 100 Z" fill="#EF4444" />
        <ellipse cx="30" cy="25" rx="12" ry="15" fill="#DC2626" />
        
        <circle cx="30" cy="50" r="12" fill="#93C5FD" opacity="0.8" />
        <circle cx="30" cy="50" r="8" fill="#DBEAFE" />
        
        <path d="M20 100 L15 120 L20 110 L25 125 L30 105 Z" fill="#FBBF24" />
        <path d="M30 105 L35 125 L40 110 L45 120 L40 100 Z" fill="#F59E0B" />
        
        <g className="animate-pulse">
          <path d="M-20 40 L-18 42 L-20 44 L-22 42 Z" fill="#FBBF24" />
          <path d="M80 60 L82 62 L80 64 L78 62 Z" fill="#F59E0B" />
          <path d="M70 20 L72 22 L70 24 L68 22 Z" fill="#FCD34D" />
        </g>
      </g>
      
      <g transform="translate(100, 320)">
        <circle cx="0" cy="0" r="25" fill="#8B5CF6" />
        <circle cx="0" cy="-5" r="10" fill="#C4B5FD" />
        <path d="M-15 10 Q0 5 15 10" fill="#C4B5FD" />
      </g>
      
      <g transform="translate(180, 340)">
        <circle cx="0" cy="0" r="25" fill="#10B981" />
        <circle cx="0" cy="-5" r="10" fill="#6EE7B7" />
        <path d="M-15 10 Q0 5 15 10" fill="#6EE7B7" />
      </g>
      
      <g transform="translate(260, 330)">
        <circle cx="0" cy="0" r="25" fill="#3B82F6" />
        <circle cx="0" cy="-5" r="10" fill="#93C5FD" />
        <path d="M-15 10 Q0 5 15 10" fill="#93C5FD" />
      </g>
      
      <g transform="translate(350, 280)">
        <circle cx="0" cy="0" r="35" fill="#10B981" opacity="0.2" />
        <circle cx="0" cy="0" r="25" fill="#10B981" />
        <path d="M-10 0 L-5 8 L12 -10" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      
      <g transform="translate(80, 180)">
        <rect x="0" y="0" width="50" height="65" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="2" />
        <line x1="8" y1="15" x2="42" y2="15" stroke="#3B82F6" strokeWidth="2" />
        <line x1="8" y1="25" x2="35" y2="25" stroke="#9CA3AF" strokeWidth="2" />
        <line x1="8" y1="35" x2="35" y2="35" stroke="#9CA3AF" strokeWidth="2" />
        <circle cx="40" cy="50" r="8" fill="#10B981" />
        <path d="M36 50 L39 53 L44 47" stroke="white" strokeWidth="2" fill="none" />
      </g>
      
      <circle cx="400" cy="150" r="5" fill="#A78BFA" opacity="0.5" />
      <circle cx="90" cy="80" r="4" fill="#34D399" opacity="0.5" />
      <circle cx="420" cy="350" r="6" fill="#60A5FA" opacity="0.5" />
      
      <defs>
        <linearGradient id="regGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
