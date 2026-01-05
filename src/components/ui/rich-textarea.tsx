import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import clsx from "clsx";

export type RichTextareaHandle = {
  focus: () => void;
  getCaretClientRect: () => DOMRect | null;
  getContainerRect: () => DOMRect | null;
  getCaretIndex: () => number;
  insertVariable: (label: string) => void;
};

type Props = {
  value: string; // stores tokens in bracket form: [Label]
  onChange: (next: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

// Regex to capture [ ... ] tokens (no nesting, no newline)
const TOKEN_RE = /\[([^\[\]\n]+)\]/g;

function makeTokenSpan(label: string): HTMLSpanElement {
  const span = document.createElement("span");
  span.contentEditable = "false";
  span.draggable = true;
  span.dataset.token = label;
  span.className =
    "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs bg-accent/40 text-foreground border-accent cursor-grab select-none align-baseline";
  span.textContent = label;
  span.setAttribute("role", "button");
  return span;
}

function serialize(container: HTMLElement): string {
  const parts: string[] = [];
  container.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parts.push((node as Text).data);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.dataset.token) {
        parts.push(`[${el.dataset.token}]`);
      } else {
        // flatten unknown elements
        parts.push(el.textContent || "");
      }
    }
  });
  return parts.join("");
}

function buildDOMFromValue(container: HTMLElement, value: string) {
  container.innerHTML = "";
  if (!value) return;
  let lastIndex = 0;
  for (const match of value.matchAll(TOKEN_RE)) {
    const m = match as RegExpMatchArray;
    const full = m[0];
    const label = m[1];
    const idx = m.index ?? 0;
    if (idx > lastIndex) {
      container.appendChild(
        document.createTextNode(value.slice(lastIndex, idx))
      );
    }
    container.appendChild(makeTokenSpan(label));
    lastIndex = idx + full.length;
  }
  if (lastIndex < value.length) {
    container.appendChild(document.createTextNode(value.slice(lastIndex)));
  }
}

function placeCaretAfter(node: Node) {
  const sel = window.getSelection();
  if (!sel) return;
  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

export const RichTextarea = forwardRef<RichTextareaHandle, Props>(
  (
    {
      value,
      onChange,
      onKeyDown,
      onFocus,
      onBlur,
      placeholder,
      disabled,
      className,
    },
    ref
  ) => {
    const divRef = useRef<HTMLDivElement | null>(null);
    const lastValue = useRef<string>("");

    // Build DOM from value when external changes occur
    useEffect(() => {
      if (!divRef.current) return;
      if (value === lastValue.current) return;
      buildDOMFromValue(divRef.current, value);
      lastValue.current = value;
    }, [value]);

    // Compute caret index relative to serialized text value
    const computeCaretIndex = (): number => {
      const el = divRef.current;
      if (!el) return 0;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return serialize(el).length;
      const range = sel.getRangeAt(0);
      let index = 0;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_ALL, null);
      let node: Node | null = walker.currentNode;
      // Ensure walker starts before children
      walker.currentNode = el;
      while ((node = walker.nextNode())) {
        if (node === range.startContainer) {
          if (node.nodeType === Node.TEXT_NODE) {
            index += range.startOffset;
          } else if ((node as HTMLElement).dataset?.token) {
            // If caret is at start (offset 0) inside a token, count nothing
            // but generally caret won't be inside contenteditable=false
          }
          break;
        }
        if (node.nodeType === Node.TEXT_NODE) {
          index += (node as Text).data.length;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const elNode = node as HTMLElement;
          if (elNode.dataset.token) {
            index += `[${elNode.dataset.token}]`.length;
          }
        }
      }
      return index;
    };

    useImperativeHandle(
      ref,
      () => ({
        focus: () => divRef.current?.focus(),
        getCaretClientRect: () => {
          const sel = window.getSelection();
          if (!sel || sel.rangeCount === 0) return null;
          const range = sel.getRangeAt(0).cloneRange();
          if (!range) return null;
          // Insert a marker to get a reliable rect when at boundaries
          try {
            range.collapse(true);
            const rects = range.getClientRects();
            if (rects && rects.length > 0) return rects[0];
          } catch {}
          return divRef.current?.getBoundingClientRect() || null;
        },
        getContainerRect: () => divRef.current?.getBoundingClientRect() || null,
        getCaretIndex: computeCaretIndex,
        insertVariable: (label: string) => {
          if (!divRef.current) return;
          const sel = window.getSelection();
          if (!sel || sel.rangeCount === 0) return;
          const range = sel.getRangeAt(0);
          range.deleteContents();
          const token = makeTokenSpan(label);
          range.insertNode(token);
          placeCaretAfter(token);
          // propagate change
          const serialized = serialize(divRef.current);
          lastValue.current = serialized;
          onChange(serialized);
        },
      }),
      [onChange]
    );

    // Input handling to keep value in sync
    const handleInput = () => {
      if (!divRef.current) return;
      const serialized = serialize(divRef.current);
      lastValue.current = serialized;
      onChange(serialized);
    };

    // Drag and drop of tokens within the editor
    useEffect(() => {
      const el = divRef.current;
      if (!el) return;

      const onDragStart = (e: DragEvent) => {
        const target = e.target as HTMLElement | null;
        if (target && target.dataset.token) {
          e.dataTransfer?.setData(
            "application/x-token-label",
            target.dataset.token
          );
          // mark original element for removal after drop if moving
          target.id =
            target.id || `token-${Math.random().toString(36).slice(2)}`;
          e.dataTransfer?.setData("application/x-token-id", target.id);
        }
      };
      const onDragOver = (e: DragEvent) => {
        if (e.dataTransfer?.types.includes("application/x-token-label")) {
          e.preventDefault();
        }
      };
      const onDrop = (e: DragEvent) => {
        const label = e.dataTransfer?.getData("application/x-token-label");
        const id = e.dataTransfer?.getData("application/x-token-id");
        if (!label) return;
        e.preventDefault();
        // place at caret position
        const sel = window.getSelection();
        if (!sel) return;
        const range = document.caretRangeFromPoint
          ? document.caretRangeFromPoint(e.clientX, e.clientY)
          : (function () {
              const r = document.createRange();
              r.selectNodeContents(el);
              r.collapse(false);
              return r;
            })();
        if (!range) return;
        sel.removeAllRanges();
        sel.addRange(range);
        // remove original if exists
        if (id) {
          const original = document.getElementById(id);
          if (original && original.parentElement === el) {
            original.remove();
          }
        }
        // insert new token
        const token = makeTokenSpan(label);
        range.insertNode(token);
        placeCaretAfter(token);
        handleInput();
      };

      el.addEventListener("dragstart", onDragStart as any);
      el.addEventListener("dragover", onDragOver as any);
      el.addEventListener("drop", onDrop as any);
      return () => {
        el.removeEventListener("dragstart", onDragStart as any);
        el.removeEventListener("dragover", onDragOver as any);
        el.removeEventListener("drop", onDrop as any);
      };
    }, [onChange]);

    const displayPlaceholder = !value;

    return (
      <div className="relative">
        {displayPlaceholder && (
          <div className="pointer-events-none absolute left-3 top-2 text-muted-foreground text-sm">
            {placeholder}
          </div>
        )}
        <div
          ref={divRef}
          role="textbox"
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          className={clsx(
            "min-h-[72px] w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            disabled ? "opacity-50 cursor-not-allowed" : "",
            className
          )}
        />
      </div>
    );
  }
);

export default RichTextarea;
