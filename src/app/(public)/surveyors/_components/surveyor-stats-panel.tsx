import type { TSurveyorProfile } from "@/interface/surveyor-profile";

export function SurveyorStatsPanel({
  surveyor,
}: {
  surveyor: TSurveyorProfile;
}) {
  const stats = [
    { label: "অভিজ্ঞতা", value: `${surveyor.experienceYears} বছর` },
    { label: "কাজ সম্পন্ন", value: `${surveyor.completedRequests} টি` },
    { label: "মোট রিভিউ", value: `${surveyor.totalReviews} টি` },
  ];

  return (
    <section className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card px-4 py-5 text-center md:px-6 md:py-6"
        >
          <p className="text-lg font-bold md:text-2xl">{stat.value}</p>
          <p className="mt-1 text-xs text-muted-foreground md:text-sm">
            {stat.label}
          </p>
        </div>
      ))}
    </section>
  );
}
