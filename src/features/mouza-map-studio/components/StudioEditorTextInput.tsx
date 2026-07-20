'use client';

import { Input } from '@/components/ui/input';
import type { StudioEditorText } from '../store/useMouzaMapStudioStore';

type StudioEditorTextInputProps = {
  selectedText: StudioEditorText;
  x: number;
  y: number;
  onChange: (id: string, text: string) => void;
  onBlur: (id: string) => void;
};

export default function StudioEditorTextInput({
  selectedText,
  x,
  y,
  onChange,
  onBlur,
}: StudioEditorTextInputProps) {
  return (
    <div
      className="absolute z-40 -translate-x-1/2 -translate-y-full pb-3"
      style={{ left: x, top: y }}
    >
      <Input
        autoFocus
        value={selectedText.text}
        placeholder="দাগ নম্বর / লেখা"
        onChange={(event) => onChange(selectedText.id, event.target.value)}
        onBlur={() => onBlur(selectedText.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === 'Escape') {
            event.currentTarget.blur();
          }
        }}
        onPointerDown={(event) => event.stopPropagation()}
        className="w-44 text-center font-semibold shadow-xl"
        style={{
          color: selectedText.color,
          borderColor: selectedText.color,
        }}
      />
    </div>
  );
}
