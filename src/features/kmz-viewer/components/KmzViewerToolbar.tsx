import { FileUp, LocateFixed, Navigation, Satellite } from "lucide-react";
import type { KmzData, MapStyle } from "../types";
import KmzFloatingToolButton from "./KmzFloatingToolButton";
import KmzMorePopover from "./KmzMorePopover";
import KmzOpacityPopover from "./KmzOpacityPopover";

type Props = {
  document: KmzData | null;
  loading: boolean;
  locating: boolean;
  mapStyle: MapStyle;
  opacity: number;
  mobile?: boolean;
  onOpenKmz: () => void;
  onToggleMapStyle: () => void;
  onGoToMyLocation: () => void;
  onFitDocument: () => void;
  onSetOpacity: (val: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onClearDocument: () => void;
};

export default function KmzViewerToolbar({
  document,
  loading,
  locating,
  mapStyle,
  opacity,
  mobile = false,
  onOpenKmz,
  onToggleMapStyle,
  onGoToMyLocation,
  onFitDocument,
  onSetOpacity,
  onZoomIn,
  onZoomOut,
  onClearDocument,
}: Props) {
  return (
    <div
      className={
        mobile
          ? "flex items-center gap-1"
          : "flex flex-col items-center gap-0.5"
      }
    >
      {/* 1. Import Button */}
      <KmzFloatingToolButton
        icon={FileUp}
        label="Import KMZ"
        onClick={onOpenKmz}
        loading={loading}
        mobile={mobile}
      />

      <div
        className={
          mobile ? "mx-0.5 h-6 w-px bg-border/60" : "my-0.5 h-px w-6 bg-border/60"
        }
      />

      {/* 2. Map Style Switcher */}
      <KmzFloatingToolButton
        icon={Satellite}
        label={
          mapStyle === "satellite"
            ? "Switch to Normal Map"
            : "Switch to Satellite Map"
        }
        active={mapStyle === "satellite"}
        onClick={onToggleMapStyle}
        mobile={mobile}
      />

      {/* 3. GPS Location */}
      <KmzFloatingToolButton
        icon={Navigation}
        label="My Location (GPS)"
        active={locating}
        loading={locating}
        onClick={onGoToMyLocation}
        mobile={mobile}
      />

      {/* 4. Fit KMZ */}
      <KmzFloatingToolButton
        icon={LocateFixed}
        label="Fit KMZ to Screen"
        disabled={!document}
        onClick={onFitDocument}
        mobile={mobile}
      />

      <div
        className={
          mobile ? "mx-0.5 h-6 w-px bg-border/60" : "my-0.5 h-px w-6 bg-border/60"
        }
      />

      {/* 5. Opacity Popover Controller */}
      <KmzOpacityPopover
        document={document}
        opacity={opacity}
        mobile={mobile}
        onSetOpacity={onSetOpacity}
      />

      {/* 6. More Popover */}
      <KmzMorePopover
        document={document}
        mobile={mobile}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onClearDocument={onClearDocument}
      />
    </div>
  );
}
