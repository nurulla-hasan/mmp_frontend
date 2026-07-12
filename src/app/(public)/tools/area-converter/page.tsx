import { PublicPage } from "@/components/shared/public-page";

export default function Page() {
  return (
    <PublicPage
      title="Area Converter"
      description="A quick conversion workspace for decimal, katha, bigha, acre, and square units."
      cards={[
        { title: "Unit converter", description: "Open the extended unit converter.", href: "/tools/unit-converter" },
        { title: "Save calculations", description: "Access calculation history in your dashboard.", href: "/dashboard/calculations" }
      ]}
    />
  );
}
