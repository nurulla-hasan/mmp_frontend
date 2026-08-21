import {
  CheckCircle2,
  Compass,
  Layers,
  MapPin,
  PenLine,
  Ruler,
  Scaling,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

import { SectionWrapper } from "@/components/common/section-wrapper";
import { Button } from "@/components/ui/button";

const heroStats = [
  { value: "৫০০+", label: "ভেরিফায়েড সার্ভেয়ার", icon: Users },
  { value: "১০,০০০+", label: "মৌজা দাগ পরিমাপ", icon: Ruler },
  { value: "৬৪ জেলা", label: "সারাদেশে সেবা", icon: MapPin },
  { value: "১০০%", label: "ডিজিটাল স্কেলিং", icon: ShieldCheck },
];

const heroBenefits = [
  { title: "এলাকাভিত্তিক সার্ভেয়ার", icon: MapPin },
  { title: "ডিজিটাল ল্যান্ড টুলস", icon: Layers },
  { title: "ম্যাপ ট্রেস ও তুলনা", icon: Compass },
];

export function HeroSection() {
  return (
    <div className="relative overflow-hidden w-full min-h-[calc(100dvh-4.5rem)] flex flex-col justify-between">
      {/* Background ambient glow effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 h-160 w-160 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/15 blur-[130px]" />
        <div className="absolute bottom-10 left-0 h-160 w-160 translate-y-1/3 -translate-x-1/3 rounded-full bg-primary/10 blur-[110px]" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-chart-1/5 blur-[100px]" />
      </div>

      <SectionWrapper
        id="hero"
        asSection
        padding="none"
        className="w-full flex-1 flex flex-col justify-center py-10 sm:py-14 lg:py-16"
      >
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center xl:gap-16 min-w-0">
          {/* ─── Left Hero Content ────────────────────────────────── */}
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary shadow-2xs backdrop-blur-xs">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <span>বাংলাদেশের প্রথম পূর্ণাঙ্গ ডিজিটাল মৌজা ও ভূমি প্ল্যাটফর্ম</span>
            </div>

            <h1 className="mt-5 font-heading text-3xl leading-[1.2] font-semibold tracking-tight sm:text-4xl lg:text-5xl xl:text-[3.5rem]">
              জমির সীমানা ও পরিমাপ নিয়ে
              <br />
              <span className="text-primary">থাকুন সম্পূর্ণ নিশ্চিন্ত</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              অভিজ্ঞ সার্ভেয়ার খুঁজুন এবং আধুনিক ডিজিটাল টুল দিয়ে মৌজা ম্যাপের দাগ
              পরিমাপ, C.S ও B.S ম্যাপ তুলনা এবং ভেক্টর ট্রেসিং করুন নির্ভুলভাবে।
            </p>

            {/* CTA Buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <Button
                size="lg"
                className="gap-2 shadow-lg shadow-primary/20"
                nativeButton={false}
                render={<Link href="/surveyors" />}
              >
                <MapPin className="size-4" />
                সার্ভেয়ার খুঁজুন
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-border/80 bg-background/80 backdrop-blur-xs hover:bg-muted"
                nativeButton={false}
                render={<Link href="/tools" />}
              >
                <Ruler className="size-4" />
                জমির টুল ব্যবহার করুন
              </Button>
            </div>

            {/* Key Value Pills */}
            <div className="mt-8 flex flex-wrap gap-2.5 sm:gap-3">
              {heroBenefits.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-2 rounded-xl border border-border/80 bg-card/70 px-3 py-2 text-xs sm:text-sm text-muted-foreground shadow-2xs backdrop-blur-sm"
                >
                  <item.icon className="size-4 shrink-0 text-primary" />
                  <span>{item.title}</span>
                </div>
              ))}
            </div>

            {/* Trust Sub-text */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-primary" />
                <span>C.S, S.A, R.S ও B.S স্কেল সমর্থিত</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-primary" />
                <span>শতক, কাঠা ও বিঘা হিসাব</span>
              </div>
              <Link
                href="/join-as-surveyor"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                সার্ভেয়ার হিসেবে যোগ দিন &rarr;
              </Link>
            </div>
          </div>

          {/* ─── Right Hero Interactive Showcase ─────────────────── */}
          <div className="relative mx-auto w-full min-w-0 max-w-lg lg:max-w-none lg:pr-14 xl:pr-20">
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-primary/10 blur-2xl" />

            {/* Primary Tool: Clean Canvas Plot Measurement Mockup */}
            <Link
              href="/tools/land-measurement"
              className="group relative block w-full min-w-0 focus:outline-hidden"
            >
              <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-2xl ring-1 ring-primary/15 backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:ring-primary/30 group-hover:shadow-primary/10">
                <div className="relative aspect-4/3 sm:aspect-16/11 min-h-72 sm:min-h-88 w-full overflow-hidden bg-muted/10">
                  {/* Grid Pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[24px_24px] opacity-40" />

                  {/* Top Floating Header Pill inside Canvas */}
                  <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-10 flex items-center gap-1.5 sm:gap-2 rounded-xl border border-border/80 bg-background/90 px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-sm backdrop-blur-md">
                    <span className="flex size-2 shrink-0 rounded-full bg-primary animate-pulse" />
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold">
                      <Ruler className="size-3 sm:size-3.5 text-primary shrink-0" />
                      <span className="font-heading truncate">মৌজা জমি পরিমাপ</span>
                    </div>
                    <span className="hidden sm:inline-block text-[10px] text-muted-foreground border-l pl-2">
                      ১৬″ = ১ মাইল
                    </span>
                  </div>

                  {/* Cadastral & Plot SVG */}
                  <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 400 300"
                    aria-hidden="true"
                  >
                    {/* Surrounding cadastral plot lines */}
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.8"
                      className="text-muted-foreground/30"
                    >
                      <path d="M 0 45 L 105 32 L 210 52 L 310 24 L 400 48" />
                      <path d="M 0 115 L 88 105 L 170 122 L 280 102 L 400 126" />
                      <path d="M 0 215 L 102 195 L 195 220 L 310 198 L 400 218" />
                      <path d="M 62 0 L 72 300" strokeDasharray="3 3" />
                      <path d="M 172 0 L 162 300" strokeDasharray="3 3" />
                      <path d="M 298 0 L 312 300" strokeDasharray="3 3" />
                    </g>

                    {/* Neighboring plot numbers */}
                    <g fill="currentColor" className="text-muted-foreground/40 font-mono text-[10px]">
                      <text x="35" y="80">দাগ ৪২৬</text>
                      <text x="320" y="80">দাগ ৪২৭</text>
                      <text x="45" y="260">দাগ ৪২৯</text>
                    </g>

                    {/* Active Plot Polygon */}
                    <polygon
                      points="90,75 275,60 295,195 210,222 78,208"
                      fill="var(--color-primary)"
                      fillOpacity="0.14"
                      stroke="var(--color-primary)"
                      strokeWidth="2.4"
                      strokeLinejoin="round"
                    />

                    {/* Vertex Handle Points */}
                    {[
                      [90, 75],
                      [275, 60],
                      [295, 195],
                      [210, 222],
                      [78, 208],
                    ].map(([cx, cy]) => (
                      <g key={`${cx}-${cy}`}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r="6.5"
                          fill="var(--color-primary)"
                          fillOpacity="0.25"
                        />
                        <circle
                          cx={cx}
                          cy={cy}
                          r="3.5"
                          fill="var(--color-background)"
                          stroke="var(--color-primary)"
                          strokeWidth="2"
                        />
                      </g>
                    ))}
                  </svg>

                  {/* HTML Overlay Badges for dynamic font-safe auto-sizing */}
                  {/* Top dimension */}
                  <div className="pointer-events-none absolute top-[15%] left-[46%] -translate-x-1/2">
                    <span className="inline-flex items-center rounded-md border border-border/80 bg-background/95 px-2 sm:px-2.5 py-0.5 text-[9.5px] sm:text-[10px] font-mono font-medium text-foreground shadow-2xs backdrop-blur-xs">
                      ১২০ ফুট
                    </span>
                  </div>

                  {/* Right dimension */}
                  <div className="pointer-events-none absolute top-[42%] right-[14%] sm:right-[16%]">
                    <span className="inline-flex items-center rounded-md border border-border/80 bg-background/95 px-2 sm:px-2.5 py-0.5 text-[9.5px] sm:text-[10px] font-mono font-medium text-foreground shadow-2xs backdrop-blur-xs">
                      ৮০ ফুট
                    </span>
                  </div>

                  {/* Bottom dimension */}
                  <div className="pointer-events-none absolute bottom-[22%] left-[36%] -translate-x-1/2">
                    <span className="inline-flex items-center rounded-md border border-border/80 bg-background/95 px-2 sm:px-2.5 py-0.5 text-[9.5px] sm:text-[10px] font-mono font-medium text-foreground shadow-2xs backdrop-blur-xs">
                      ১১৫ ফুট
                    </span>
                  </div>

                  {/* Left dimension */}
                  <div className="pointer-events-none absolute top-[46%] left-[8%] sm:left-[10%]">
                    <span className="inline-flex items-center rounded-md border border-border/80 bg-background/95 px-2 sm:px-2.5 py-0.5 text-[9.5px] sm:text-[10px] font-mono font-medium text-foreground shadow-2xs backdrop-blur-xs">
                      ৭৫ ফুট
                    </span>
                  </div>

                  {/* Center Plot Tag */}
                  <div className="pointer-events-none absolute top-[43%] left-[46%] -translate-x-1/2 -translate-y-1/2">
                    <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-medium text-primary shadow-2xs backdrop-blur-xs">
                      দাগ নং ৪২৮
                    </span>
                  </div>

                  {/* Floating Area Calculation Badge */}
                  <div className="absolute bottom-2.5 left-2.5 sm:bottom-3.5 sm:left-3.5 z-10">
                    <div className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-primary/25 bg-background/95 px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-lg backdrop-blur-md">
                      <div className="flex size-6 sm:size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Sparkles className="size-3 sm:size-3.5" />
                      </div>
                      <div>
                        <div className="text-[8.5px] sm:text-[10px] font-medium text-muted-foreground truncate">
                          মোট জমি (দাগ ৪২৮)
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-heading text-xs sm:text-base font-bold text-primary">
                            ৪২.৭৫
                          </span>
                          <span className="text-[9px] sm:text-xs font-semibold text-primary">
                            শতাংশ
                          </span>
                          <span className="hidden text-[10px] text-muted-foreground sm:inline">
                            • ২.৫৮ কাঠা
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Zoom Controls */}
                  <div className="absolute right-2.5 bottom-2.5 sm:right-3.5 sm:bottom-3.5 z-10 flex flex-col overflow-hidden rounded-lg border bg-background/90 shadow-xs backdrop-blur-sm">
                    <span className="flex size-5.5 sm:size-6.5 items-center justify-center text-xs font-semibold hover:bg-muted transition-colors">
                      +
                    </span>
                    <span className="flex size-5.5 sm:size-6.5 items-center justify-center border-t text-xs font-semibold hover:bg-muted transition-colors">
                      −
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Supporting Tools: Floating on Desktop, Clean Grid on Mobile */}
            <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:gap-3 lg:mt-0 min-w-0">
              {/* Satellite Tool 1: Pantagraph */}
              <Link
                href="/tools/pantagraph"
                className="group block min-w-0 lg:absolute lg:-top-6 lg:-right-8 xl:-right-10 lg:w-48 xl:w-52 z-20"
              >
                <div className="flex flex-col gap-1.5 sm:gap-2 rounded-xl border border-border/80 bg-card/95 p-2.5 sm:p-3 shadow-xl ring-1 ring-primary/15 backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:ring-primary/30 group-hover:shadow-primary/10 min-w-0">
                  <div className="flex items-center justify-between gap-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold truncate min-w-0">
                      <Scaling className="size-3.5 shrink-0 text-primary" />
                      <span className="font-heading truncate">ম্যাপ তুলনা</span>
                    </div>
                    <span className="shrink-0 rounded bg-primary/10 px-1 py-0.5 text-[8.5px] sm:text-[9px] font-semibold text-primary">
                      C.S ⇄ B.S
                    </span>
                  </div>

                  <div className="relative h-16 sm:h-20 overflow-hidden rounded-lg border bg-muted/15">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[10px_10px] opacity-30" />
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 60" aria-hidden="true">
                      {/* Former map polygon */}
                      <polygon
                        points="15,14 62,8 78,44 26,52"
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth="1.8"
                      />
                      {/* Current map polygon */}
                      <polygon
                        points="22,12 68,18 64,52 18,40"
                        fill="var(--color-primary)"
                        fillOpacity="0.08"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeDasharray="3 2"
                        className="text-muted-foreground"
                      />
                      {/* Match Point Pins */}
                      <circle cx="22" cy="12" r="2" fill="var(--color-primary)" />
                      <circle cx="68" cy="18" r="2" fill="var(--color-primary)" />
                    </svg>
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground truncate">
                    সাবেক ও হাল মিলান
                  </p>
                </div>
              </Link>

              {/* Satellite Tool 2: Map Tracer */}
              <Link
                href="/tools/tracer"
                className="group block min-w-0 lg:absolute lg:-bottom-6 lg:-right-6 xl:-right-8 lg:w-48 xl:w-52 z-20"
              >
                <div className="flex flex-col gap-1.5 sm:gap-2 rounded-xl border border-border/80 bg-card/95 p-2.5 sm:p-3 shadow-xl ring-1 ring-primary/15 backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:ring-primary/30 group-hover:shadow-primary/10 min-w-0">
                  <div className="flex items-center justify-between gap-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold truncate min-w-0">
                      <PenLine className="size-3.5 shrink-0 text-primary" />
                      <span className="font-heading truncate">ম্যাপ ট্রেসার</span>
                    </div>
                    <span className="size-2 shrink-0 rounded-full bg-primary animate-pulse" />
                  </div>

                  <div className="relative h-16 sm:h-20 overflow-hidden rounded-lg border bg-muted/15">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[10px_10px] opacity-30" />
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 60" aria-hidden="true">
                      {/* Traced polygon */}
                      <polygon
                        points="16,38 48,14 82,24 68,48 30,52"
                        fill="var(--color-primary)"
                        fillOpacity="0.12"
                        stroke="var(--color-primary)"
                        strokeWidth="1.8"
                      />
                      {/* Active trace line */}
                      <polyline
                        points="16,38 48,14 82,24"
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth="1.2"
                        strokeDasharray="2 2"
                      />
                      <circle cx="48" cy="14" r="2.2" fill="var(--color-primary)" />
                      <circle cx="82" cy="24" r="2.2" fill="var(--color-primary)" />
                      <circle cx="68" cy="48" r="2.2" fill="var(--color-primary)" />
                    </svg>
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground truncate">
                    ভেক্টর বাউন্ডারি ট্রেস
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Bottom Stats Bar (Social Proof & Full Screen Anchor) ── */}
        <div className="mt-12 lg:mt-16 pt-8 border-t border-border/60">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {heroStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/40 px-3.5 py-3 backdrop-blur-xs transition-all hover:bg-card/70 hover:border-primary/25"
                >
                  <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4 sm:size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-[11px] sm:text-xs text-muted-foreground truncate">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}