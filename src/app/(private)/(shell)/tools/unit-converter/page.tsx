"use client";

import { useState, useMemo, useCallback } from "react";
import { ArrowLeftRight, Calculator, Ruler, Square } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { PageWrapper } from "@/components/common/page-wrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Conversion data
// ---------------------------------------------------------------------------

type UnitCategory = "area" | "length";

interface UnitDef {
  label: string;
  toBase: number; // multiply by this to get base unit (sqft / ft)
}

const areaUnits: UnitDef[] = [
  { label: "শতক", toBase: 435.6 },
  { label: "কাঠা", toBase: 720 },
  { label: "বিঘা", toBase: 14_400 },
  { label: "একর", toBase: 43_560 },
  { label: "বর্গফুট", toBase: 1 },
  { label: "বর্গমিটার", toBase: 10.764 },
  { label: "হেক্টর", toBase: 107_639 },
];

const lengthUnits: UnitDef[] = [
  { label: "ইঞ্চি", toBase: 1 / 12 },
  { label: "ফুট", toBase: 1 },
  { label: "গজ", toBase: 3 },
  { label: "মিটার", toBase: 3.28084 },
  { label: "কিলোমিটার", toBase: 3_280.84 },
  { label: "মাইল", toBase: 5_280 },
];

const categories: {
  key: UnitCategory;
  label: string;
  icon: typeof Square;
  units: UnitDef[];
}[] = [
  { key: "area", label: "জমির একক", icon: Square, units: areaUnits },
  { key: "length", label: "দৈর্ঘ্য", icon: Ruler, units: lengthUnits },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatResult(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) return value.toExponential(4);
  if (Math.abs(value) >= 100_000)
    return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
  if (Math.abs(value) >= 1_000)
    return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
  if (Math.abs(value) >= 1) return value.toFixed(4);
  if (value === 0) return "০";
  return value.toFixed(6);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function UnitConverterPage() {
  const [category, setCategory] = useState<UnitCategory>("area");
  const [fromLabel, setFromLabel] = useState("শতক");
  const [toLabel, setToLabel] = useState("বর্গফুট");
  const [value, setValue] = useState("");

  const currentUnits = useMemo(
    () => categories.find((c) => c.key === category)!.units,
    [category],
  );

  const handleCategoryChange = useCallback((cat: UnitCategory) => {
    setCategory(cat);
    const units = categories.find((c) => c.key === cat)!.units;
    setFromLabel(units[0].label);
    setToLabel(units[1].label);
    setValue("");
  }, []);

  const fromUnit = useMemo(
    () => currentUnits.find((u) => u.label === fromLabel),
    [currentUnits, fromLabel],
  );
  const toUnit = useMemo(
    () => currentUnits.find((u) => u.label === toLabel),
    [currentUnits, toLabel],
  );

  const result = useMemo(() => {
    const num = Number.parseFloat(value);
    if (!fromUnit || !toUnit || Number.isNaN(num)) return null;
    const inBase = num * fromUnit.toBase;
    return inBase / toUnit.toBase;
  }, [value, fromUnit, toUnit]);

  const handleSwap = useCallback(() => {
    setFromLabel(toLabel);
    setToLabel(fromLabel);
  }, [fromLabel, toLabel]);

  const commonConversions = useMemo(() => {
    if (!fromUnit || !toUnit || result === null) return [];
    return [1, 5, 10, 25, 50, 100].map((v) => ({
      input: v,
      output: (v * fromUnit.toBase) / toUnit.toBase,
    }));
  }, [fromUnit, toUnit, result]);

  const CategoryIcon = categories.find((c) => c.key === category)!.icon;

  return (
    <PageWrapper paddingSize="small">
      <div className="mx-auto max-w-xl">
        {/* ─── Breadcrumb ──────────────────────────────────── */}
        <Link
          href="/tools"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftRight className="size-3" />
          টুলস
        </Link>

        {/* ─── Header ──────────────────────────────────────── */}
        <div className="mt-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl font-heading">
            জমির একক রূপান্তর
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            শতক, কাঠা, বিঘা, একর, বর্গফুট, বর্গমিটার ও হেক্টরে জমির
            পরিমাণ রূপান্তর করুন।
          </p>
        </div>

        {/* ─── Category Toggle ──────────────────────────────── */}
        <div className="mt-8 flex rounded-xl border bg-card p-1 shadow-sm">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ─── Converter Card ──────────────────────────────── */}
        <div className="mt-6 rounded-2xl border bg-card shadow-sm">
          <div className="p-5 sm:p-6">
            {/* Input row */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                যে মান রূপান্তর করবেন
              </label>
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="মান লিখুন"
                    className="h-10 text-base"
                  />
                </div>
                <div className="w-32 shrink-0">
                  <Select value={fromLabel} onValueChange={(v) => v && setFromLabel(v)}>
                    <SelectTrigger size="lg" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentUnits.map((u) => (
                        <SelectItem key={u.label} value={u.label}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Swap */}
            <div className="flex justify-center py-1">
              <button
                type="button"
                onClick={handleSwap}
                className="flex size-8 items-center justify-center rounded-full border border-input text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                aria-label="একক অদলবদল"
              >
                <ArrowLeftRight className="size-4" />
              </button>
            </div>

            {/* Result row */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                রূপান্তরিত মান
              </label>
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <div
                    className={`flex h-10 items-center rounded-lg border px-3 text-base ${
                      result !== null
                        ? "border-primary/30 bg-primary/3"
                        : "border-input bg-muted/30"
                    }`}
                  >
                    {result !== null ? (
                      <span className="font-semibold tracking-tight text-foreground">
                        {formatResult(result)}{" "}
                        <span className="text-muted-foreground font-normal">
                          {toLabel}
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        ফলাফল দেখাবে
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-32 shrink-0">
                  <Select value={toLabel} onValueChange={(v) => v && setToLabel(v)}>
                    <SelectTrigger size="lg" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentUnits.map((u) => (
                        <SelectItem key={u.label} value={u.label}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* ─── Quick Reference ──────────────────────────── */}
            {result !== null && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calculator className="size-4" />
                  দ্রুত রূপান্তর
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {commonConversions.map((c) => (
                    <div
                      key={c.input}
                      className="rounded-xl border bg-card/50 px-3 py-2.5 text-center text-sm transition-colors hover:border-primary/20 hover:bg-primary/2"
                    >
                      <span className="text-muted-foreground">{c.input}</span>{" "}
                      {fromLabel}
                      <span className="block text-xs text-muted-foreground/60">
                        =
                      </span>
                      <span className="font-semibold">
                        {formatResult(c.output)}
                      </span>{" "}
                      <span className="text-muted-foreground">{toLabel}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Info Section ──────────────────────────────────────── */}
        <div className="mt-6 rounded-2xl border bg-card/50 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <CategoryIcon className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium">
                {category === "area"
                  ? "বাংলাদেশী জমির একক সম্পর্কে"
                  : "দৈর্ঘ্য পরিমাপ সম্পর্কে"}
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                {category === "area"
                  ? "বাংলাদেশে জমি পরিমাপের জন্য শতক, কাঠা, বিঘা ও একর সবচেয়ে বেশি ব্যবহৃত হয়। ১ শতক = ৪৩৫.৬ বর্গফুট, ১ কাঠা = ৭২০ বর্গফুট, ১ বিঘা = ২০ কাঠা = ১৪,৪০০ বর্গফুট এবং ১ একর = ১০০ শতক = ৪৩,৫৬০ বর্গফুট। আন্তর্জাতিক ক্ষেত্রে বর্গমিটার ও হেক্টর ব্যবহার করা হয়।"
                  : "বাংলাদেশে জমির দৈর্ঘ্য পরিমাপে ফুট ও গজ বেশি ব্যবহৃত হয়। ১ গজ = ৩ ফুট, ১ মিটার = ৩.২৮ ফুট। বড় দূরত্বের জন্য কিলোমিটার ও মাইল ব্যবহার করা হয়।"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
