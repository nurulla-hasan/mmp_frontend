"use client";

import Link from "next/link";
import {
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  MessageSquare,
  Users,
  Ruler,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { categories } from "../_data";

interface CommunitySidebarLeftProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
}

export function CommunitySidebarLeft({
  activeTab,
  onTabChange,
  activeCategory,
  onCategoryChange,
}: CommunitySidebarLeftProps) {
  const filterItems = [
    { id: "all", label: "সব আলোচনা", icon: MessageSquare },
    { id: "trending", label: "জনপ্রিয় প্রশ্ন", icon: TrendingUp },
    { id: "solved", label: "সমাধানকৃত", icon: CheckCircle2 },
    { id: "unanswered", label: "অনুত্তর প্রশ্ন", icon: HelpCircle },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Feed Filters */}
      <Card className="border-border/80 shadow-xs bg-card">
        <CardContent className="p-2.5 space-y-1">
          <div className="px-3 py-1.5 text-xs text-muted-foreground uppercase tracking-wider font-normal">
            ফিড ফিল্টার
          </div>
          {filterItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && activeCategory === null;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onTabChange(item.id);
                  onCategoryChange(null);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left cursor-pointer font-normal ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* 2. Categories / Topics List */}
      <Card className="border-border/80 shadow-xs bg-card">
        <CardContent className="p-2.5 space-y-1">
          <div className="flex items-center justify-between px-3 py-1.5 text-xs text-muted-foreground uppercase tracking-wider font-normal">
            <span>বিষয়ভিত্তিক ক্যাটাগরি</span>
            {activeCategory && (
              <button
                type="button"
                onClick={() => onCategoryChange(null)}
                className="text-xs text-primary hover:underline lowercase cursor-pointer font-normal"
              >
                রিসেট
              </button>
            )}
          </div>

          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.title;
            return (
              <button
                key={cat.title}
                type="button"
                onClick={() => {
                  onCategoryChange(isSelected ? null : cat.title);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs transition-colors text-left cursor-pointer font-normal ${
                  isSelected
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`size-3.5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="truncate">{cat.title}</span>
                </div>
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 shrink-0 font-normal">
                  {cat.count.replace("টি প্রশ্ন", "")}
                </Badge>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* 3. Quick Links Card */}
      <Card className="border-border/80 shadow-xs bg-card/60">
        <CardContent className="p-3 text-xs space-y-2">
          <span className="text-foreground text-xs block font-normal">
            দ্রুত সেবা
          </span>
          <div className="space-y-1">
            <Link
              href="/surveyors"
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors font-normal"
            >
              <Users className="size-3.5 text-primary" />
              <span>অভিজ্ঞ সার্ভেয়ার খুঁজুন</span>
            </Link>
            <Link
              href="/tools"
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors font-normal"
            >
              <Ruler className="size-3.5 text-primary" />
              <span>ভূমি ক্যালকুলেটর টুলস</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
