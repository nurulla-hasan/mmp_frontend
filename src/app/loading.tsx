import Image from "next/image";

export default function PublicLoading() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden py-16 select-none">
      {/* ── Ambient Background Aurora Glows ─────────────────────── */}
      <div className="pointer-events-none absolute -top-12 size-96 rounded-full bg-linear-to-tr from-primary/20 via-emerald-500/15 to-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 size-96 rounded-full bg-linear-to-bl from-yellow-500/10 via-primary/15 to-transparent blur-3xl" />

      {/* ── Center Stage: Radar Scanner & Geodetic Compass ───────── */}
      <div className="relative flex flex-col items-center">
        {/* Sonar Expanding Waves */}
        <div className="absolute inset-0 -m-8 rounded-full border border-primary/20 animate-ping opacity-30 animation-duration-[3s]" />
        <div className="absolute inset-0 -m-16 rounded-full border border-emerald-500/15 animate-ping opacity-20 animation-duration-[3s] [animation-delay:1.5s]" />

        {/* Outer Orbiting Satellite Track */}
        <div className="relative flex size-36 items-center justify-center sm:size-40">
          {/* Geodetic Grid Crosshairs */}
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-linear-to-r from-transparent via-primary/30 to-transparent" />
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-linear-to-b from-transparent via-primary/30 to-transparent" />

          {/* Outer Dashed Compass Ring (Clockwise) */}
          <div className="absolute inset-0 rounded-full border border-dashed border-primary/40 animate-[spin_12s_linear_infinite]" />

          {/* Middle High-Tech Reverse Orbit Ring (Counter-Clockwise) */}
          <div className="absolute inset-2 rounded-full border border-emerald-500/30 animate-[spin_8s_linear_infinite_reverse]">
            {/* Satellite Beacon Dot */}
            <div className="absolute -top-1 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10B981,0_0_20px_#10B981]" />
          </div>

          {/* Inner Glowing Gradient Ring */}
          <div className="absolute inset-4 rounded-full bg-linear-to-tr from-primary/10 via-transparent to-cyan-500/10 backdrop-blur-xs" />

          {/* Central Levitation Card with Logo */}
          <div className="relative flex size-20 items-center justify-center rounded-2xl border border-primary/30 bg-card/90 p-3.5 shadow-2xl shadow-primary/20 backdrop-blur-md sm:size-22">
            {/* Corner Tech Brackets */}
            <div className="absolute top-1 left-1 size-2 border-t-2 border-l-2 border-primary/70" />
            <div className="absolute top-1 right-1 size-2 border-t-2 border-r-2 border-primary/70" />
            <div className="absolute bottom-1 left-1 size-2 border-b-2 border-l-2 border-primary/70" />
            <div className="absolute bottom-1 right-1 size-2 border-b-2 border-r-2 border-primary/70" />

            <div className="relative flex size-full items-center justify-center transition-transform hover:scale-105">
              <Image
                src="/assets/logo.png"
                alt="Mouza Map Pro"
                width={54}
                height={54}
                priority
                className="block h-auto w-auto object-contain drop-shadow-md"
              />
            </div>
          </div>
        </div>

        {/* ── Brand Typography ──────────────────────────────────── */}
        <div className="mt-6 flex flex-col items-center text-center">
          <h2 className="bg-linear-to-r from-primary via-emerald-500 to-yellow-500 bg-clip-text text-xl font-extrabold font-heading tracking-tight text-transparent sm:text-2xl">
            মৌজা ম্যাপ প্রো
          </h2>

          {/* High-Tech Dynamic Status Badge */}
          <div className="mt-3 flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1 backdrop-blur-md shadow-xs">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              ম্যাপ ডাটা ও সিস্টেম প্রস্তুত হচ্ছে...
            </span>
          </div>

          {/* Futuristic Laser Progress Beam */}
          <div className="relative mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-muted/60">
            <div className="absolute inset-y-0 left-0 w-24 rounded-full bg-linear-to-r from-transparent via-primary to-emerald-400 animate-[laser-slide_1.8s_infinite_cubic-bezier(0.4,0,0.2,1)] shadow-[0_0_12px_var(--primary)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

