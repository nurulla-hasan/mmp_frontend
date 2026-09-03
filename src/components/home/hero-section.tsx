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
import { toBengaliDigits } from "@/lib/utils";

export function HeroSection({
  totalSurveyors,
  totalDistricts = 64,
}: {
  totalSurveyors?: number;
  totalDistricts?: number;
}) {
  // Ensure a realistic, credible social proof number for public visitors
  const displaySurveyorsCount =
    totalSurveyors && totalSurveyors >= 20
      ? `${toBengaliDigits(totalSurveyors)}+`
      : "৫০+";

  const heroStats = [
    {
      value: displaySurveyorsCount,
      label: "ভেরিফায়েড সার্ভেয়ার",
      icon: Users,
    },
    { value: "১০,০০০+", label: "মৌজা দাগ পরিমাপ", icon: Ruler },
    {
      value: `${toBengaliDigits(totalDistricts)} জেলা`,
      label: "সারাদেশে সেবা",
      icon: MapPin,
    },
    { value: "১০০%", label: "ডিজিটাল স্কেলিং", icon: ShieldCheck },
  ];

  const heroBenefits = [
    { title: "এলাকাভিত্তিক সার্ভেয়ার", icon: MapPin },
    { title: "ডিজিটাল ল্যান্ড টুলস", icon: Layers },
    { title: "ম্যাপ ট্রেস ও তুলনা", icon: Compass },
  ];

  return (
    <div className="relative overflow-hidden w-full min-h-[calc(100dvh-4.5rem)] flex flex-col justify-between">
      {/* Background ambient glow effects & subtle grid dots */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Subtle dot matrix overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-size-[36px_36px] opacity-[0.07]" />
        
        {/* Ambient radial blur orbs */}
        <div className="absolute -top-24 right-1/4 h-128 w-lg rounded-full bg-emerald-500/15 blur-[100px]" />
        <div className="absolute bottom-10 -left-20 h-120 w-120 rounded-full bg-teal-500/12 blur-[90px]" />
        <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/8 blur-[80px]" />
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
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/35 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary shadow-[0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-md">
              <span className="size-2 rounded-full bg-primary" />
              <span>বাংলাদেশের প্রথম পূর্ণাঙ্গ ডিজিটাল মৌজা ও ভূমি প্ল্যাটফর্ম</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-5 font-heading text-3xl leading-[1.2] font-semibold tracking-tight sm:text-4xl lg:text-5xl xl:text-[3.5rem]">
              জমির সীমানা ও পরিমাপ নিয়ে
              <br />
              <span className="bg-linear-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent drop-shadow-xs">
                থাকুন সম্পূর্ণ নিশ্চিন্ত
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              অভিজ্ঞ সার্ভেয়ার খুঁজুন এবং আধুনিক ডিজিটাল টুল দিয়ে মৌজা ম্যাপের দাগ
              পরিমাপ, C.S ও B.S ম্যাপ তুলনা এবং ভেক্টর ট্রেসিং করুন নির্ভুলভাবে।
            </p>

            {/* CTA Buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <Button
                size="lg"
                className="gap-2 bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200"
                nativeButton={false}
                render={<Link href="/surveyors" />}
              >
                <MapPin className="size-4" />
                সার্ভেয়ার খুঁজুন
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-emerald-500/35 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/60 hover:text-emerald-300 backdrop-blur-md shadow-xs hover:-translate-y-0.5 transition-all duration-200"
                nativeButton={false}
                render={<Link href="/tools" />}
              >
                <Ruler className="size-4 text-emerald-400" />
                জমির টুল ব্যবহার করুন
              </Button>
            </div>

            {/* Key Value Pills */}
            <div className="mt-8 flex flex-wrap gap-2.5 sm:gap-3">
              {heroBenefits.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-2 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md px-3.5 py-2 text-xs sm:text-sm text-foreground/90 shadow-2xs hover:border-primary/40 hover:bg-card/90 transition-all duration-200 hover:-translate-y-0.5"
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
                className="font-medium text-primary underline-offset-4 hover:underline inline-flex items-center gap-1"
              >
                সার্ভেয়ার হিসেবে যোগ দিন &rarr;
              </Link>
            </div>
          </div>

          {/* ─── Right Hero Interactive Showcase ─────────────────── */}
          <div className="relative mx-auto w-full min-w-0 max-w-lg lg:max-w-none lg:pr-14 xl:pr-20">
            {/* Subtle backlight behind canvas */}
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-linear-to-tr from-emerald-500/15 via-teal-500/10 to-transparent blur-2xl" />

            {/* Primary Tool: Clean Canvas Plot Measurement Mockup */}
            <Link
              href="/tools/land-measurement"
              className="group relative block w-full min-w-0 focus:outline-hidden"
            >
              <div className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-card/90 shadow-2xl shadow-black/40 ring-1 ring-primary/20 backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-primary/60 group-hover:ring-primary/40 group-hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)]">
                <div className="relative aspect-4/3 sm:aspect-16/11 min-h-72 sm:min-h-88 w-full overflow-hidden bg-muted/10">
                  {/* Grid Pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[24px_24px] opacity-40" />

                  {/* Top Floating Header Pill inside Canvas */}
                  <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-10 flex items-center gap-1.5 sm:gap-2 rounded-xl border border-emerald-500/30 bg-background/90 px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-md backdrop-blur-md">
                    <span className="size-2 shrink-0 rounded-full bg-primary" />
                    <div className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-foreground">
                      <Ruler className="size-3 sm:size-3.5 text-primary shrink-0" />
                      <span className="font-heading truncate">মৌজা জমি পরিমাপ</span>
                    </div>
                    <span className="hidden sm:inline-block text-xs text-muted-foreground border-l border-border/70 pl-2">
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
                    <g fill="currentColor" className="text-muted-foreground/40 font-mono text-xs">
                      <text x="35" y="80">দাগ ৪২৬</text>
                      <text x="320" y="80">দাগ ৪২৭</text>
                      <text x="45" y="260">দাগ ৪২৯</text>
                    </g>

                    {/* Active Plot Polygon with glowing gradient fill */}
                    <polygon
                      points="90,75 275,60 295,195 210,222 78,208"
                      fill="var(--color-primary)"
                      fillOpacity="0.16"
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
                          fillOpacity="0.35"
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
                    <span className="inline-flex items-center rounded-md border border-border/80 bg-background/95 px-2 sm:px-2.5 py-0.5 text-[9.5px] sm:text-xs font-mono font-medium text-foreground shadow-sm">
                      ১২০ ফুট
                    </span>
                  </div>

                  {/* Right dimension */}
                  <div className="pointer-events-none absolute top-[42%] right-[14%] sm:right-[16%]">
                    <span className="inline-flex items-center rounded-md border border-border/80 bg-background/95 px-2 sm:px-2.5 py-0.5 text-[9.5px] sm:text-xs font-mono font-medium text-foreground shadow-sm">
                      ৮০ ফুট
                    </span>
                  </div>

                  {/* Bottom dimension */}
                  <div className="pointer-events-none absolute bottom-[22%] left-[36%] -translate-x-1/2">
                    <span className="inline-flex items-center rounded-md border border-border/80 bg-background/95 px-2 sm:px-2.5 py-0.5 text-[9.5px] sm:text-xs font-mono font-medium text-foreground shadow-sm">
                      ১১৫ ফুট
                    </span>
                  </div>

                  {/* Left dimension */}
                  <div className="pointer-events-none absolute top-[46%] left-[8%] sm:left-[10%]">
                    <span className="inline-flex items-center rounded-md border border-border/80 bg-background/95 px-2 sm:px-2.5 py-0.5 text-[9.5px] sm:text-xs font-mono font-medium text-foreground shadow-sm">
                      ৭৫ ফুট
                    </span>
                  </div>

                  {/* Center Plot Tag */}
                  <div className="pointer-events-none absolute top-[43%] left-[46%] -translate-x-1/2 -translate-y-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/35 bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm">
                      <span className="size-1.5 rounded-full bg-primary" />
                      দাগ নং ৪২৮
                    </span>
                  </div>

                  {/* Floating Area Calculation Badge */}
                  <div className="absolute bottom-2.5 left-2.5 sm:bottom-3.5 sm:left-3.5 z-10">
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/35 bg-background/95 px-3 py-2 shadow-xl backdrop-blur-xl ring-1 ring-emerald-500/20">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                        <Sparkles className="size-3.5" />
                      </div>
                      <div>
                        <div className="text-[9px] sm:text-xs font-medium text-muted-foreground truncate">
                          মোট জমি (দাগ ৪২৮)
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-heading text-sm sm:text-base font-bold text-emerald-400">
                            ৪২.৭৫
                          </span>
                          <span className="text-xs sm:text-xs font-semibold text-emerald-400">
                            শতাংশ
                          </span>
                          <span className="hidden text-xs text-muted-foreground sm:inline font-mono">
                            • ২.৫৮ কাঠা
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Zoom Controls */}
                  <div className="absolute right-2.5 bottom-2.5 sm:right-3.5 sm:bottom-3.5 z-10 flex flex-col overflow-hidden rounded-lg border border-border/80 bg-background/90 shadow-sm backdrop-blur-sm">
                    <span className="flex size-6 items-center justify-center text-xs font-semibold hover:bg-muted transition-colors cursor-pointer">
                      +
                    </span>
                    <span className="flex size-6 items-center justify-center border-t border-border/70 text-xs font-semibold hover:bg-muted transition-colors cursor-pointer">
                      −
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Supporting Tools: Floating on Desktop, Clean Grid on Mobile */}
            <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:gap-3 lg:mt-0 min-w-0">
              {/* Satellite Tool 1: Pantagraph (C.S Red vs B.S Green) */}
              <Link
                href="/tools/pantagraph"
                className="group block min-w-0 lg:absolute lg:-top-6 lg:-right-8 xl:-right-10 lg:w-50 xl:w-54 z-20"
              >
                <div className="flex flex-col gap-1.5 sm:gap-2 rounded-2xl border border-emerald-500/30 bg-card/90 p-3 shadow-2xl shadow-black/40 ring-1 ring-emerald-500/20 backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-emerald-500/60 group-hover:shadow-[0_15px_30px_-10px_rgba(16,185,129,0.3)] min-w-0">
                  <div className="flex items-center justify-between gap-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold truncate min-w-0 text-foreground">
                      <Scaling className="size-3.5 shrink-0 text-emerald-400" />
                      <span className="font-heading truncate">ম্যাপ তুলনা</span>
                    </div>
                    <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[8.5px] font-semibold text-emerald-400">
                      C.S ⇄ B.S
                    </span>
                  </div>

                  <div className="relative h-18 sm:h-20 overflow-hidden rounded-xl border border-border/70 bg-muted/20">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[10px_10px] opacity-30" />
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 60" aria-hidden="true">
                      {/* Former C.S map polygon (Authentic Red) */}
                      <polygon
                        points="15,14 62,8 78,44 26,52"
                        fill="#dc2626"
                        fillOpacity="0.08"
                        stroke="#dc2626"
                        strokeWidth="1.6"
                      />
                      {/* Current B.S map polygon (Authentic Green) */}
                      <polygon
                        points="22,12 68,18 64,52 18,40"
                        fill="#16a34a"
                        fillOpacity="0.12"
                        stroke="#16a34a"
                        strokeWidth="1.8"
                        strokeDasharray="3 2"
                      />
                      {/* Match Point Pins */}
                      <circle cx="22" cy="12" r="2.2" fill="#16a34a" />
                      <circle cx="68" cy="18" r="2.2" fill="#16a34a" />
                      <circle cx="15" cy="14" r="2" fill="#dc2626" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground truncate">
                    <span>সাবেক ও হাল মিলান</span>
                    <span className="text-[9px] text-emerald-400 font-mono font-semibold">৯৮.৫% মিল</span>
                  </div>
                </div>
              </Link>

              {/* Satellite Tool 2: Map Tracer */}
              <Link
                href="/tools/tracer"
                className="group block min-w-0 lg:absolute lg:-bottom-6 lg:-right-6 xl:-right-8 lg:w-50 xl:w-54 z-20"
              >
                <div className="flex flex-col gap-1.5 sm:gap-2 rounded-2xl border border-emerald-500/30 bg-card/90 p-3 shadow-2xl shadow-black/40 ring-1 ring-emerald-500/20 backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-emerald-500/60 group-hover:shadow-[0_15px_30px_-10px_rgba(16,185,129,0.3)] min-w-0">
                  <div className="flex items-center justify-between gap-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold truncate min-w-0 text-foreground">
                      <PenLine className="size-3.5 shrink-0 text-teal-400" />
                      <span className="font-heading truncate">ম্যাপ ট্রেসার</span>
                    </div>
                    <span className="size-2 shrink-0 rounded-full bg-teal-400" />
                  </div>

                  <div className="relative h-18 sm:h-20 overflow-hidden rounded-xl border border-border/70 bg-muted/20">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[10px_10px] opacity-30" />
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 60" aria-hidden="true">
                      {/* Traced polygon */}
                      <polygon
                        points="16,38 48,14 82,24 68,48 30,52"
                        fill="var(--color-primary)"
                        fillOpacity="0.14"
                        stroke="var(--color-primary)"
                        strokeWidth="1.8"
                      />
                      {/* Active trace line with dashed guide */}
                      <polyline
                        points="16,38 48,14 82,24"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                      <circle cx="48" cy="14" r="2.2" fill="var(--color-primary)" />
                      <circle cx="82" cy="24" r="2.2" fill="var(--color-primary)" />
                      <circle cx="68" cy="48" r="2.2" fill="var(--color-primary)" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground truncate">
                    <span>ভেক্টর বাউন্ডারি ট্রেস</span>
                    <span className="text-[9px] text-teal-400 font-mono font-semibold">SVG / CAD</span>
                  </div>
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
                  className="flex items-center gap-3.5 rounded-2xl border border-border/70 bg-linear-to-b from-card/80 to-card/40 backdrop-blur-md px-4 py-3.5 shadow-sm transition-all duration-200 hover:bg-card/90 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/25 shadow-xs">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground truncate font-medium">
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