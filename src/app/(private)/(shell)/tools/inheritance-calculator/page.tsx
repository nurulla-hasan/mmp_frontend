"use client";

import { useState, useMemo, useCallback } from "react";
import { Calculator, Plus, Trash2, Users, LandPlot, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageWrapper } from "@/components/ui/custom/page-wrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Partner {
  id: string;
  name: string;
  ratio: string;
}

interface UnitDef {
  label: string;
  toBase: number;
}

// ---------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------

const units: UnitDef[] = [
  { label: "শতক", toBase: 1 },
  { label: "কাঠা", toBase: 1 },
  { label: "বিঘা", toBase: 1 },
  { label: "একর", toBase: 1 },
  { label: "বর্গফুট", toBase: 1 },
  { label: "বর্গমিটার", toBase: 1 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function formatNumber(value: number): string {
  if (Number.isNaN(value) || !Number.isFinite(value)) return "০";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function formatPercent(value: number): string {
  if (Number.isNaN(value) || !Number.isFinite(value)) return "০%";
  return `${value.toFixed(2)}%`;
}

function getInitialPartners(count: number): Partner[] {
  return Array.from({ length: count }, (_, i) => ({
    id: generateId(),
    name: `ব্যক্তি ${i + 1}`,
    ratio: "1",
  }));
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function InheritanceCalculatorPage() {
  const [totalLand, setTotalLand] = useState("");
  const [unit, setUnit] = useState("শতক");
  const [partnerCount, setPartnerCount] = useState(3);
  const [partners, setPartners] = useState<Partner[]>(() => getInitialPartners(3));
  const [equalDivision, setEqualDivision] = useState(true);

  // ── Sync partner count ──────────────────────────────────────
  const handlePartnerCountChange = useCallback(
    (val: string) => {
      const count = Math.max(1, Math.min(20, Number.parseInt(val, 10) || 1));
      setPartnerCount(count);
      setPartners((prev) => {
        const updated = [...prev];
        if (count > prev.length) {
          for (let i = prev.length; i < count; i++) {
            updated.push({
              id: generateId(),
              name: `ব্যক্তি ${i + 1}`,
              ratio: equalDivision ? "1" : "1",
            });
          }
        } else {
          return updated.slice(0, count);
        }
        return updated;
      });
    },
    [equalDivision],
  );

  // ── Update a partner field ──────────────────────────────────
  const updatePartner = useCallback(
    (id: string, field: "name" | "ratio", value: string) => {
      setPartners((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
      );
    },
    [],
  );

  const removePartner = useCallback((id: string) => {
    setPartners((prev) => {
      if (prev.length <= 1) return prev;
      const updated = prev.filter((p) => p.id !== id);
      setPartnerCount(updated.length);
      return updated;
    });
  }, []);

  const addPartner = useCallback(() => {
    const newId = generateId();
    const newIndex = partners.length + 1;
    setPartners((prev) => [
      ...prev,
      { id: newId, name: `ব্যক্তি ${newIndex}`, ratio: "1" },
    ]);
    setPartnerCount(partners.length + 1);
  }, [partners.length]);

  const resetAll = useCallback(() => {
    setTotalLand("");
    setUnit("শতক");
    setPartnerCount(3);
    setPartners(getInitialPartners(3));
    setEqualDivision(true);
  }, []);

  // ── Toggle equal division ───────────────────────────────────
  const toggleEqualDivision = useCallback(() => {
    setEqualDivision((prev) => {
      const next = !prev;
      if (next) {
        setPartners((p) => p.map((pr) => ({ ...pr, ratio: "1" })));
      }
      return next;
    });
  }, []);

  // ── Calculation ─────────────────────────────────────────────
  const results = useMemo(() => {
    const total = Number.parseFloat(totalLand);
    if (Number.isNaN(total) || total <= 0) return null;

    const ratios = partners.map((p) => Number.parseFloat(p.ratio) || 0);
    const totalRatio = ratios.reduce((a, b) => a + b, 0);
    if (totalRatio <= 0) return null;

    const shares = ratios.map((r) => (r / totalRatio) * total);
    const percentages = shares.map((s) => (s / total) * 100);

    return { total, totalRatio, shares, percentages };
  }, [totalLand, partners]);

  // ── Unit label in Bengali ───────────────────────────────────
  const unitLabel = unit;

  return (
    <PageWrapper paddingSize="small">
      <div className="mx-auto max-w-2xl">
        {/* ─── Breadcrumb ──────────────────────────────────── */}
        <Link
          href="/tools"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3" />
          টুলস
        </Link>

        {/* ─── Header ──────────────────────────────────────── */}
        <div className="mt-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl font-heading">
            জমি বণ্টন ক্যালকুলেটর
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            মোট জমির পরিমাণ ও অংশীদারদের অনুপাত অনুযায়ী জমি বণ্টন করুন।
            ফলাফল দেখাবে কে কতটুকু পাবেন।
          </p>
        </div>

        {/* ─── Main Input Card ─────────────────────────────── */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="size-4 text-primary" />
              বণ্টন ইনপুট
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Total Land */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                মোট জমির পরিমাণ
              </label>
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <Input
                    type="number"
                    value={totalLand}
                    onChange={(e) => setTotalLand(e.target.value)}
                    placeholder="যেমন: ৪০"
                    className="h-10 text-base"
                  />
                </div>
                <div className="w-28 shrink-0">
                  <Select value={unit} onValueChange={(v) => v && setUnit(v)}>
                    <SelectTrigger size="lg" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u.label} value={u.label}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Partner Count & Equal Division Toggle */}
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium">
                  অংশীদার সংখ্যা
                </label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={partnerCount}
                  onChange={(e) => handlePartnerCountChange(e.target.value)}
                  className="h-10 text-base"
                />
              </div>
              <Button
                variant={equalDivision ? "default" : "outline"}
                onClick={toggleEqualDivision}
                className="h-10"
              >
                <Users className="size-4" />
                {equalDivision ? "সমান বণ্টন" : "অনুপাতিক বণ্টন"}
              </Button>
            </div>

            <Separator />

            {/* Partners */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">
                  অংশীদারদের তথ্য
                </label>
                <Button variant="outline" size="sm" onClick={addPartner}>
                  <Plus className="size-3.5" />
                  নতুন অংশীদার
                </Button>
              </div>

              <div className="space-y-2.5">
                {partners.map((partner, index) => (
                  <div
                    key={partner.id}
                    className="flex items-center gap-2"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <Input
                        value={partner.name}
                        onChange={(e) =>
                          updatePartner(partner.id, "name", e.target.value)
                        }
                        placeholder="নাম"
                        className="h-10 text-base"
                      />
                    </div>
                    {!equalDivision && (
                      <div className="w-20 shrink-0">
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          value={partner.ratio}
                          onChange={(e) =>
                            updatePartner(partner.id, "ratio", e.target.value)
                          }
                          placeholder="অনুপাত"
                          className="h-10 text-base text-center"
                        />
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePartner(partner.id)}
                      disabled={partners.length <= 1}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Results ─────────────────────────────────────── */}
        {results && (
          <Card className="mt-6 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <LandPlot className="size-4" />
                বণ্টন ফলাফল
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Summary */}
              <div className="flex flex-wrap gap-3 mb-5">
                <div className="rounded-xl bg-primary/5 border border-primary/10 px-4 py-2.5 text-center">
                  <span className="block text-xs text-muted-foreground">মোট জমি</span>
                  <span className="text-lg font-bold text-primary">
                    {formatNumber(results.total)} {unitLabel}
                  </span>
                </div>
                <div className="rounded-xl bg-primary/5 border border-primary/10 px-4 py-2.5 text-center">
                  <span className="block text-xs text-muted-foreground">অনুপাতের যোগফল</span>
                  <span className="text-lg font-bold text-primary">
                    {formatNumber(results.totalRatio)}
                  </span>
                </div>
                <div className="rounded-xl bg-primary/5 border border-primary/10 px-4 py-2.5 text-center">
                  <span className="block text-xs text-muted-foreground">মোট অংশীদার</span>
                  <span className="text-lg font-bold text-primary">
                    {partners.length}
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-xl border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-left">
                      <th className="px-4 py-2.5 font-medium text-muted-foreground">#</th>
                      <th className="px-4 py-2.5 font-medium text-muted-foreground">নাম</th>
                      {!equalDivision && (
                        <th className="px-4 py-2.5 font-medium text-muted-foreground text-center">অনুপাত</th>
                      )}
                      <th className="px-4 py-2.5 font-medium text-muted-foreground text-right">
                        প্রাপ্য ({unitLabel})
                      </th>
                      <th className="px-4 py-2.5 font-medium text-muted-foreground text-right">শতাংশ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((partner, index) => {
                      const share = results.shares[index];
                      const pct = results.percentages[index];
                      return (
                        <tr
                          key={partner.id}
                          className="border-t transition-colors hover:bg-muted/20"
                        >
                          <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                          <td className="px-4 py-3 font-medium">{partner.name}</td>
                          {!equalDivision && (
                            <td className="px-4 py-3 text-center text-muted-foreground">
                              {partner.ratio}
                            </td>
                          )}
                          <td className="px-4 py-3 text-right font-semibold">
                            {formatNumber(share)}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {formatPercent(pct)}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Total row */}
                    <tr className="border-t bg-primary/5 font-medium">
                      <td colSpan={equalDivision ? 2 : 3} className="px-4 py-3 text-muted-foreground">
                        সর্বমোট
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-primary">
                        {formatNumber(results.total)} {unitLabel}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        ১০০%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Info Section ──────────────────────────────────────── */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <LandPlot className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">
                  কিভাবে ব্যবহার করবেন
                </h3>
                <ul className="mt-2 space-y-1.5 text-sm leading-6 text-muted-foreground">
                  <li>• প্রথমে মোট জমির পরিমাণ ও একক নির্বাচন করুন।</li>
                  <li>• অংশীদার সংখ্যা সেট করুন বা সরাসরি যোগ/বিয়োগ করুন।</li>
                  <li>• &quot;সমান বণ্টন&quot; চালু থাকলে সবাই সমান পাবে। বন্ধ করলে প্রত্যেকের অনুপাত নির্ধারণ করতে পারবেন।</li>
                  <li>• অনুপাতিক বণ্টনে (যেমন ২:১:১) বড় অনুপাত বেশি জমি পাবে।</li>
                  <li>• ফলাফল টেবিলে কে কতটুকু পাচ্ছেন তা দেখাবে।</li>
                </ul>
                <p className="mt-3 text-xs text-muted-foreground/60 border-t pt-3">
                  ⚠️ দাবিত্যাগ: এই ক্যালকুলেটর শুধুমাত্র হিসাবের সুবিধার জন্য। 
                  বাস্তব জমি বণ্টনের জন্য আইনগত পরামর্শ গ্রহণ করুন।
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Reset ─────────────────────────────────────────────── */}
        {totalLand && (
          <div className="mt-6 flex justify-center">
            <Button variant="ghost" onClick={resetAll}>
              সব রিসেট করুন
            </Button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
