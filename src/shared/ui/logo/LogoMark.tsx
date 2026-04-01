interface LogoMarkProps {
  size?: number
  className?: string
}

export const LogoMark = ({ size = 32, className }: LogoMarkProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="HomeFlow"
    role="img"
  >
    <defs>
      <linearGradient id="lm-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6c63ff" />
        <stop offset="100%" stopColor="#48cfad" />
      </linearGradient>
    </defs>

    {/* Background */}
    <rect width="40" height="40" rx="10" fill="url(#lm-grad)" />

    {/* House outline — centred with padding */}
    <path
      d="M20 8 L7 17 L7 32 L33 32 L33 17 Z"
      stroke="#fff"
      strokeWidth="2"
      strokeLinejoin="round"
    />

    {/* Flow wave */}
    <path
      d="M11 24 Q14.5 20.5 18 24 Q21.5 27.5 25 24 Q28.5 20.5 29 24"
      stroke="#fff"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
)
