import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type FloatingToolButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  mobile?: boolean;
};

export default function FloatingToolButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  disabled = false,
  mobile = false,
}: FloatingToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<div className="inline-flex" />}
        className="focus:outline-none focus-visible:outline-none"
      >
        <Button
          type="button"
          variant={active ? 'default' : 'ghost'}
          size={mobile ? 'icon' : 'icon-lg'}
          disabled={disabled}
          onClick={onClick}
          className={active ? '' : 'text-muted-foreground'}
        >
          <Icon className={mobile ? 'size-4' : 'size-5'} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={mobile ? 'top' : 'left'} sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
