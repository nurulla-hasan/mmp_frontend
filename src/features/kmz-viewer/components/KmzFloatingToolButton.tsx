import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type KmzFloatingToolButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
  mobile?: boolean;
};

export default function KmzFloatingToolButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  disabled = false,
  loading = false,
  mobile = false,
}: KmzFloatingToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant={active ? "default" : "ghost"}
            size={mobile ? "icon" : "icon-lg"}
            disabled={disabled}
            aria-busy={loading}
            onClick={loading || disabled ? undefined : onClick}
            className={active ? "" : "text-muted-foreground"}
          >
            {loading ? (
              <Loader2
                className={mobile ? "size-4 animate-spin" : "size-5 animate-spin"}
              />
            ) : (
              <Icon className={mobile ? "size-4" : "size-5"} />
            )}
          </Button>
        }
      />
      <TooltipContent side={mobile ? "top" : "left"} sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
