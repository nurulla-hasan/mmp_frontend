import {
  Crosshair,
  Download,
  MapPinned,
  RotateCcw,
  RotateCw,
  Settings2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

import type { InteractionTarget, Point2D } from '../types';
import FloatingToolButton from './FloatingToolButton';

type GeoStudioToolbarProps = {
  settingsOpen: boolean;
  activeView: 'source' | 'world';
  transform: unknown;
  pendingSource: Point2D | null;
  interactionTarget: InteractionTarget;
  image: unknown;
  imageDataUrl: string | null;
  onToggleSettings: () => void;
  onSetInteractionTarget: (target: InteractionTarget) => void;
  onScale: (factor: number) => void;
  onRotate: (angleRadians: number) => void;
  onExport: () => void;
  onResetAlignment: () => void;
  mobile: boolean;
};

export default function GeoStudioToolbar({
  settingsOpen,
  activeView,
  transform,
  pendingSource,
  interactionTarget,
  image,
  imageDataUrl,
  onToggleSettings,
  onSetInteractionTarget,
  onScale,
  onRotate,
  onExport,
  onResetAlignment,
  mobile,
}: GeoStudioToolbarProps) {
  const mapControlsDisabled =
    activeView !== 'world' || !transform || Boolean(pendingSource);

  const separator = (
    <div
      className={
        mobile
          ? 'mx-0.5 h-6 w-px bg-border/60'
          : 'my-0.5 h-px w-6 bg-border/60'
      }
    />
  );

  return (
    <>
      <FloatingToolButton
        icon={Settings2}
        label="ম্যাপ ও সেটিংস"
        active={settingsOpen}
        onClick={onToggleSettings}
        mobile={mobile}
      />
      {separator}
      <FloatingToolButton
        icon={MapPinned}
        label="World Map control"
        active={
          activeView === 'world' &&
          interactionTarget === 'map' &&
          !mapControlsDisabled
        }
        disabled={mapControlsDisabled}
        onClick={() => onSetInteractionTarget('map')}
        mobile={mobile}
      />
      <FloatingToolButton
        icon={Crosshair}
        label="PDF overlay control"
        active={
          activeView === 'world' &&
          interactionTarget === 'pdf' &&
          !mapControlsDisabled
        }
        disabled={mapControlsDisabled}
        onClick={() => onSetInteractionTarget('pdf')}
        mobile={mobile}
      />
      {separator}
      <FloatingToolButton
        icon={ZoomOut}
        label="PDF ছোট করুন"
        disabled={!transform}
        onClick={() => onScale(1 / 1.02)}
        mobile={mobile}
      />
      <FloatingToolButton
        icon={ZoomIn}
        label="PDF বড় করুন"
        disabled={!transform}
        onClick={() => onScale(1.02)}
        mobile={mobile}
      />
      <FloatingToolButton
        icon={RotateCcw}
        label="PDF বামে ঘোরান"
        disabled={!transform}
        onClick={() => onRotate(-Math.PI / 180)}
        mobile={mobile}
      />
      <FloatingToolButton
        icon={RotateCw}
        label="PDF ডানে ঘোরান"
        disabled={!transform}
        onClick={() => onRotate(Math.PI / 180)}
        mobile={mobile}
      />
      {separator}
      <FloatingToolButton
        icon={Download}
        label="KMZ Export"
        disabled={!transform || !imageDataUrl}
        onClick={onExport}
        mobile={mobile}
      />
      <FloatingToolButton
        icon={RotateCcw}
        label="Alignment reset"
        disabled={!image}
        onClick={onResetAlignment}
        mobile={mobile}
      />
    </>
  );
}
