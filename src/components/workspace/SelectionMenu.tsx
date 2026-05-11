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
      className="flex items-center gap-px border border-line bg-paper shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
    >
      <button
        onClick={onComment}
        className="px-3 py-1.5 text-[12px] font-medium text-ink-2 transition-colors hover:bg-veil hover:text-ink"
      >
        Comment
      </button>
      <span className="h-4 w-px bg-line" />
      <button
        onClick={onRewrite}
        className="px-3 py-1.5 text-[12px] font-medium text-accent transition-colors hover:bg-accent-tint"
      >
        Ask Marabel to rewrite
      </button>
    </div>
  );
}
