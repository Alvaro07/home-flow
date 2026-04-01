interface LogoMarkProps {
  size?: number
  className?: string
}

export const LogoMark = ({ size = 32, className }: LogoMarkProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="HomeFlow"
    role="img"
  >
    <defs>
      <linearGradient id="lm-grad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6c63ff" />
        <stop offset="100%" stopColor="#48cfad" />
      </linearGradient>
      <linearGradient id="lm-door" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#5248d4" />
        <stop offset="100%" stopColor="#35a889" />
      </linearGradient>
    </defs>

    {/* Background */}
    <rect width="200" height="200" rx="44" fill="url(#lm-grad)" />

    {/* House: curved roof + body */}
    <path d="M 38 96 Q 60 36 100 26 Q 140 36 162 96 V 152 H 38 Z" fill="white" />

    {/* Door */}
    <path d="M 88 152 V 128 A 12 12 0 0 1 112 128 V 152 Z" fill="url(#lm-door)" opacity={0.5} />

    {/* Windows */}
    <rect x="48" y="106" width="28" height="22" rx="6" fill="url(#lm-door)" opacity={0.4} />
    <rect x="124" y="106" width="28" height="22" rx="6" fill="url(#lm-door)" opacity={0.4} />

    {/* Flow wave */}
    <path
      d="M 38 168 Q 69 154 100 168 Q 131 182 162 168"
      stroke="white"
      strokeWidth="6"
      strokeLinecap="round"
      opacity={0.8}
    />
  </svg>
)
