"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

interface EditableTextProps {
  value: string;
  onChange: (next: string) => void;
  className?: string;
  style?: CSSProperties;
  multiline?: boolean;
  placeholder?: string;
  ariaLabel?: string;
}

export function EditableText({
  value,
  onChange,
  className = "",
  style,
  multiline,
  placeholder,
  ariaLabel,
}: EditableTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);

  // Seed contentEditable with the current value when editing starts, and place caret at end.
  useEffect(() => {
    if (editing && ref.current) {
      ref.current.innerText = value;
      ref.current.focus();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editing, value]);

  function commit() {
    if (!editing) return;
    const next = (ref.current?.innerText ?? "").trim();
    if (next !== value) onChange(next);
    setEditing(false);
  }

  function cancel() {
    setEditing(false);
  }

  const showPlaceholder = !value && !editing;

  return (
    <div
      ref={ref}
      role="textbox"
      aria-label={ariaLabel}
      contentEditable={editing}
      suppressContentEditableWarning
      onClick={() => !editing && setEditing(true)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          cancel();
        }
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          commit();
        }
      }}
      className={`relative -mx-1 cursor-text rounded-sm px-1 transition-colors hover:bg-accent-tint focus:bg-accent-tint focus:outline-none ${
        editing ? "ring-1 ring-accent" : ""
      } ${className}`}
      style={style}
    >
      {editing ? null : showPlaceholder ? (
        <span className="text-ink-3">{placeholder}</span>
      ) : (
        value
      )}
    </div>
  );
}
