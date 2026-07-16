import { Suspense } from "react";
import MapCalculatorWrapper from "./map-calculator-wrapper";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[100dvh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <MapCalculatorWrapper />
    </Suspense>
  );
}
