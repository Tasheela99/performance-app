export default function ForgotPasswordIllustration() {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <circle cx="250" cy="250" r="200" fill="url(#forgotGradient)" opacity="0.08" />
      
      <g transform="translate(150, 180)">
        <ellipse cx="100" cy="180" rx="120" ry="20" fill="#000" opacity="0.1" />
        
        <rect x="20" y="80" width="160" height="100" rx="8" fill="#3B82F6" />
        <path d="M20 88 L100 140 L180 88" fill="#60A5FA" />
        <path d="M20 80 L100 130 L180 80" stroke="#1E40AF" strokeWidth="2" fill="none" />
        
        <path d="M20 80 L100 20 L180 80" fill="#2563EB" />
        <path d="M20 80 L100 20 L180 80" stroke="#1E40AF" strokeWidth="2" fill="none" />
        
        <g transform="translate(70, 45)">
          <circle cx="15" cy="15" r="15" fill="#FBBF24" />
          <circle cx="15" cy="15" r="8" fill="#FEF3C7" />
          <rect x="25" y="12" width="40" height="6" rx="3" fill="#FBBF24" />
          <rect x="60" y="8" width="4" height="6" fill="#FBBF24" />
          <rect x="60" y="16" width="4" height="6" fill="#FBBF24" />
          
          <circle cx="12" cy="12" r="3" fill="#FEF3C7" opacity="0.8" />
        </g>
      </g>
      
      <g className="animate-pulse">
        <text x="100" y="140" fontSize="40" fill="#8B5CF6" opacity="0.4" fontWeight="bold">?</text>
        <text x="380" y="200" fontSize="35" fill="#EC4899" opacity="0.4" fontWeight="bold">?</text>
        <text x="370" y="350" fontSize="30" fill="#10B981" opacity="0.4" fontWeight="bold">?</text>
      </g>
      
      <g transform="translate(350, 250)">
        <circle cx="0" cy="0" r="35" fill="#8B5CF6" opacity="0.2" />
        <path
          d="M-20 -10 Q-20 -25 -5 -25 Q0 -28 5 -25 Q20 -25 20 -10 Q25 -5 20 5 Q20 15 10 20 Q0 18 -10 20 Q-20 15 -20 5 Q-25 -5 -20 -10"
          fill="#8B5CF6"
        />
        <path d="M-10 -15 Q-5 -10 -10 -5" stroke="#A78BFA" strokeWidth="2" fill="none" />
        <path d="M0 -18 Q5 -15 0 -10" stroke="#A78BFA" strokeWidth="2" fill="none" />
        <path d="M10 -12 Q8 -5 12 0" stroke="#A78BFA" strokeWidth="2" fill="none" />
      </g>
      
      <g transform="translate(80, 280)">
        <circle cx="0" cy="0" r="20" fill="#10B981" />
        <rect x="-8" y="-5" width="16" height="10" rx="2" fill="white" />
        <path d="M-8 -5 L0 2 L8 -5" stroke="white" strokeWidth="1.5" fill="none" />
      </g>
      
      <g transform="translate(120, 350)">
        <rect x="5" y="15" width="30" height="25" rx="3" fill="#DC2626" opacity="0.7" />
        <path
          d="M12 15 Q12 5 20 5 Q28 5 28 15"
          stroke="#DC2626"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M32 5 L38 0"
          stroke="#10B981"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      
      <g>
        <path d="M420 120 L422 125 L427 127 L422 129 L420 134 L418 129 L413 127 L418 125 Z" fill="#FCD34D" />
        <path d="M90 200 L91 203 L94 204 L91 205 L90 208 L89 205 L86 204 L89 203 Z" fill="#A78BFA" />
        <path d="M400 380 L402 384 L406 386 L402 388 L400 392 L398 388 L394 386 L398 384 Z" fill="#34D399" />
      </g>
      
      <defs>
        <linearGradient id="forgotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
