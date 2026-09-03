"use client";

import Link from "next/link";
import { Award, Hash, Info, ShieldCheck, ArrowRight } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { topContributors, trendingTags } from "../_data";

interface CommunitySidebarRightProps {
  onTagSelect?: (tag: string) => void;
  selectedTag?: string | null;
}

export function CommunitySidebarRight({
  onTagSelect,
  selectedTag,
}: CommunitySidebarRightProps) {
  return (
    <div className="space-y-4">
      {/* 1. Top Contributors / Verified Surveyors */}
      <Card className="border-border/80 shadow-xs bg-card">
        <CardHeader className="p-3.5 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center justify-between text-foreground">
            <span className="flex items-center gap-1.5">
              <Award className="size-4 text-amber-500" />
              <span>শীর্ষ পরামর্শদাতা</span>
            </span>
            <Link
              href="/surveyors"
              className="text-xs font-normal text-primary hover:underline flex items-center gap-0.5"
            >
              <span>সব দেখুন</span>
              <ArrowRight className="size-3" />
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3.5 pt-1 space-y-3">
          {topContributors.slice(0, 4).map((person) => (
            <div
              key={person.name}
              className="flex items-center justify-between gap-2.5 p-1 rounded-md hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar className="size-8 shrink-0 border border-border/60">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-normal">
                    {person.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-xs text-foreground font-normal">
                      {person.name}
                    </p>
                    {person.verified && (
                      <ShieldCheck className="size-3 text-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate font-normal">
                    {person.role} &middot; {person.answers} উত্তর
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 2. Trending Hashtags */}
      <Card className="border-border/80 shadow-xs bg-card">
        <CardHeader className="p-3.5 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
            <Hash className="size-4 text-primary" />
            <span>জনপ্রিয় টপিক</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3.5 pt-1">
          <div className="flex flex-wrap gap-1.5">
            {trendingTags.map((item) => {
              const isSelected = selectedTag === item.tag;
              return (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => onTagSelect?.(isSelected ? "" : item.tag)}
                  className={`text-xs px-2.5 py-1 rounded-full font-normal transition-colors cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>#{item.tag}</span>
                  <span className="text-xs opacity-70 font-normal">({item.count})</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 3. Community Guidelines Mini Card */}
      <Card className="border-border/80 shadow-xs bg-muted/40">
        <CardContent className="p-3.5 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-foreground font-normal">
            <Info className="size-3.5 text-primary" />
            <span>কমিউনিটি নির্দেশিকা</span>
          </div>
          <ul className="space-y-1 text-xs text-muted-foreground leading-relaxed list-disc list-inside font-normal">
            <li>সদয় ও পেশাদার আচরণ বজায় রাখুন।</li>
            <li>ব্যক্তিগত ফোন বা গোপন তথ্য পোস্ট করবেন না।</li>
            <li>জমির সঠিক দাগ ও মাপ উল্লেখ করে প্রশ্ন করুন।</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
