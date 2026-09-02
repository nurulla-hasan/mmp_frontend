'use client';

import { Crop, Map, Paintbrush, Sheet, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ToolTopNav } from '@/components/tools/tool-workspace-ui';
import type { StudioStep } from '../store/useMouzaMapStudioStore';

const steps: Array<{
  id: StudioStep;
  label: string;
  icon: typeof Map;
}> = [
  { id: 'align', label: 'Align Maps', icon: Map },
  { id: 'edit', label: 'Final Edit', icon: Paintbrush },
  { id: 'layout', label: 'Sheet Setup', icon: Sheet },
];

type StudioStepNavProps = {
  step: StudioStep;
  isPreparing: boolean;
  isLocked: boolean;
  compositeCrop: { x: number; y: number; width: number; height: number } | null;
  compositeMeta: { width: number; height: number } | null;
  onOpenStep: (step: StudioStep) => void;
  onOpenCrop: () => void;
  onClearCrop: () => void;
  onPrepareEditor: () => void;
};

export default function StudioStepNav({
  step,
  isPreparing,
  isLocked,
  compositeCrop,
  onOpenStep,
  onOpenCrop,
  onClearCrop,
}: StudioStepNavProps) {
  return (
    <ToolTopNav title="Mouza Map Studio" icon={Map}>
      {steps.map(({ id, label, icon: Icon }) => {
        const active = step === id;
        return (
          <Button
            key={id}
            variant={active ? 'default' : 'ghost'}
            size="sm"
            disabled={isPreparing}
            onClick={() => onOpenStep(id)}
          >
            <Icon className="size-3.5" />
            <span className="whitespace-nowrap">{label}</span>
          </Button>
        );
      })}

      {step === 'align' && isLocked && (
        <>
          <Button
            variant="outline"
            size="sm"
            loading={isPreparing}
            loadingText={compositeCrop ? 'Change Crop' : 'Combined Crop'}
            onClick={onOpenCrop}
          >
            <Crop className="size-3.5" />
            <span className="whitespace-nowrap">
              {compositeCrop ? 'Change Crop' : 'Combined Crop'}
            </span>
          </Button>

          {compositeCrop && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClearCrop}
              title="Remove Combined Crop"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </>
      )}
    </ToolTopNav>
  );
}
