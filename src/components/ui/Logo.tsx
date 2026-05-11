import Link from "next/link";

export function Logo({ className = "", size = "default" }: { className?: string; size?: "small" | "default" | "large" }) {
  const sizes = {
    small: { icon: 24, text: "text-base" },
    default: { icon: 32, text: "text-xl" },
    large: { icon: 48, text: "text-3xl" },
  };
  const s = sizes[size];

  return (
    <Link href="/overview" className={`flex items-center gap-2.5 ${className}`}>
      <svg width={s.icon} height={s.icon} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill="#1B2A4A" />
        <path
          d="M14 16C14 14.8954 14.8954 14 16 14H28C31.3137 14 34 16.6863 34 20V20C34 23.3137 31.3137 26 28 26H14V16Z"
          fill="white"
        />
        <circle cx="30" cy="14" r="4" fill="#1B2A4A" stroke="white" strokeWidth="2" />
        <rect x="14" y="28" width="20" height="6" rx="3" fill="white" opacity="0.6" />
      </svg>
      <span className={`${s.text} font-medium tracking-tight text-navy`}>marabel</span>
    </Link>
  );
}
