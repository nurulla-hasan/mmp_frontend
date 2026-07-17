import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';
import { toast } from 'sonner';

export const SaveProjectDialog = ({ iconOnly = false, size = 'md' }: { iconOnly?: boolean; size?: 'sm' | 'md' }) => {
  const { image, imageName, scale, plots, currentProjectId } = useMapStore();

  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isSaving] = useState(false);

  const handleSaveProject = () => {
    if (!image) {
      toast.warning('সেভ বা আপডেট করার আগে একটি ম্যাপ আপলোড করুন');
      return;
    }

    if (plots.length === 0) {
      toast.warning('সেভ করার আগে অন্তত একটি প্লট আঁকুন');
      return;
    }

    if (!scale) {
      toast.warning('সেভ করার আগে স্কেল সেট করুন');
      return;
    }

    if (currentProjectId) {
      handleLocalDownload();
    } else {
      setOpen(true);
    }
  };

  const handleLocalDownload = () => {
    const projectData = {
      name: projectName || imageName || 'map-project',
      imageName,
      scale,
      plots,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectData.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('প্রজেক্ট লোকালি ডাউনলোড হয়েছে!');
  };

  const confirmSaveProject = () => {
    if (!projectName.trim()) {
      toast.error('প্রজেক্টের নাম দিন');
      return;
    }

    const projectData = {
      name: projectName,
      imageName,
      scale,
      plots,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('প্রজেক্ট লোকালি ডাউনলোড হয়েছে!');
    setOpen(false);
    setProjectName('');
  };

  if (iconOnly) {
    const tooltipLabel = plots.length === 0 ? 'সেভ করার আগে অন্তত একটি প্লট আঁকুন' : !scale ? 'সেভ করার আগে স্কেল সেট করুন' : 'ডাউনলোড করুন';
    const isDisabled = isSaving || plots.length === 0 || !scale;

    return (
      <>
        <Tooltip>
          <TooltipTrigger render={<div className="inline-flex" />} className="focus-visible:outline-none focus:outline-none">
            <span className={isDisabled ? "cursor-not-allowed inline-flex" : "inline-flex"}>
              <button
                type="button"
                onClick={handleSaveProject}
                disabled={isDisabled}
                className={[
                  `flex ${size === 'sm' ? 'h-9 w-9' : 'h-10 w-10'} items-center justify-center rounded-xl transition-all`,
                  'text-muted-foreground hover:bg-muted hover:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  isDisabled ? 'pointer-events-none opacity-40' : '',
                ].join(' ')}
              >
                {isSaving ? <Loader2 className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} animate-spin`} /> : <Download className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />}
              </button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8}>
            {tooltipLabel}
          </TooltipContent>
        </Tooltip>
      </>
    );
  }

  return (
    <>
      <Button
        size="sm"
        onClick={handleSaveProject}
        variant="default"
        className="bg-primary/90 hover:bg-primary"
        disabled={isSaving || plots.length === 0 || !scale}
        title={
          plots.length === 0 ? 'সেভ করার আগে অন্তত একটি প্লট আঁকুন' :
          !scale ? 'সেভ করার আগে স্কেল সেট করুন' :
          ''
        }
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download />
        )}
        <span className="hidden sm:inline">
          {isSaving ? 'ডাউনলোড হচ্ছে...' : 'ডাউনলোড'}
        </span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>প্রজেক্ট সেভ করুন</DialogTitle>
            <DialogDescription>
              এই ম্যাপের বর্তমান ড্রয়িং এবং হিসেব JSON ফাইল হিসেবে ডাউনলোড করুন।
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="projectName">প্রজেক্টের নাম</Label>
              <Input
                id="projectName"
                placeholder="যেমন: দিনাজপুর শিট ৪"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
              <strong>লক্ষ্য করুন:</strong> JSON ফাইলটিতে ম্যাপের ছবি সংযুক্ত থাকে না। <strong>{imageName}</strong> নামের আসল ছবিটি আপনার কম্পিউটারেই রাখুন, পরে আবার সিলেক্ট করার জন্য।
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>বাতিল</Button>
            <Button onClick={confirmSaveProject} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  সেভ হচ্ছে...
                </>
              ) : (
                'সেভ করুন'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

