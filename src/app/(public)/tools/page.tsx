import { PublicPage } from "@/components/shared/public-page";

export default function Page() {
  return (
    <PublicPage
      title="Land Tools"
      description="Practical calculators for common land measurement, division, conversion, and inheritance planning tasks."
      cards={[
        { title: "Land Measurement", description: "Calculate rectangular, triangular, and irregular land areas.", href: "/tools/land-measurement" },
        { title: "Land Division", description: "Prepare a clear proportional land-division calculation.", href: "/tools/land-division" },
        { title: "Unit Converter", description: "Convert between decimal, katha, bigha, acre, and other units.", href: "/tools/unit-converter" },
        { title: "Inheritance Calculator", description: "Explore placeholder inheritance-based land division.", href: "/tools/inheritance-calculator" },
        { title: "Area Converter", description: "Quickly compare common land-area units.", href: "/tools/area-converter" }
      ]}
    />
  );
}
