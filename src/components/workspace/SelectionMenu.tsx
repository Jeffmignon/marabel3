"use client";

interface SelectionMenuProps {
  rect: DOMRect;
  onComment: () => void;
  onRewrite: () => void;
}

export function SelectionMenu({ rect, onComment, onRewrite }: SelectionMenuProps) {
  const top = Math.max(8, rect.top - 44);
  const left = rect.left + rect.width / 2;

  return (
    <div
      // Stop the mousedown from clearing the underlying selection.
      onMouseDown={(e) => e.preventDefault()}
      style={{
        position: "fixed",
        top,
        left,
        transform: "translateX(-50%)",
        zIndex: 60,
      }}
      className="flex items-center gap-px overflow-hidden rounded-sm bg-ink text-paper shadow-[0_8px_24px_rgba(0,0,0,0.28)] ring-1 ring-black/10"
    >
      <button
        onClick={onComment}
        className="px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-white/10"
      >
        💬 Comment
      </button>
      <span className="h-4 w-px bg-white/20" />
      <button
        onClick={onRewrite}
        className="px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-white/10"
      >
        ✨ Ask Marabel to rewrite
      </button>
    </div>
  );
}
