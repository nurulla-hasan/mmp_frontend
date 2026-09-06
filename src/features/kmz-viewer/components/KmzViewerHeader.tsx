import { ArrowLeft, FileUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { KmzData } from "../types";

type Props = {
  document: KmzData | null;
  loading: boolean;
  onFileSelect: (file: File) => void;
};

export default function KmzViewerHeader({
  document,
  loading,
  onFileSelect,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-border/70 bg-card/90 px-3 backdrop-blur-md">
      <input
        ref={fileInputRef}
        type="file"
        accept=".kmz,.kml"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Left side: Back button + Title & Badge + Subtitle */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Link href="/tools">
          <Button
            variant="ghost"
            size="icon"
            className="size-8.5 rounded-xl border border-border/60 bg-muted/30 text-foreground hover:bg-muted"
            aria-label="Go back to tools"
          >
            <ArrowLeft className="size-4.5" />
          </Button>
        </Link>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate font-heading text-sm sm:text-base font-bold text-foreground">
              কেএমজেড ম্যাপ ভিউয়ার
            </h1>
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] px-1.5 py-0 h-4.5 font-medium"
            >
              ফ্রি
            </Badge>
          </div>
          <p className="truncate text-[10px] sm:text-[11px] text-muted-foreground">
            {document ? document.name : "Google Earth KMZ / KML ফাইল দেখুন"}
          </p>
        </div>
      </div>

      {/* Right side: Import Button */}
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={() => fileInputRef.current?.click()}
        className="h-8.5 gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400 text-xs font-semibold px-3 shrink-0"
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <FileUp className="size-3.5" />
        )}
        <span className="hidden sm:inline">
          {document ? document.name : "Import KMZ"}
        </span>
        <span className="sm:hidden">
          {document ? "ফাইল" : "Import"}
        </span>
      </Button>
    </header>
  );
}
