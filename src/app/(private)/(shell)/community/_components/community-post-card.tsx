"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SuccessToast } from "@/lib/utils";
import type { Question } from "../_data";

export function CommunityPostCard({ question }: { question: Question }) {
  const [votes, setVotes] = useState(question.votes);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasVoted) {
      setVotes((v) => v - 1);
      setHasVoted(false);
    } else {
      setVotes((v) => v + 1);
      setHasVoted(true);
      SuccessToast("ভোট যুক্ত হয়েছে!");
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/community/questions/${question.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      SuccessToast("প্রশ্নের লিংক কপি করা হয়েছে!");
    }
  };

  return (
    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all duration-200 bg-card group">
      <CardContent className="p-4 sm:p-5 space-y-3">
        {/* Header: Author Info + Category */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="size-9 shrink-0 border border-border/80">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {question.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-foreground truncate">
                  {question.author}
                </span>
                {question.authorRole && (
                  <span className="text-xs px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground flex items-center gap-0.5">
                    {question.authorRole.includes("সার্ভেয়ার") && (
                      <ShieldCheck className="size-2.5 text-primary" />
                    )}
                    {question.authorRole}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {question.time}
              </span>
            </div>
          </div>

          <Badge variant="secondary" className="text-xs font-normal shrink-0">
            {question.category}
          </Badge>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <Link
            href={`/community/questions/${question.slug}`}
            className="block group-hover:text-primary transition-colors"
          >
            <h2 className="text-sm sm:text-base font-semibold leading-snug text-foreground line-clamp-2">
              {question.title}
            </h2>
          </Link>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {question.preview}
          </p>
        </div>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {question.tags.map((t) => (
              <span
                key={t}
                className="text-xs text-primary/80 hover:text-primary bg-primary/5 hover:bg-primary/10 px-2 py-0.5 rounded-full transition-colors"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Action Footer: Like/Vote, Answers, Solved status, Share */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
          <div className="flex items-center gap-2">
            {/* Upvote Button */}
            <Button
              variant={hasVoted ? "default" : "ghost"}
              size="sm"
              onClick={handleVote}
              className={`h-7 px-2.5 gap-1.5 rounded-full text-xs cursor-pointer ${
                hasVoted ? "bg-primary text-primary-foreground font-normal" : "text-muted-foreground hover:text-foreground font-normal"
              }`}
            >
              <ThumbsUp className={`size-3.5 ${hasVoted ? "fill-current" : ""}`} />
              <span>{votes}</span>
            </Button>

            {/* Answers Link */}
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={`/community/questions/${question.slug}`} />}
              className="h-7 px-2.5 gap-1.5 rounded-full text-xs font-normal text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <MessageSquare className="size-3.5" />
              <span>{question.answers} উত্তর</span>
            </Button>

            {/* Solved Status */}
            {question.hasAccepted && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="size-3" />
                <span>সমাধান হয়েছে</span>
              </span>
            )}
          </div>

          {/* Share Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleShare}
            title="লিংক কপি করুন"
            className="text-muted-foreground hover:text-foreground size-7 rounded-full cursor-pointer"
          >
            <Share2 className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
