'use client';

import type { StudioEditorTool } from '../store/useMouzaMapStudioStore';

type StudioEditorControlsProps = {
  editorTool: StudioEditorTool;
  cleanupWidth: number;
  markWidth: number;
  fontSize: number;
  annotationColor: string;
  onChangeCleanupWidth: (value: number) => void;
  onChangeMarkWidth: (value: number) => void;
  onChangeFontSize: (value: number) => void;
  onChangeAnnotationColor: (value: string) => void;
};

export default function StudioEditorControls({
  editorTool,
  cleanupWidth,
  markWidth,
  fontSize,
  annotationColor,
  onChangeCleanupWidth,
  onChangeMarkWidth,
  onChangeFontSize,
  onChangeAnnotationColor,
}: StudioEditorControlsProps) {
  const controlLabel =
    editorTool === 'cleanup'
      ? 'Brush size'
      : editorTool === 'mark'
        ? 'Line size'
        : editorTool === 'text'
          ? 'Text size'
          : null;

  if (!controlLabel) return null;

  return (
    <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-background/95 px-4 py-2 text-xs shadow-xl">
      <span className="whitespace-nowrap font-medium">{controlLabel}</span>

      {editorTool === 'cleanup' && (
        <input
          type="range"
          min={8}
          max={100}
          value={cleanupWidth}
          onChange={(event) => onChangeCleanupWidth(Number(event.target.value))}
        />
      )}

      {editorTool === 'mark' && (
        <input
          type="range"
          min={1}
          max={16}
          value={markWidth}
          onChange={(event) => onChangeMarkWidth(Number(event.target.value))}
        />
      )}

      {editorTool === 'text' && (
        <input
          type="range"
          min={10}
          max={20}
          value={fontSize}
          onChange={(event) => onChangeFontSize(Number(event.target.value))}
        />
      )}

      {editorTool !== 'cleanup' && (
        <input
          type="color"
          value={annotationColor}
          onChange={(event) => onChangeAnnotationColor(event.target.value)}
          title="Color"
          className="size-7 cursor-pointer rounded border-0 bg-transparent p-0"
        />
      )}

      <span className="tabular-nums text-muted-foreground">
        {editorTool === 'cleanup'
          ? cleanupWidth
          : editorTool === 'mark'
            ? markWidth
            : fontSize}
        px
      </span>
    </div>
  );
}
