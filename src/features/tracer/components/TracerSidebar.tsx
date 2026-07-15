'use client';

import { memo, useRef, useState, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { ImageUp, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronRight, FileDown, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useTracerStore } from '../store/useTracerStore';
import { exportAsPDF, exportAsPNG } from '../utils/exportTracer';
import { extractImageFromPDF } from '@/features/map-tool/utils/pdfHelper';

// ─── Color presets ────────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  '#DC2626', '#16A34A', '#2563EB', '#D97706',
  '#7C3AED', '#0891B2', '#BE185D', '#000000',
];

// ─── Background Section ───────────────────────────────────────────────────────
const BackgroundSection = memo(function BackgroundSection() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { backgroundImage, backgroundOpacity, setBackground, setBackgroundOpacity } = useTracerStore(
    useShallow(s => ({
      backgroundImage: s.backgroundImage,
      backgroundOpacity: s.backgroundOpacity,
      setBackground: s.setBackground,
      setBackgroundOpacity: s.setBackgroundOpacity,
    })),
  );

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.type === 'application/pdf') {
      try {
        const img = await extractImageFromPDF(file);
        setBackground(img);
      } catch (err) {
        console.error('PDF load error:', err);
      }
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => { URL.revokeObjectURL(url); setBackground(img); };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }, [setBackground]);

  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-heading">
        ব্যাকগ্রাউন্ড ম্যাপ
      </h3>
      <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleUpload} />
      <div className="flex gap-1.5">
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <ImageUp className="w-3.5 h-3.5 mr-1" />
          {backgroundImage ? 'পরিবর্তন' : 'আপলোড'}
        </Button>
        {backgroundImage && (
          <Button variant="ghost" size="icon-sm" onClick={() => setBackground(null)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
      {backgroundImage && (
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-muted-foreground">ব্যাকগ্রাউন্ড অপাসিটি</span>
            <span className="text-[10px] font-mono text-muted-foreground">{Math.round(backgroundOpacity * 100)}%</span>
          </div>
          <input
            type="range" min="0.1" max="1" step="0.05"
            value={backgroundOpacity}
            onChange={e => setBackgroundOpacity(Number(e.target.value))}
            className="w-full h-1.5 appearance-none cursor-pointer rounded-full bg-muted accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm"
          />
        </div>
      )}
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
        <Button variant="ghost" size="xs" onClick={addLayer}>
          <Plus className="w-3 h-3 mr-1" />যোগ করুন
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
                      {[1, 2, 3].map(w => (
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
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-heading">
        এক্সপোর্ট
      </h3>
      <div className="space-y-1">
        <Button variant="outline" size="sm" onClick={() => exportAsPDF(layers, backgroundImage, 'all')}>
          <FileDown className="w-3.5 h-3.5 mr-1.5" />
          PDF — সব লেয়ার
        </Button>
        {layers.map(l => (
          <Button key={l.id} variant="ghost" size="sm" onClick={() => exportAsPDF(layers, backgroundImage, l.id)}>
            <div className="w-2.5 h-2.5 rounded-full mr-1.5 shrink-0" style={{ backgroundColor: l.color }} />
            PDF — {l.name}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={() => exportAsPNG(layers, backgroundImage, 'all')}>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          PNG — সব লেয়ার
        </Button>
      </div>
    </div>
  );
});

// ─── Root Sidebar ─────────────────────────────────────────────────────────────
export const TracerSidebar = memo(function TracerSidebar() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-72 bg-background border-l border-border flex-col z-20 hidden md:flex">
      <div className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        <BackgroundSection />
        <Separator />
        <LayersSection />
        <Separator />
        <PolygonListSection />
        <Separator />
        <ExportSection />
      </div>
    </div>
  );
});
