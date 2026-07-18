'use client';

import { memo, useRef, useState, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { ImageUp, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronRight, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useTracerStore } from '../store/useTracerStore';
import { exportAsPDF, exportAsPNG } from '../utils/exportTracer';
import { extractImageFromPDF } from '@/features/land-measurement/utils/pdfHelper';
import { useMediaQuery } from '@/hooks/useUtilityHooks';
import { resizeImageForCanvas } from '@/lib/canvasImage';

// ─── Color presets ────────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  '#DC2626', '#16A34A', '#2563EB', '#D97706',
  '#7C3AED', '#0891B2', '#BE185D', '#000000',
];

// ─── Background Section ───────────────────────────────────────────────────────
const BackgroundSection = memo(function BackgroundSection() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { backgroundImage, imageLoading, setBackground, setImageLoading } = useTracerStore(
    useShallow(s => ({
      backgroundImage: s.backgroundImage,
      imageLoading: s.imageLoading,
      setBackground: s.setBackground,
      setImageLoading: s.setImageLoading,
    })),
  );

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImageLoading(true);

    if (file.type === 'application/pdf') {
      try {
        const img = await extractImageFromPDF(file);
        setBackground(await resizeImageForCanvas(img));
      } catch (err) {
        console.error('PDF load error:', err);
      } finally {
        setImageLoading(false);
      }
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = async () => {
      try {
        setBackground(await resizeImageForCanvas(img));
      } catch (error: unknown) {
        console.error('Image load error:', error instanceof Error ? error.message : 'Unknown error');
      } finally {
        URL.revokeObjectURL(url);
        setImageLoading(false);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); setImageLoading(false); };
    img.src = url;
  }, [setBackground, setImageLoading]);

  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-heading">
        ব্যাকগ্রাউন্ড ম্যাপ
      </h3>
      <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleUpload} />
      <div className="flex gap-1.5">
        <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={imageLoading}>
          <ImageUp className="w-4 h-4 mr-1.5" />
          {imageLoading ? 'লোড হচ্ছে...' : backgroundImage ? 'পরিবর্তন' : 'আপলোড'}
        </Button>
        {backgroundImage && (
        <Button variant="ghost" size="icon" onClick={() => setBackground(null)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
    </div>
  );
});

// ─── Layers Section ───────────────────────────────────────────────────────────
const LayersSection = memo(function LayersSection() {
  const {
    layers, activeLayerId,
    addLayer, removeLayer, setActiveLayer,
    toggleLayerVisibility, setLayerColor, setLayerLineWidth, renameLayer,
  } = useTracerStore(useShallow(s => ({
    layers: s.layers,
    activeLayerId: s.activeLayerId,
    addLayer: s.addLayer,
    removeLayer: s.removeLayer,
    setActiveLayer: s.setActiveLayer,
    toggleLayerVisibility: s.toggleLayerVisibility,
    setLayerColor: s.setLayerColor,
    setLayerLineWidth: s.setLayerLineWidth,
    renameLayer: s.renameLayer,
  })));

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-heading">
          লেয়ার ({layers.length})
        </h3>
        <Button variant="ghost" onClick={addLayer}>
          <Plus className="w-4 h-4 mr-1.5" />যোগ করুন
        </Button>
      </div>

      <div className="space-y-1">
        {layers.map(layer => {
          const isActive = layer.id === activeLayerId;
          const isExpanded = expandedId === layer.id;

          return (
            <div
              key={layer.id}
              className={`rounded-lg border transition-all ${
                isActive ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/20'
              }`}
            >
              {/* Layer row */}
              <div
                className="flex items-center gap-1.5 px-2 py-1.5 cursor-pointer"
                onClick={() => setActiveLayer(layer.id)}
              >
                {/* Color swatch */}
                <div className="relative shrink-0">
                  <div
                    className="w-4 h-4 rounded-full border border-border/50"
                    style={{ backgroundColor: layer.color }}
                  />
                  <input
                    type="color"
                    value={layer.color}
                    onChange={e => setLayerColor(layer.id, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    className="absolute inset-0 opacity-0 cursor-pointer w-4 h-4"
                    title="রং পরিবর্তন করুন"
                  />
                </div>

                {/* Name */}
                {editingId === layer.id ? (
                  <input
                    autoFocus
                    defaultValue={layer.name}
                    onClick={e => e.stopPropagation()}
                    onBlur={e => { renameLayer(layer.id, e.target.value || layer.name); setEditingId(null); }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { renameLayer(layer.id, e.currentTarget.value || layer.name); setEditingId(null); }
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="flex-1 text-xs bg-transparent outline-none border-b border-primary"
                  />
                ) : (
                  <span
                    className="flex-1 text-xs font-medium truncate"
                    onDoubleClick={e => { e.stopPropagation(); setEditingId(layer.id); }}
                  >
                    {layer.name}
                  </span>
                )}

                <span className="text-[10px] text-muted-foreground shrink-0">{layer.polygons.length}</span>

                {/* Visibility */}
                <button
                  onClick={e => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                  className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 opacity-40" />}
                </button>

                {/* Expand toggle */}
                <button
                  onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : layer.id); }}
                  className="p-0.5 text-muted-foreground"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expanded settings */}
              {isExpanded && (
                <div className="px-2 pb-2 space-y-2 border-t border-border/40 pt-2">
                  {/* Line width */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">লাইন</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(w => (
                        <button
                          key={w}
                          onClick={() => setLayerLineWidth(layer.id, w)}
                          className={`w-7 h-6 rounded text-[10px] font-medium transition-colors border ${
                            layer.lineWidth === w
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {w}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color presets */}
                  <div className="flex gap-1 flex-wrap">
                    {COLOR_PRESETS.map(c => (
                      <button
                        key={c}
                        onClick={() => setLayerColor(layer.id, c)}
                        className={`w-5 h-5 rounded-full border-2 transition-all ${
                          layer.color === c ? 'border-foreground scale-110' : 'border-transparent hover:border-border'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  {/* Delete layer */}
                  {layers.length > 1 && (
                    <button
                      onClick={() => removeLayer(layer.id)}
                      className="text-[10px] text-destructive hover:underline"
                    >
                      লেয়ার মুছুন
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── Polygon List Section ─────────────────────────────────────────────────────
const PolygonListSection = memo(function PolygonListSection() {
  const {
    layers, activeLayerId, selectedPolygonId, selectedLayerId,
    deletePolygon, selectPolygon, setPolygonLabel,
  } = useTracerStore(useShallow(s => ({
    layers: s.layers,
    activeLayerId: s.activeLayerId,
    selectedPolygonId: s.selectedPolygonId,
    selectedLayerId: s.selectedLayerId,
    deletePolygon: s.deletePolygon,
    selectPolygon: s.selectPolygon,
    setPolygonLabel: s.setPolygonLabel,
  })));

  const activeLayer = layers.find(l => l.id === activeLayerId);
  if (!activeLayer || activeLayer.polygons.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-heading">
        দাগসমূহ ({activeLayer.polygons.length})
      </h3>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {activeLayer.polygons.map(poly => {
          const isSelected = selectedPolygonId === poly.id && selectedLayerId === activeLayer.id;
          return (
            <div
              key={poly.id}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer transition-colors ${
                isSelected ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-muted/40 hover:bg-muted/70'
              }`}
              onClick={() => selectPolygon(activeLayer.id, poly.id)}
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: activeLayer.color }} />
              <input
                value={poly.label}
                onChange={e => setPolygonLabel(activeLayer.id, poly.id, e.target.value)}
                onClick={e => e.stopPropagation()}
                placeholder="অনামী দাগ"
                className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground/40 min-w-0"
              />
              <button
                onClick={e => { e.stopPropagation(); deletePolygon(activeLayer.id, poly.id); }}
                className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── Export Section ───────────────────────────────────────────────────────────
const ExportSection = memo(function ExportSection() {
  const { layers, backgroundImage } = useTracerStore(
    useShallow(s => ({ layers: s.layers, backgroundImage: s.backgroundImage })),
  );

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-heading">
        এক্সপোর্ট
      </h3>
      <div className="space-y-3">
        {layers.map(l => (
          <div key={`export-${l.id}`} className="space-y-2.5 p-3 rounded-lg border border-border/60 bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: l.color }} />
              <span className="text-sm font-medium">{l.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs h-8 hover:bg-primary/10 hover:text-primary transition-colors border-border/80" 
                onClick={() => exportAsPDF(layers, backgroundImage, l.id)}
              >
                PDF সেভ করুন
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs h-8 hover:bg-primary/10 hover:text-primary transition-colors border-border/80" 
                onClick={() => exportAsPNG(layers, backgroundImage, l.id)}
              >
                PNG সেভ করুন
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const SidebarContent = memo(function SidebarContent() {
  return (
    <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-6">
      <BackgroundSection />
      <Separator />
      <LayersSection />
      <Separator />
      <PolygonListSection />
      <Separator />
      <ExportSection />
    </div>
  );
});

// ─── Root Sidebar ─────────────────────────────────────────────────────────────
export const TracerSidebar = memo(function TracerSidebar({
  isOpen,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const isMobile = useMediaQuery('(max-width: 767px)');

  if (!isOpen) return null;

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <div className="absolute left-4 top-4 max-h-[calc(100dvh-2rem)] w-80 bg-card/95 backdrop-blur-md border border-border flex-col z-20 hidden md:flex overflow-hidden rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground font-heading">ট্রেসার সেটিংস</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full shrink-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="overflow-y-auto" style={{ minHeight: 0 }}>
          <SidebarContent />
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {isMobile && (
        <div className="md:hidden">
          <Drawer open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
            <DrawerContent className="max-h-[85dvh]">
              <DrawerHeader className="border-b border-border py-3 flex flex-row items-center justify-between">
                <DrawerTitle className="text-left font-heading text-lg">ট্রেসার সেটিংস</DrawerTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full shrink-0" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </DrawerHeader>
              <div className="overflow-y-auto">
                <SidebarContent />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      )}
    </>
  );
});
