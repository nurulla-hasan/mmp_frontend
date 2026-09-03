"use client";

import { Image as ImageIcon, MessageSquarePlus, Tag } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { AskQuestionModal } from "./ask-question-modal";

export function CommunityPostBox() {
  return (
    <Card className="border-border/80 shadow-sm bg-card overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 shrink-0 border border-border">
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
              ইউ
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <AskQuestionModal
              customTrigger={
                <button
                  type="button"
                  className="w-full text-left px-4 py-2.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground text-sm transition-colors border border-border/50 cursor-pointer"
                >
                  জমির পরিমাপ, খতিয়ান বা মৌজা ম্যাপ নিয়ে কিছু জানতে চান? এখানে লিখুন...
                </button>
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
          <AskQuestionModal
            customTrigger={
              <button
                type="button"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-muted/70 hover:text-foreground transition-colors cursor-pointer"
              >
                <ImageIcon className="size-4 text-emerald-600" />
                <span>ছবি / ম্যাপ</span>
              </button>
            }
          />
          <AskQuestionModal
            customTrigger={
              <button
                type="button"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-muted/70 hover:text-foreground transition-colors cursor-pointer"
              >
                <Tag className="size-4 text-sky-600" />
                <span>টপিক ট্যাগ</span>
              </button>
            }
          />
          <AskQuestionModal
            customTrigger={
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors cursor-pointer"
              >
                <MessageSquarePlus className="size-4" />
                <span>প্রশ্ন জিজ্ঞাসা করুন</span>
              </button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

