'use client';

import { TracerToolbar } from './TracerToolbar';
import { TracerSidebar } from './TracerSidebar';
import TracerCanvas from './TracerCanvas';

export default function TracerLayout() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      <TracerToolbar />
      <div className="absolute inset-0 top-12 bottom-0 left-0 right-0 md:right-72">
        <TracerCanvas />
      </div>
      <TracerSidebar />
    </div>
  );
}
