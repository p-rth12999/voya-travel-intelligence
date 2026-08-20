type Props = {
  className?: string
}

export default function CompassSpinner({ className = 'h-4 w-4' }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <line x1="12" y1="1.5" x2="12" y2="3.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      <line x1="12" y1="20.5" x2="12" y2="22.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      <line x1="1.5" y1="12" x2="3.5" y2="12" stroke="currentColor" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      <line x1="20.5" y1="12" x2="22.5" y2="12" stroke="currentColor" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      <g style={{ transformOrigin: '12px 12px', transformBox: 'view-box' }} className="animate-spin">
        <path d="M12 4.5 L14 12 L10 12 Z" fill="#2563eb" />
        <path d="M12 19.5 L14 12 L10 12 Z" fill="currentColor" opacity="0.35" />
      </g>
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
    </svg>
  )
}