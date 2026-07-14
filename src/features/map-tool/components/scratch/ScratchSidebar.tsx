import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Check, Edit } from 'lucide-react';
import type { SavedPlotRecord } from '@/features/map-tool/types/map';
import { useMapStore } from '@/features/map-tool/store/useMapStore';
import { Input } from '@/components/ui/input';

type ScratchSidebarProps = {
  savedPlots: SavedPlotRecord[];
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  onDeleteSavedPlot: (plotId: string) => void;
};

export const ScratchSidebar = ({ savedPlots, selectedIds, setSelectedIds, onDeleteSavedPlot }: ScratchSidebarProps) => {
  const { updateSavedPlot } = useMapStore();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState('');

  const startEditing = (plot: SavedPlotRecord) => {
    setEditingId(plot.id);
    setEditName(plot.name);
  };

  const saveEdit = (plotId: string) => {
    if (editName.trim()) {
      updateSavedPlot(plotId, { name: editName.trim() });
    }
    setEditingId(null);
  };

  return (
    <div className="scratch-sheet-sidebar space-y-3">
      <div className="max-h-72 overflow-auto border bg-background p-2 text-sm rounded-md">
        {savedPlots.length === 0 ? (
          <p className="text-muted-foreground">প্রথমে একটি প্লট সম্পন্ন করুন। সেভ করা প্লট ১০ দিন পর মুছে যাবে।</p>
        ) : savedPlots.map((plot) => (
          <div key={plot.id} className="flex items-start justify-between group rounded gap-2 transition-colors">
            <label className="flex items-start gap-2.5 cursor-pointer grow overflow-hidden">
              <input
                type="checkbox"
                className="shrink-0 mt-1"
                checked={selectedIds.includes(plot.id)}
                onChange={(event) => {
                  setSelectedIds((prev) => event.target.checked ? [...prev, plot.id] : prev.filter((id) => id !== plot.id));
                }}
              />
              <input
                type="color"
                value={plot.color || '#0d9488'}
                onChange={(e) => updateSavedPlot(plot.id, { color: e.target.value })}
                className="h-5 w-5 mt-0.5 p-0 border-0 shrink-0 cursor-pointer rounded overflow-hidden"
                title="রং পরিবর্তন করুন"
                onClick={(e) => e.stopPropagation()}
              />
              
              <div className="flex flex-col min-w-0 flex-1">
                {editingId === plot.id ? (
                  <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                    <Input 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-6 px-1 text-xs w-full"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(plot.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-emerald-600" onClick={(e) => { e.preventDefault(); saveEdit(plot.id); }}>
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate" title={plot.name}>{plot.name}</span>
                    <Button variant="ghost" size="icon-sm" className="h-4 w-4 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent" onClick={(e) => { e.preventDefault(); startEditing(plot); }} title="নাম পরিবর্তন করুন">
                      <Edit className="h-3 w-3 text-blue-600" />
                    </Button>
                  </div>
                )}
                <span className="text-xs text-muted-foreground mt-0.5">
                  {plot.results.shotok.toFixed(4)} শতক
                </span>
              </div>
            </label>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 mt-0.5 hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
              onClick={() => onDeleteSavedPlot(plot.id)}
              title="সেভ করা প্লটটি মুছুন"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
