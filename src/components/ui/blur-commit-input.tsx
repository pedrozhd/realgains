"use client";

import { useState, type ComponentProps, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";

interface BlurCommitInputProps extends Omit<ComponentProps<typeof Input>, "value" | "onChange" | "defaultValue"> {
  value: string;
  onCommit: (value: string) => void;
}

/** Types freely, only writes on blur/Enter — avoids a network write per keystroke. */
export function BlurCommitInput({ value, onCommit, onBlur, onKeyDown, ...props }: BlurCommitInputProps) {
  const [local, setLocal] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);

  // Resync local state when the source value changes externally (e.g. a
  // reorder or a refetch) — adjusted during render per React's guidance,
  // instead of an effect, so it doesn't cost an extra commit.
  if (value !== syncedValue) {
    setSyncedValue(value);
    setLocal(value);
  }

  return (
    <Input
      {...props}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={(e) => {
        if (local !== value) onCommit(local);
        onBlur?.(e);
      }}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") e.currentTarget.blur();
        onKeyDown?.(e);
      }}
    />
  );
}
