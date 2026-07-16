'use client';

import { useState } from 'react';
import { TracerToolbar } from './TracerToolbar';
import { TracerSidebar } from './TracerSidebar';
import TracerCanvas from './TracerCanvas';
import { useTracerStore } from '../store/useTracerStore';
import { Loader2 } from 'lucide-react';

export default function TracerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const imageLoading = useTracerStore(s => s.imageLoading);
  return (
    <div className="relative w-full h-dvh overflow-hidden bg-background">
      <TracerToolbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="absolute inset-0">
        <TracerCanvas />
        {imageLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/75">
            <div className="flex min-w-60 flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-5 text-center shadow-lg">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">ম্যাপ লোড হচ্ছে</p>
                <p className="mt-1 text-xs text-muted-foreground">একটু সময় লাগতে পারে</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <TracerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}
