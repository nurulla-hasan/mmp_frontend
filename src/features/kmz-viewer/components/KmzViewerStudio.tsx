"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Compass, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ToolEmptyState,
  ToolTopNav,
} from "@/components/tools/tool-workspace-ui";
import { ErrorToast, SuccessToast } from "@/lib/utils";
import { parseKmzFile } from "../utils/kmzParser";
import type {
  InspectedCoordinate,
  KmzData,
  MapStyle,
  UserLocation,
} from "../types";
import CoordinateInspectorCard from "./CoordinateInspectorCard";
import KmzMapLoadingOverlay from "./KmzMapLoadingOverlay";
import KmzViewerMap from "./KmzViewerMap";
import KmzViewerToolbar from "./KmzViewerToolbar";

export default function KmzViewerStudio() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [document, setDocument] = useState<KmzData | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyle>("satellite");
  const [overlayOpacity, setOverlayOpacity] = useState(1.0);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [inspectedCoordinate, setInspectedCoordinate] = useState<InspectedCoordinate | null>(null);

  const [fitBoundsTrigger, setFitBoundsTrigger] = useState(0);
  const [zoomInTrigger, setZoomInTrigger] = useState(0);
  const [zoomOutTrigger, setZoomOutTrigger] = useState(0);

  const handleFileSelect = useCallback(async (file: File) => {
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".kmz") && !fileName.endsWith(".kml")) {
      ErrorToast("Please select a valid .kmz or .kml file");
      return;
    }

    setLoading(true);
    try {
      const parsed = await parseKmzFile(file);
      setDocument(parsed);
      setOverlayOpacity(1.0);

      let msg = `"${parsed.name}" loaded successfully`;
      if (parsed.summary) {
        const parts: string[] = [];
        if (parsed.summary.tileCount > 0) parts.push(`${parsed.summary.tileCount} overlay tiles`);
        if (parsed.summary.polygonCount > 0) parts.push(`${parsed.summary.polygonCount} plots/polygons`);
        if (parsed.summary.lineCount > 0) parts.push(`${parsed.summary.lineCount} lines`);
        if (parsed.summary.pointCount > 0) parts.push(`${parsed.summary.pointCount} points`);
        if (parts.length > 0) msg += ` (${parts.join(", ")})`;
      }
      SuccessToast(msg);
      setFitBoundsTrigger((prev) => prev + 1);
      setTimeout(() => setFitBoundsTrigger((prev) => prev + 1), 250);
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "Failed to load KMZ file");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGoToMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      ErrorToast("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, timestamp: pos.timestamp });
        setLocating(false);
        SuccessToast("Current location detected");
      },
      (err) => {
        setLocating(false);
        ErrorToast(err.code === err.PERMISSION_DENIED ? "Location permission denied" : "Could not determine current location");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 },
    );
  }, []);

  const handleClearDocument = useCallback(() => {
    setDocument(null);
    setInspectedCoordinate(null);
    SuccessToast("KMZ overlay cleared");
  }, []);

  // Window-level Drag & Drop support
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer?.files?.[0];
      if (file) handleFileSelect(file);
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);
    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [handleFileSelect]);

  const toggleMapStyle = () =>
    setMapStyle((s) => (s === "satellite" ? "street" : "satellite"));

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background text-foreground">
      <input
        ref={fileInputRef}
        type="file"
        accept=".kmz,.kml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
          e.target.value = "";
        }}
      />

      {/* Floating Top Navigation */}
      <ToolTopNav
        title="KMZ Map Viewer"
        icon={Compass}
        backHref="/tools"
        backLabel="Back to Tools"
      >
        {document && (
          <span className="max-w-36 truncate font-mono text-xs text-muted-foreground sm:max-w-56">
            {document.name}
          </span>
        )}
      </ToolTopNav>

      {/* Main Map Canvas Area */}
      <div className="absolute inset-0">
        <KmzMapLoadingOverlay isReady={isMapReady} mapStyle={mapStyle} />

        <KmzViewerMap
          kmzData={document}
          opacity={overlayOpacity}
          mapStyle={mapStyle}
          userLocation={userLocation}
          fitBoundsTrigger={fitBoundsTrigger}
          zoomInTrigger={zoomInTrigger}
          zoomOutTrigger={zoomOutTrigger}
          onMapReady={() => setIsMapReady(true)}
          onInspectCoordinate={(coord) => setInspectedCoordinate(coord)}
        />

        {/* Empty State */}
        {!document && (
          <div className="absolute inset-0 z-10 grid place-items-center p-6 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-sm">
              <ToolEmptyState
                icon={Compass}
                title="KMZ Map Viewer"
                description="Upload Google Earth KMZ or KML files to view overlays on satellite maps and inspect coordinates."
                actions={
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="w-full gap-2"
                  >
                    <FileUp className="size-4" />
                    <span>
                      {loading ? "Loading file…" : "Open KMZ / KML File"}
                    </span>
                  </Button>
                }
              />
            </div>
          </div>
        )}

        {/* Coordinate Inspector Card */}
        {inspectedCoordinate && (
          <div className="absolute bottom-20 left-4 right-4 z-30 flex justify-center sm:left-6 sm:right-auto sm:justify-start sm:bottom-6">
            <CoordinateInspectorCard
              coordinate={inspectedCoordinate}
              onClose={() => setInspectedCoordinate(null)}
            />
          </div>
        )}
      </div>

      {/* Desktop Floating Toolbar (Right Side) */}
      <div className="absolute right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-0.5 rounded-2xl border border-border bg-card/90 p-1.5 shadow-xl backdrop-blur-md md:flex">
        <KmzViewerToolbar
          document={document}
          loading={loading}
          locating={locating}
          mapStyle={mapStyle}
          opacity={overlayOpacity}
          mobile={false}
          onOpenKmz={() => fileInputRef.current?.click()}
          onToggleMapStyle={toggleMapStyle}
          onGoToMyLocation={handleGoToMyLocation}
          onFitDocument={() => setFitBoundsTrigger((prev) => prev + 1)}
          onSetOpacity={setOverlayOpacity}
          onZoomIn={() => setZoomInTrigger((prev) => prev + 1)}
          onZoomOut={() => setZoomOutTrigger((prev) => prev + 1)}
          onClearDocument={handleClearDocument}
        />
      </div>

      {/* Mobile Floating Toolbar (Bottom Center Dock) */}
      <div className="absolute bottom-4 left-1/2 z-40 flex w-fit max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-1 rounded-2xl border border-border bg-card/95 p-1.5 shadow-xl backdrop-blur-md md:hidden">
        <KmzViewerToolbar
          document={document}
          loading={loading}
          locating={locating}
          mapStyle={mapStyle}
          opacity={overlayOpacity}
          mobile={true}
          onOpenKmz={() => fileInputRef.current?.click()}
          onToggleMapStyle={toggleMapStyle}
          onGoToMyLocation={handleGoToMyLocation}
          onFitDocument={() => setFitBoundsTrigger((prev) => prev + 1)}
          onSetOpacity={setOverlayOpacity}
          onZoomIn={() => setZoomInTrigger((prev) => prev + 1)}
          onZoomOut={() => setZoomOutTrigger((prev) => prev + 1)}
          onClearDocument={handleClearDocument}
        />
      </div>
    </div>
  );
}
