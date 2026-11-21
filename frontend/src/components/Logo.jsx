export default function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-label="Patrimoine Togo">
      <defs>
        <clipPath id="rond">
          <circle cx="28" cy="28" r="26" />
        </clipPath>
      </defs>
      <g clipPath="url(#rond)">
        <rect y="0" width="56" height="11.2" fill="#006A4E" />
        <rect y="11.2" width="56" height="11.2" fill="#FFCE00" />
        <rect y="22.4" width="56" height="11.2" fill="#006A4E" />
        <rect y="33.6" width="56" height="11.2" fill="#FFCE00" />
        <rect y="44.8" width="56" height="11.2" fill="#006A4E" />
        <rect x="0" y="0" width="33.6" height="33.6" fill="#D21034" />
        <polygon points="16.8,7.8 18.9,13.9 25.4,14 20.2,17.9 22.1,24.1 16.8,20.4 11.5,24.1 13.4,17.9 8.2,14 14.7,13.9" fill="#ffffff" />
      </g>
      <circle cx="28" cy="28" r="26" fill="none" stroke="#ffffff" strokeWidth="2.5" />
    </svg>
  )
}