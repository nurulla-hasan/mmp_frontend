"use client";

import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Briefcase,
  MapPin,
  Wrench,
  Award,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/common/section-heading";
import type { TSurveyorProfile } from "@/interface/surveyor-profile";

interface ApplicationStatusViewProps {
  profile: TSurveyorProfile;
  onReapply?: () => void;
}

export function ApplicationStatusView({
  profile,
  onReapply,
}: ApplicationStatusViewProps) {
  const status = profile.verificationStatus;
  const isPending = status === "PENDING";
  const isRejected = status === "REJECTED";

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="border-b pb-5">
        <SectionHeading
          title="সার্ভেয়ার আবেদন স্ট্যাটাস"
          description="আপনার পেশাগত সার্ভেয়ার আবেদনের বর্তমান অগ্রগতি ও বিস্তারিত বিবরণ।"
          as="h3"
          alignment="left"
          constrain={false}
        >
          <div className="flex items-center gap-2">
            {isPending && (
              <Badge variant="pending">
                <Clock className="size-3.5 animate-spin" />
                পর্যালোচনাধীন (Pending Review)
              </Badge>
            )}
            {isRejected && (
              <Badge className="gap-1.5 border-destructive/30 bg-destructive/10 text-destructive px-3 py-1 text-xs font-medium">
                <XCircle className="size-3.5" />
                প্রত্যাখ্যাত (Rejected)
              </Badge>
            )}
          </div>
        </SectionHeading>
      </div>

      {/* Main Status Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Status Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-xs space-y-5">
            {isPending && (
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Clock className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg text-foreground">
                    আপনার আবেদনটি অ্যাডমিন পর্যালোচনায় রয়েছে
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    ধন্যবাদ! আপনার সার্ভেয়ার প্রোফাইল আবেদনটি গৃহীত হয়েছে। সাধারণত ২৪-৪৮ ঘণ্টার মধ্যে আমাদের টিম আপনার তথ্য যাচাই করে প্রোফাইল অনুমোদন করে।
                  </p>
                </div>
              </div>
            )}

            {isRejected && (
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <XCircle className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg text-foreground">
                    আবেদনটি অনুমোদন করা সম্ভব হয়নি
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {profile.adminNote
                      ? `অ্যাডমিন নোট: "${profile.adminNote}"`
                      : "আপনার তথ্যে অসম্পূর্ণতা থাকার কারণে আবেদনটি গৃহীত হয়নি। সঠিক তথ্য দিয়ে পুনরায় আবেদন করতে পারেন।"}
                  </p>
                </div>
              </div>
            )}

            {/* Application Data Summary */}
            <div className="border-t pt-5 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                জমা দেওয়া তথ্যের সারসংক্ষেপ
              </h4>

              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div className="rounded-lg border bg-muted/20 p-3 space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Briefcase className="size-3 text-primary" />
                    পেশাদার শিরোনাম
                  </p>
                  <p className="font-medium text-foreground">{profile.headline}</p>
                </div>

                <div className="rounded-lg border bg-muted/20 p-3 space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Award className="size-3 text-primary" />
                    কাজের অভিজ্ঞতা
                  </p>
                  <p className="font-medium text-foreground">{profile.experienceYears} বছর</p>
                </div>
              </div>

              {profile.bio && (
                <div className="rounded-lg border bg-muted/20 p-3 space-y-1 text-sm">
                  <p className="text-xs text-muted-foreground">পরিচিতি বিবরণ (Bio)</p>
                  <p className="text-foreground/90 text-xs leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Services Submitted */}
              {profile.surveyorServices && profile.surveyorServices.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Wrench className="size-3 text-primary" />
                    নির্বাচিত সেবাসমূহ ({profile.surveyorServices.length}টি)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.surveyorServices.map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2.5 py-1 text-xs text-foreground"
                      >
                        <CheckCircle2 className="size-3 text-primary" />
                        {item.service.name} (৳ {item.startingPrice})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Areas Submitted */}
              {profile.serviceAreas && profile.serviceAreas.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="size-3 text-primary" />
                    সেবার এলাকা ({profile.serviceAreas.length}টি জেলা)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.serviceAreas.map((area) => (
                      <span
                        key={area.id}
                        className="inline-flex items-center gap-1 rounded-md border bg-muted/40 px-2.5 py-1 text-xs text-foreground"
                      >
                        📍 {area.district}
                        {area.upazilas.length > 0 && (
                          <span className="text-muted-foreground">
                            ({area.upazilas.length}টি উপজেলা)
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/" />}>
                  হোমপেজে যান
                </Button>
                <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/tools" />}>
                  ল্যান্ড টুলস ব্যবহার করুন
                </Button>
              </div>

              {isRejected && onReapply && (
                <Button size="sm" onClick={onReapply} className="gap-2">
                  <RotateCcw className="size-3.5" />
                  পুনরায় আবেদন করুন
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Verification FAQ & Next Steps (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border bg-card p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <ShieldCheck className="size-4" />
              যাচাইকরণ প্রক্রিয়া ও পরবর্তী ধাপ
            </div>

            <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-[10px]">
                  ১
                </span>
                <div>
                  <strong className="text-foreground">তথ্য যাচাই:</strong> অ্যাডমিন টিম আপনার ফোন নম্বর, অভিজ্ঞতা ও সার্ভিস এলাকা যাচাই করবেন।
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-[10px]">
                  ২
                </span>
                <div>
                  <strong className="text-foreground">অনুমোদন ও রোল আপডেট:</strong> অনুমোদন পাওয়ার সাথে সাথে আপনার অ্যাকাউন্টটি স্বয়ংক্রিয়ভাবে <strong>SURVEYOR</strong> রোলে উন্নীত হবে।
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-[10px]">
                  ৩
                </span>
                <div>
                  <strong className="text-foreground">পাবলিক প্রোফাইল প্রকাশ:</strong> আপনার এলাকার ক্লায়েন্টরা আপনাকে সরাসরি সার্চ ও বুকিং করতে পারবেন।
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-5 space-y-3">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
              <Sparkles className="size-4" />
              সহায়তা প্রয়োজন?
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              যেকোনো জরুরি জিজ্ঞাসা বা তথ্যের জন্য আমাদের সাপোর্ট সেন্টারে যোগাযোগ করতে পারেন।
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              nativeButton={false}
              render={<Link href="/contact" />}
            >
              যোগাযোগ পেইজে যান
              <ArrowRight className="size-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

