import { PublicPage } from "@/components/shared/public-page";

export default function Page() {
  return (
    <PublicPage
      title="Unit Converter"
      description="Convert land-area values between commonly used Bangladeshi and international units."
      cards={[
        { title: "Area converter", description: "Open the focused area conversion tool.", href: "/tools/area-converter" },
        { title: "Land measurement", description: "Calculate an area before converting it.", href: "/tools/land-measurement" }
      ]}
    />
  );
}
