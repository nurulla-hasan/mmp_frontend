'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, Ruler } from 'lucide-react';
import { useShallow } from 'zustand/shallow';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';
import {
  MOUZA_SCALE_OPTIONS,
  autoScaleSourceLabel,
  scalePxPerFtFromHint,
} from '@/features/land-measurement/utils/autoScale';

export function AutoScaleDialog() {
  const {
    image,
    selectedFile,
    autoScaleHint,
    scale,
    setScale,
    setMode,
    setCalibrationLine,
    setIsDrawing,
  } = useMapStore(
    useShallow((state) => ({
      image: state.image,
      selectedFile: state.selectedFile,
      autoScaleHint: state.autoScaleHint,
      scale: state.scale,
      setScale: state.setScale,
      setMode: state.setMode,
      setCalibrationLine: state.setCalibrationLine,
      setIsDrawing: state.setIsDrawing,
    })),
  );

  const [open, setOpen] = useState(false);
  const [selectedScale, setSelectedScale] = useState<string>('');
  const [promptedFile, setPromptedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!selectedFile || !image || scale !== null || promptedFile === selectedFile) return;

    const timer = window.setTimeout(() => {
      setPromptedFile(selectedFile);
      setSelectedScale('');
      setOpen(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [image, promptedFile, scale, selectedFile]);

  const option = useMemo(
    () => MOUZA_SCALE_OPTIONS.find((item) => String(item.inchesPerMile) === selectedScale) ?? null,
    [selectedScale],
  );

  const feetPerPixel = autoScaleHint && option
    ? option.feetPerMapInch / autoScaleHint.dpi
    : null;

  const startManualCalibration = () => {
    setOpen(false);
    setCalibrationLine([]);
    setIsDrawing(false);
    setMode('calibrating');
  };

  const applyAutoScale = () => {
    if (!autoScaleHint || !option) return;
    const nextScale = scalePxPerFtFromHint(autoScaleHint, option.feetPerMapInch);
    if (!nextScale) return;
    setScale(nextScale);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3 pr-8">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Ruler className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle>{autoScaleHint ? 'অটো স্কেল পাওয়া গেছে' : 'স্কেল যাচাই প্রয়োজন'}</DialogTitle>
              <DialogDescription>
                {autoScaleHint
                  ? 'ম্যাপের ছাপানো scale ratio বেছে নিন।'
                  : 'এই ফাইল থেকে নির্ভরযোগ্য physical DPI পাওয়া যায়নি, তাই ভুল হিসাব এড়াতে অটো স্কেল বসানো হয়নি।'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {autoScaleHint ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <p className="text-sm font-medium text-foreground">ফাইলের মাপ যাচাই হয়েছে</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {autoScaleSourceLabel(autoScaleHint.source)} থেকে effective DPI ≈ {autoScaleHint.dpi.toFixed(1)} পাওয়া গেছে।
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">ম্যাপ স্কেল</label>
              <Select value={selectedScale} onValueChange={(value) => setSelectedScale(value ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="স্কেল নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {MOUZA_SCALE_OPTIONS.map((item) => (
                    <SelectItem key={item.inchesPerMile} value={String(item.inchesPerMile)}>
                      <span className="flex flex-col">
                        <span>{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.detail}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {feetPerPixel !== null ? (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs text-muted-foreground">এই scale অনুযায়ী</p>
                <p className="mt-1 text-lg font-semibold text-primary">1px ≈ {feetPerPixel.toFixed(4)} ft</p>
              </div>
            ) : null}

            <p className="text-xs leading-relaxed text-muted-foreground">
              Original scan/PDF হলে এই হিসাব ব্যবহার করুন। WhatsApp, screenshot বা resize করা image হলে জানা দূরত্ব দিয়ে manual calibration করাই নিরাপদ।
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm leading-relaxed text-foreground">
              ম্যাপে ৬৬০ ফুট, ৩৩০ ফুট বা জানা কোনো দূরত্ব থাকলে সেই লাইনের দুই প্রান্ত ধরে স্কেল সেট করুন। WhatsApp, screenshot বা resize করা ছবিতে DPI হারিয়ে যেতে পারে।
            </div>
            <Button nativeButton={false} variant="outline" render={<Link href="/tools/scale-guide" />}>
              <BookOpen />
              স্কেল গাইড দেখুন
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={startManualCalibration}>
            ম্যানুয়াল সেট করুন
          </Button>
          {autoScaleHint ? (
            <Button onClick={applyAutoScale} disabled={!option}>
              <Check />
              এই স্কেল ব্যবহার করুন
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
