import { DashboardPage } from "@/components/shared/dashboard-page";
import { PublicPage } from "@/components/shared/public-page";

export function formatRouteValue(value: string) {
  return decodeURIComponent(value).replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function PublicDynamicPage({ label, value, description }: { label: string; value: string; description: string }) {
  const formatted = formatRouteValue(value);
  return (
    <PublicPage
      eyebrow={label}
      title={formatted}
      description={description}
      cards={[
        { title: "Overview", description: `Placeholder overview for ${formatted}.`, href: "#" },
        { title: "Related information", description: "Supporting content will be connected here later.", href: "#" },
      ]}
    />
  );
}

export function DashboardDynamicPage({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <DashboardPage
      title={`${label}: ${formatRouteValue(value)}`}
      description={description}
      showBack
      cards={[
        { label: "Status", value: "Placeholder", description: "Live status will appear after backend integration." },
        { label: "Activity", description: "A timeline and related records will appear here." },
      ]}
    />
  );
}
