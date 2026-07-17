import { Suspense } from "react";
import PantagraphClientWrapper from "./pantagraph-client-wrapper";

export default function PantagraphPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-dvh">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <PantagraphClientWrapper />
    </Suspense>
  );
}
