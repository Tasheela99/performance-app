export default function ResetPasswordIllustration() {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <circle cx="250" cy="250" r="180" fill="url(#resetGradient)" opacity="0.1" />
      
      <g transform="translate(200, 150)">
        <path
          d="M50 10 L90 10 L100 20 L100 80 L50 120 L0 80 L0 20 Z"
          fill="url(#shieldGradient)"
        />
        <path
          d="M50 20 L85 20 L92 26 L92 75 L50 110 L8 75 L8 26 Z"
          fill="#1E40AF"
        />
        
        <g transform="translate(50, 55)">
          <path
            d="M-15 -10 A20 20 0 0 1 15 -10"
            stroke="#10B981"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M15 -10 L20 -15 L20 -5 Z" fill="#10B981" />
          
          <path
            d="M15 10 A20 20 0 0 1 -15 10"
            stroke="#F59E0B"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M-15 10 L-20 5 L-20 15 Z" fill="#F59E0B" />
        </g>
        
        <path
          d="M20 30 Q25 50 20 70"
          stroke="white"
          strokeWidth="3"
          opacity="0.3"
          strokeLinecap="round"
        />
      </g>
      
      <g transform="translate(100, 350)">
        <rect x="0" y="0" width="60" height="10" rx="5" fill="#DC2626" opacity="0.3" />
        <rect x="70" y="0" width="60" height="10" rx="5" fill="#F59E0B" opacity="0.5" />
        <rect x="140" y="0" width="60" height="10" rx="5" fill="#10B981" />
        
        <text x="30" y="-8" fontSize="10" fill="#6B7280" textAnchor="middle">Weak</text>
        <text x="100" y="-8" fontSize="10" fill="#6B7280" textAnchor="middle">Medium</text>
        <text x="170" y="-8" fontSize="10" fill="#6B7280" textAnchor="middle">Strong</text>
      </g>
      
      <g transform="translate(330, 240)">
        <g opacity="0.3">
          <circle cx="0" cy="0" r="12" fill="#EF4444" />
          <rect x="10" y="-3" width="30" height="6" fill="#EF4444" />
          <line x1="15" y1="-5" x2="20" y2="5" stroke="#EF4444" strokeWidth="3" />
        </g>
        
        <g transform="translate(40, -10)">
          <circle cx="0" cy="0" r="14" fill="#10B981" />
          <circle cx="0" cy="0" r="8" fill="#34D399" />
          <rect x="12" y="-4" width="35" height="8" rx="4" fill="#10B981" />
          <rect x="42" y="-8" width="4" height="7" fill="#10B981" />
          <rect x="42" y="1" width="4" height="7" fill="#10B981" />
          
          <circle cx="-5" cy="-5" r="2" fill="#6EE7B7" />
        </g>
        
        <path d="M20 5 L30 5" stroke="#8B5CF6" strokeWidth="2" markerEnd="url(#arrowhead)" />
      </g>
      
      <g transform="translate(100, 200)">
        <rect x="5" y="20" width="25" height="30" rx="3" fill="#EF4444" opacity="0.4" />
        <path d="M10 20 Q10 8 20 8 Q30 8 30 20" stroke="#EF4444" strokeWidth="3" fill="none" opacity="0.4" />
        <line x1="32" y1="8" x2="40" y2="2" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
        
        <path d="M50 30 L70 30" stroke="#8B5CF6" strokeWidth="2" />
        <path d="M65 25 L70 30 L65 35" stroke="#8B5CF6" strokeWidth="2" fill="none" />
        
        <g transform="translate(80, 0)">
          <rect x="5" y="20" width="25" height="30" rx="3" fill="#10B981" />
          <path d="M10 20 Q10 8 20 8 Q30 8 30 20" stroke="#10B981" strokeWidth="3" fill="none" />
          <circle cx="17.5" cy="32" r="3" fill="white" />
          <rect x="16" y="32" width="3" height="8" fill="white" />
        </g>
      </g>
      
      <g transform="translate(380, 340)">
        <circle cx="0" cy="0" r="30" fill="#10B981" opacity="0.2" />
        <circle cx="0" cy="0" r="22" fill="#10B981" />
        <path d="M-8 0 L-3 6 L10 -8" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      
      <circle cx="420" cy="180" r="4" fill="#A78BFA" opacity="0.6" />
      <circle cx="80" cy="120" r="5" fill="#34D399" opacity="0.6" />
      <circle cx="400" cy="400" r="4" fill="#60A5FA" opacity="0.6" />
      
      <defs>
        <linearGradient id="resetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#8B5CF6" />
        </marker>
      </defs>
    </svg>
  );
}
