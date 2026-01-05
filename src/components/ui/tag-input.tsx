import React, { useCallback, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * TagInput: free-form tags separated by comma, Enter or Tab.
 * - Keeps multi-word terms (spaces allowed inside a tag)
 * - Adds tags on ',', Enter or Tab
 * - Removes last tag on Backspace when input empty
 * - Allows removing any tag via the small X
 * - Splits pasted content by comma
 */
export default function TagInput({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const addTag = useCallback(
    (raw: string) => {
      const tag = raw.trim();
      if (!tag) return;
      onChange([...value, tag]);
      setInputValue("");
    },
    [onChange, value]
  );

  const removeTag = useCallback(
    (idx: number) => {
      const next = value.filter((_, i) => i !== idx);
      onChange(next);
      // keep focus on input
      inputRef.current?.focus();
    },
    [onChange, value]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      const key = e.key;
      if (key === "Enter" || key === "Tab" || key === ",") {
        e.preventDefault();
        addTag(inputValue);
        return;
      }
      if (key === "Backspace" && inputValue === "" && value.length > 0) {
        // remove last tag
        e.preventDefault();
        removeTag(value.length - 1);
        return;
      }
    },
    [addTag, disabled, inputValue, removeTag, value]
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const text = e.clipboardData.getData("text");
      if (!text.includes(",")) return;
      e.preventDefault();
      const parts = text
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length) onChange([...value, ...parts]);
      setInputValue("");
    },
    [onChange, value]
  );

  return (
    <div
      className={cn(
        "flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-white dark:bg-slate-950 px-2 py-1 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className
      )}
    >
      {value.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-foreground"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remover ${tag}`}
            className="ml-1 rounded hover:bg-secondary/70 focus:outline-none"
            onClick={() => removeTag(idx)}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 min-w-[6rem] bg-transparent outline-none placeholder:text-muted-foreground text-sm py-1"
      />
    </div>
  );
}
