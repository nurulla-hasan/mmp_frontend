"use client";

import { useCallback, useEffect, useState } from "react";
import { ErrorToast, SuccessToast } from "@/lib/utils";
import { parseKmzFile } from "../utils/kmzParser";
import type {
  InspectedCoordinate,
  KmzData,
  MapStyle,
  UserLocation,
} from "../types";
import CoordinateInspectorCard from "./CoordinateInspectorCard";
import KmzDropZone from "./KmzDropZone";
import KmzMapLoadingOverlay from "./KmzMapLoadingOverlay";
import KmzViewerHeader from "./KmzViewerHeader";
import KmzViewerMap from "./KmzViewerMap";
import KmzViewerToolbar from "./KmzViewerToolbar";

export default function KmzViewerStudio() {
  const [document, setDocument] = useState<KmzData | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyle>("satellite");
  const [overlayOpacity, setOverlayOpacity] = useState(1.0);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [inspectedCoordinate, setInspectedCoordinate] =
    useState<InspectedCoordinate | null>(null);

  const [fitBoundsTrigger, setFitBoundsTrigger] = useState(0);
  const [zoomInTrigger, setZoomInTrigger] = useState(0);
  const [zoomOutTrigger, setZoomOutTrigger] = useState(0);

  const handleFileSelect = useCallback(async (file: File) => {
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".kmz") && !fileName.endsWith(".kml")) {
      ErrorToast("শুধুমাত্র .kmz অথবা .kml ফাইল নির্বাচন করুন");
      return;
    }

    setLoading(true);
    try {
      const parsed = await parseKmzFile(file);
      setDocument(parsed);
      setOverlayOpacity(1.0);
      SuccessToast(`"${parsed.name}" সফলভাবে লোড হয়েছে`);
      setTimeout(() => {
        setFitBoundsTrigger((prev) => prev + 1);
      }, 300);
    } catch (error: unknown) {
      ErrorToast(
        error instanceof Error ? error.message : "KMZ ফাইল পড়া সম্ভব হয়নি",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGoToMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      ErrorToast("আপনার ব্রাউজারে Geolocation সাপোর্ট করে না");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLoc: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        setUserLocation(nextLoc);
        setLocating(false);
        SuccessToast("আপনার বর্তমান অবস্থান চিহ্নিত করা হয়েছে");
      },
      (geoError) => {
        setLocating(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          ErrorToast("লোকেশন পারমিশন দেওয়া হয়নি। ব্রাউজার সেটিংসে পারমিশন দিন");
        } else {
          ErrorToast("বর্তমান অবস্থান নির্ণয় করা যায়নি");
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 },
    );
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
      if (file) {
        handleFileSelect(file);
      }
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [handleFileSelect]);

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Top Header */}
      <KmzViewerHeader
        document={document}
        loading={loading}
        onFileSelect={handleFileSelect}
      />

      {/* Main Map & Viewer Area */}
      <div className="relative flex-1 overflow-hidden bg-muted/20">
        {/* Blurry Loading Placeholder */}
        <KmzMapLoadingOverlay isReady={isMapReady} mapStyle={mapStyle} />

        {/* Leaflet + Canvas Map */}
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

        {/* Empty State Dropzone if no KMZ loaded */}
        {!document && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto">
              <KmzDropZone
                onFileSelect={handleFileSelect}
                loading={loading}
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

        {/* Desktop Vertical Toolbar (Right side) */}
        <div className="absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-0.5 rounded-2xl border border-border bg-card/90 p-1.5 shadow-xl backdrop-blur-md md:flex">
          <KmzViewerToolbar
            document={document}
            loading={loading}
            locating={locating}
            mapStyle={mapStyle}
            opacity={overlayOpacity}
            mobile={false}
            onOpenKmz={() => {
              const fileInput = window.document.querySelector<HTMLInputElement>(
                'input[type="file"][accept=".kmz,.kml"]',
              );
              fileInput?.click();
            }}
            onToggleMapStyle={() =>
              setMapStyle((s) => (s === "satellite" ? "street" : "satellite"))
            }
            onGoToMyLocation={handleGoToMyLocation}
            onFitDocument={() => setFitBoundsTrigger((prev) => prev + 1)}
            onSetOpacity={setOverlayOpacity}
            onZoomIn={() => setZoomInTrigger((prev) => prev + 1)}
            onZoomOut={() => setZoomOutTrigger((prev) => prev + 1)}
            onClearDocument={() => {
              setDocument(null);
              setInspectedCoordinate(null);
              SuccessToast("KMZ ম্যাপ সরানো হয়েছে");
            }}
          />
        </div>

        {/* Mobile Horizontal Toolbar (Bottom Center Dock) */}
        <div className="absolute bottom-4 left-1/2 z-30 flex w-fit max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-1 rounded-2xl border border-border bg-card/95 p-1.5 shadow-xl backdrop-blur-md md:hidden">
          <KmzViewerToolbar
            document={document}
            loading={loading}
            locating={locating}
            mapStyle={mapStyle}
            opacity={overlayOpacity}
            mobile={true}
            onOpenKmz={() => {
              const fileInput = window.document.querySelector<HTMLInputElement>(
                'input[type="file"][accept=".kmz,.kml"]',
              );
              fileInput?.click();
            }}
            onToggleMapStyle={() =>
              setMapStyle((s) => (s === "satellite" ? "street" : "satellite"))
            }
            onGoToMyLocation={handleGoToMyLocation}
            onFitDocument={() => setFitBoundsTrigger((prev) => prev + 1)}
            onSetOpacity={setOverlayOpacity}
            onZoomIn={() => setZoomInTrigger((prev) => prev + 1)}
            onZoomOut={() => setZoomOutTrigger((prev) => prev + 1)}
            onClearDocument={() => {
              setDocument(null);
              setInspectedCoordinate(null);
              SuccessToast("KMZ ম্যাপ সরানো হয়েছে");
            }}
          />
        </div>
      </div>
    </div>
  );
}
