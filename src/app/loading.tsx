import { Logo } from "@/components/common/logo";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center py-16 select-none">
      <div className="relative flex flex-col items-center">
        {/* Ambient Glow */}
        <div className="absolute -inset-4 rounded-3xl bg-linear-to-tr from-primary/20 via-yellow-500/15 to-primary/20 blur-2xl animate-pulse" />

        {/* Animated Logo Container */}
        <div className="relative flex size-20 items-center justify-center rounded-2xl border border-border/50 bg-card/80 p-3.5 shadow-xl shadow-primary/5 backdrop-blur-sm animate-pulse">
          <Logo size="lg" className="pointer-events-none" />
        </div>

        {/* Brand Name */}
        <span className="mt-4 bg-linear-to-r from-primary via-emerald-500 to-yellow-500 bg-clip-text text-lg font-bold font-heading tracking-tight text-transparent">
          মৌজা ম্যাপ প্রো
        </span>

        {/* Sleek Gradient Progress Bar */}
        <div className="mt-3.5 h-1 w-32 overflow-hidden rounded-full bg-muted/60">
          <div className="h-full w-full bg-linear-to-r from-primary via-emerald-400 to-yellow-500 animate-[shimmer_1.5s_infinite] origin-left" />
        </div>

        {/* Subtitle */}
        <p className="mt-2.5 text-xs font-medium text-muted-foreground animate-pulse">
          পেজ লোড হচ্ছে...
        </p>
      </div>
    </div>
  );
}
