import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  FileCheck,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";

import { getVerificationRequestById } from "@/services/verification.service";
import { SectionHeading } from "@/components/common/section-heading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, getInitials } from "@/lib/utils";

export default async function VerificationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getVerificationRequestById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const request = res.data;
  const user = request.user;
  const status = request.verificationStatus || "PENDING";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link
              href="/admin/verifications"
              className="flex items-center gap-1.5"
            />
          }
        >
          <ArrowLeft className="size-4" />
          <span>Back to Requests</span>
        </Button>
      </div>

      <SectionHeading
        title="Verification Application"
        description={`Application submission details for ${user?.name || "Surveyor"}.`}
        as="h3"
        alignment="left"
        constrain={false}
      />

      {/* 1. Header Profile Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-card border shadow-xs">
        <div className="flex items-center gap-4">
          <Avatar className="size-14 sm:size-16 border-2 border-background shrink-0">
            <AvatarImage src={user?.imageUrl} alt={user?.name || "Surveyor"} />
            <AvatarFallback>
              {getInitials(user?.name || "") || <UserRound className="size-6" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground text-lg">
                {user?.name}
              </h4>
              {status === "APPROVED" && (
                <ShieldCheck className="size-4 text-emerald-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              {request.headline || "Professional Surveyor"}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
              {user?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="size-3" />
                  {user.email}
                </span>
              )}
              {user?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="size-3" />
                  {user.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <Badge
          variant={
            status === "APPROVED"
              ? "success"
              : status === "REJECTED"
                ? "rejected"
                : "pending"
          }
          size="lg"
        >
          {status}
        </Badge>
      </div>

      {/* 2. Professional Credentials & Documents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border bg-card space-y-1.5 shadow-xs">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Clock className="size-4 text-primary" />
            Field Experience
          </span>
          <p className="text-base font-semibold text-foreground">
            {request.experienceYears || 0} Years Experience
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-card space-y-1.5 shadow-xs">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <FileCheck className="size-4 text-primary" />
            Certificate / Official Document
          </span>
          {request.certificateUrl ? (
            <a
              href={request.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <span>View Attached Document</span>
              <ExternalLink className="size-4" />
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">No document uploaded</p>
          )}
        </div>
      </div>

      {/* 3. Applicant Bio */}
      {request.bio && (
        <div className="space-y-2 p-4 rounded-xl border bg-card shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Professional Bio
          </span>
          <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
            {request.bio}
          </p>
        </div>
      )}

      {/* 4. Services Offered */}
      <div className="space-y-2 p-4 rounded-xl border bg-card shadow-xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Offered Services & Pricing
        </span>
        {request.surveyorServices && request.surveyorServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {request.surveyorServices.map((item) => (
              <div
                key={item.id || item.serviceId}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="size-4 text-primary shrink-0" />
                  <span className="font-medium text-foreground">
                    {item.service?.name || "Land Service"}
                  </span>
                </div>
                <span className="font-semibold text-primary">
                  ৳{item.startingPrice}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No specific services configured.
          </p>
        )}
      </div>

      {/* 5. Service Areas */}
      <div className="space-y-2 p-4 rounded-xl border bg-card shadow-xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Coverage Areas
        </span>
        {request.serviceAreas && request.serviceAreas.length > 0 ? (
          <div className="space-y-2.5 pt-1">
            {request.serviceAreas.map((area, idx) => (
              <div
                key={area.id || idx}
                className="p-3 rounded-lg border bg-muted/20 space-y-1.5"
              >
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <MapPin className="size-3.5 text-primary" />
                  <span>{area.district}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-5">
                  {area.upazilas && area.upazilas.length > 0 ? (
                    area.upazilas.map((u) => (
                      <span
                        key={u}
                        className="inline-block text-xs bg-background px-2 py-0.5 rounded text-muted-foreground border"
                      >
                        {u}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      All Upazilas covered
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No service areas specified.
          </p>
        )}
      </div>

      {/* 6. Admin Note */}
      {request.adminNote && (
        <div className="p-4 rounded-xl border bg-amber-500/10 border-amber-500/20 text-xs space-y-1">
          <span className="font-semibold text-amber-700 dark:text-amber-400">
            Admin Note:
          </span>
          <p className="text-foreground/90">{request.adminNote}</p>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Application submitted on {formatDate(request.createdAt || "")}
      </div>
    </div>
  );
}
