import Link from "next/link";
import { ArrowRight, Calculator, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TAuthUser } from "@/interface/auth";

export function ActivityCard({ user }: { user: TAuthUser }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>আমার কার্যক্রম</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-card/50 p-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calculator className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  সেভ করা ক্যালকুলেশন
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.savedCalculationsCount ?? 0} টি সংরক্ষিত
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/calculations" />}
            >
              <span>দেখুন</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border bg-card/50 p-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Star className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  পছন্দের সার্ভেয়ার
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.savedSurveyorsCount ?? 0} জন ফেভারিট
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/surveyors" />}
            >
              <span>দেখুন</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
