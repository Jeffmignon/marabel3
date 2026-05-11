"use client";

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  size?: "sm" | "md";
}

const sizes = {
  sm: { track: "w-7 h-[16px]", thumb: "w-[12px] h-[12px] top-[2px] left-[2px]", translate: "translate-x-[11px]" },
  md: { track: "w-9 h-5", thumb: "w-4 h-4 top-0.5 left-0.5", translate: "translate-x-4" },
};

export function Toggle({ checked, onChange, label, size = "md" }: ToggleProps) {
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2">
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={`relative ${s.track} rounded-full transition-colors ${checked ? "bg-navy" : "bg-gray-200"}`}
      >
        <div className={`absolute ${s.thumb} bg-white rounded-full shadow transition-transform ${checked ? s.translate : "translate-x-0"}`} />
      </button>
      {label && <span className="text-xs text-gray-600">{label}</span>}
    </div>
  );
}
