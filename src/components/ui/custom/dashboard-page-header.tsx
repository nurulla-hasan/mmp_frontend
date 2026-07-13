
"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../button";

const DashboardPageHeader = ({
  title,
  description,
  length,
  showBack,
  rightContent,
}: {
  title: string;
  description: string;
  length?: number;
  showBack?: boolean;
  rightContent?: ReactNode;
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft />
            </Button>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <h1 className="text-lg md:text-xl uppercase tracking-wider font-medium text-primary">
                {title}
              </h1>
              {length && (
                <span className="text-sm inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary border border-primary/20">
                  {length}
                </span>
              )}
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-150 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        {rightContent && (
          <div className="flex shrink-0 items-center gap-2">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPageHeader
