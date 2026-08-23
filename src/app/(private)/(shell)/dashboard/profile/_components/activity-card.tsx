import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TAuthUser } from "@/interface/auth";
import { ArrowRight, Calculator, Star } from "lucide-react";
import Link from "next/link";

export function ActivityCard({ user }: { user: TAuthUser }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>আমার কার্যক্রম</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calculator className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium">সেভ করা ক্যালকুলেশন</p>
              <p className="text-xs text-muted-foreground">
                {user.savedCalculationsCount ?? 0} টি
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/calculations" />}
          >
            দেখুন
            <ArrowRight />
          </Button>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Star className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium">পছন্দের সার্ভেয়ার</p>
              <p className="text-xs text-muted-foreground">
                {user.savedSurveyorsCount ?? 0} জন
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/surveyors" />}
          >
            দেখুন
            <ArrowRight />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
