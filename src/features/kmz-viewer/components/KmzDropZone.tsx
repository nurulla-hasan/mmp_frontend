import { useRef, useState } from "react";
import { FileUp, Layers, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onFileSelect: (file: File) => void;
  loading: boolean;
};

export default function KmzDropZone({ onFileSelect, loading }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex min-h-95 w-full max-w-lg flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
        isDragOver
          ? "border-primary bg-primary/10 scale-[1.01]"
          : "border-border/80 bg-card/75 hover:border-primary/50"
      } backdrop-blur-md shadow-2xl`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".kmz,.kml"
        className="hidden"
        onChange={handleInputChange}
      />

      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
        <UploadCloud className="size-8 animate-bounce" />
      </div>

      <h3 className="mb-1 text-lg font-bold font-heading text-foreground">
        KMZ বা KML ফাইল আপলোড করুন
      </h3>
      <p className="mb-6 max-w-sm text-xs text-muted-foreground leading-relaxed">
        Google Earth বা Mouza Geo Studio থেকে এক্সপোর্ট করা .kmz / .kml ফাইল টেনে এনে এখানে ছেড়ে দিন অথবা ব্রাউজ করুন।
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          size="default"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="gap-2"
        >
          <FileUp className="size-4" />
          <span>{loading ? "ফাইল লোড হচ্ছে…" : "ফাইল নির্বাচন করুন"}</span>
        </Button>
      </div>

      <div className="mt-8 flex items-center gap-4 text-[11px] text-muted-foreground/80">
        <div className="flex items-center gap-1.5">
          <Layers className="size-3.5 text-primary" />
          <span>Google Earth Compatible</span>
        </div>
        <div className="size-1 rounded-full bg-border" />
        <div>Free Standalone Tool</div>
      </div>
    </div>
  );
}
