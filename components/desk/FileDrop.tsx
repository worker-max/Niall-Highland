"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/cn";

interface FileDropProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxBytes?: number;
}

/**
 * Drag-drop file picker. Accepts up to maxFiles × maxBytes each.
 * Keeps the file list in parent state so submit can include them.
 */
export function FileDrop({
  files,
  onChange,
  maxFiles = 5,
  maxBytes = 8 * 1024 * 1024,
}: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = useCallback(
    (incoming: FileList | File[]) => {
      setError(null);
      const arr = Array.from(incoming);
      const tooBig = arr.find((f) => f.size > maxBytes);
      if (tooBig) {
        setError(`"${tooBig.name}" is larger than ${Math.round(maxBytes / 1024 / 1024)} MB.`);
        return;
      }
      const combined = [...files, ...arr].slice(0, maxFiles);
      if (files.length + arr.length > maxFiles) {
        setError(`Max ${maxFiles} files.`);
      }
      onChange(combined);
    },
    [files, maxBytes, maxFiles, onChange],
  );

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) accept(e.dataTransfer.files);
  };

  const remove = (i: number) => {
    onChange(files.filter((_, idx) => idx !== i));
  };

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center",
          "rounded-[2px] border-2 border-dashed p-[var(--space-8)] text-center",
          "transition-colors duration-[var(--duration-default)] ease-[var(--ease-editorial)]",
          dragOver
            ? "border-[color:var(--accent)] bg-[color:var(--accent-900)]/20"
            : "border-[color:var(--border)] bg-[color:var(--surface-raised)]",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={(e) => e.target.files && accept(e.target.files)}
          className="sr-only"
        />
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--accent)]">
          Drop files or click to browse
        </p>
        <p className="mt-[var(--space-2)] text-[length:var(--text-small)] text-[color:var(--text-muted)]">
          Up to {maxFiles} files · {Math.round(maxBytes / 1024 / 1024)} MB each
        </p>
      </label>

      {error ? (
        <p className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--danger-500)]">
          {error}
        </p>
      ) : null}

      {files.length > 0 ? (
        <ul className="flex flex-col gap-[var(--space-2)]">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between gap-[var(--space-3)] rounded-[2px] border border-[color:var(--border)] bg-[color:var(--surface)] px-[var(--space-3)] py-[var(--space-2)]"
            >
              <span className="font-mono text-[var(--text-caption)] text-[color:var(--text)]">
                {f.name}{" "}
                <span className="text-[color:var(--text-faint)]">
                  ({Math.round(f.size / 1024)} KB)
                </span>
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="font-mono text-[var(--text-caption)] uppercase tracking-[var(--tracking-label)] text-[color:var(--text-faint)] hover:text-[color:var(--danger-500)]"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
