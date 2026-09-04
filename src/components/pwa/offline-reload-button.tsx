"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function OfflineReloadButton() {
  const [isReloading, setIsReloading] = React.useState(false);

  const handleReload = () => {
    setIsReloading(true);
    window.location.reload();
  };

  return (
    <Button
      onClick={handleReload}
      disabled={isReloading}
      className="gap-2 font-medium"
    >
      <RefreshCw
        className={`size-4 ${isReloading ? "animate-spin" : ""}`}
      />
      {isReloading ? "পুনরায় সংযোগ খোঁজা হচ্ছে..." : "পুনরায় চেষ্টা করুন"}
    </Button>
  );
}

