import { Button } from '@/components/ui/button';
import { useShallow } from 'zustand/shallow';
import { Eye, EyeOff, Search, FileText, HelpCircle } from 'lucide-react';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';
import { SaveProjectDialog } from '@/features/land-measurement/components/SaveProjectDialog';

interface ToolTopControlsProps {
  showScratchSheet: boolean;
  setShowScratchSheet: (show: boolean) => void;
}

export const ToolTopControls = ({ showScratchSheet, setShowScratchSheet }: ToolTopControlsProps) => {
  const {
    isShowDiagonals,
    setIsShowDiagonals,
    isMagnifierEnabled,
    setIsMagnifierEnabled,
  } = useMapStore(
    useShallow((s) => ({
      isShowDiagonals: s.isShowDiagonals,
      setIsShowDiagonals: s.setIsShowDiagonals,
      isMagnifierEnabled: s.isMagnifierEnabled,
      setIsMagnifierEnabled: s.setIsMagnifierEnabled,
    })),
  );

  return (
    <>
      <div className="mb-2 flex justify-between items-center gap-2">
        <div id="step-toolbar" className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => setShowScratchSheet(!showScratchSheet)} variant={showScratchSheet ? 'default' : 'outline'} title="স্ক্র্যাচ শিট" className="hidden md:flex">
            <FileText  />
            <span className="hidden sm:inline">স্ক্র্যাচ শিট</span>
          </Button>
          <Button size="sm" onClick={() => setIsShowDiagonals(!isShowDiagonals)} variant={isShowDiagonals ? 'default' : 'outline'} title="কর্ণ (Diagonals) দেখান/লুকান">
            {isShowDiagonals ? <Eye  /> : <EyeOff  />}
            <span className="hidden sm:inline">কর্ণ</span>
          </Button>
          <Button size="sm" onClick={() => setIsMagnifierEnabled(!isMagnifierEnabled)} variant={isMagnifierEnabled ? 'default' : 'outline'}>
            <Search  />
            <span className="hidden sm:inline">ম্যাগনিফায়ার</span>
          </Button>
          <SaveProjectDialog />
        </div>
        <div id="step-top-controls" className="flex items-center gap-2">
          <Button size="icon-sm" variant="outline" onClick={() => window.dispatchEvent(new Event('start-tutorial'))} title="টিউটোরিয়াল / সাহায্য" className="text-muted-foreground">
            <HelpCircle />
          </Button>
        </div>
      </div>
    </>
  );
};

