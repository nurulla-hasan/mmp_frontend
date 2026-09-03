"use client";

import { useState, useMemo } from "react";
import { Search, Sparkles, Filter, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommunityPostBox } from "./community-post-box";
import { CommunityPostCard } from "./community-post-card";
import { CommunitySidebarLeft } from "./community-sidebar-left";
import { CommunitySidebarRight } from "./community-sidebar-right";
import { recentQuestions, categories } from "../_data";

export function CommunityFeed() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filtered & Sorted Questions
  const filteredQuestions = useMemo(() => {
    let list = [...recentQuestions];

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.preview.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 2. Category filter
    if (activeCategory) {
      list = list.filter((item) => item.category === activeCategory);
    }

    // 3. Tag filter
    if (selectedTag) {
      list = list.filter((item) => item.tags?.includes(selectedTag));
    }

    // 4. Tab filter / sorting
    if (activeTab === "solved") {
      list = list.filter((item) => item.hasAccepted);
    } else if (activeTab === "unanswered") {
      list = list.filter((item) => item.answers === 0);
    } else if (activeTab === "trending") {
      list.sort((a, b) => b.votes + b.answers - (a.votes + a.answers));
    }

    return list;
  }, [activeTab, activeCategory, selectedTag, searchQuery]);

  const tabs = [
    { id: "all", label: "সব আলোচনা" },
    { id: "trending", label: "জনপ্রিয়" },
    { id: "solved", label: "সমাধানকৃত" },
    { id: "unanswered", label: "অনুত্তর" },
  ];

  const clearFilters = () => {
    setActiveCategory(null);
    setSelectedTag(null);
    setSearchQuery("");
  };

  const hasActiveFilters = Boolean(activeCategory || selectedTag || searchQuery);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] xl:grid-cols-[250px_1fr_300px] gap-6 items-start">
      {/* ── Left Sidebar: Desktop Filters & Categories ── */}
      <aside className="hidden lg:block sticky top-20">
        <CommunitySidebarLeft
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </aside>

      {/* ── Center: Social Feed ── */}
      <main className="space-y-4 min-w-0">
        {/* Search Bar on Mobile / Desktop */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="কমিউনিটিতে প্রশ্ন, দাগ নম্বর বা বিষয় খুঁজুন..."
            className="pl-9 h-10 text-sm bg-card border-border/80 shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Create Post Prompt Box */}
        <CommunityPostBox />

        {/* Mobile Horizontal Category Pills */}
        <div className="lg:hidden overflow-x-auto pb-1 flex items-center gap-1.5 scrollbar-none">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="xs"
            onClick={() => setActiveCategory(null)}
            className="rounded-full text-xs shrink-0 cursor-pointer"
          >
            সব
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.title}
              variant={activeCategory === cat.title ? "default" : "outline"}
              size="xs"
              onClick={() =>
                setActiveCategory(activeCategory === cat.title ? null : cat.title)
              }
              className="rounded-full text-xs shrink-0 cursor-pointer"
            >
              {cat.title}
            </Button>
          ))}
        </div>

        {/* Feed Tab Bar & Active Filter Chips */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border/60 pb-2.5">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-normal transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-card text-foreground font-normal shadow-xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Filter Indicators */}
          {hasActiveFilters && (
            <div className="flex items-center gap-1.5 text-xs">
              {activeCategory && (
                <Badge variant="secondary" className="gap-1 pr-1 text-xs">
                  <span>{activeCategory}</span>
                  <button
                    type="button"
                    onClick={() => setActiveCategory(null)}
                    className="hover:text-destructive cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {selectedTag && (
                <Badge variant="secondary" className="gap-1 pr-1 text-xs">
                  <span>#{selectedTag}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTag(null)}
                    className="hover:text-destructive cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer ml-1"
              >
                মুছে ফেলুন
              </button>
            </div>
          )}
        </div>

        {/* Discussion Posts Feed List */}
        <div className="space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-border bg-card/50 p-6 space-y-2">
              <Sparkles className="size-8 mx-auto text-muted-foreground/60" />
              <p className="text-sm font-semibold text-foreground">
                কোনো প্রশ্ন খুঁজে পাওয়া যায়নি
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                অন্য কোনো শব্দ দিয়ে সার্চ করুন অথবা আপনার প্রশ্নটি নিজেই জিজ্ঞাসা করে নতুন আলোচনা শুরু করুন।
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
                  ফিল্টার রিসেট করুন
                </Button>
              )}
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <CommunityPostCard key={q.id} question={q} />
            ))
          )}
        </div>
      </main>

      {/* ── Right Sidebar: Social Widgets ── */}
      <aside className="hidden xl:block sticky top-20">
        <CommunitySidebarRight
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
        />
      </aside>
    </div>
  );
}

