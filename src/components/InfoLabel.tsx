import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InfoLabelProps {
  text: string;
}

const InfoLabel = ({ text }: InfoLabelProps) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-4 h-4 ml-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="More info"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
        {text}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default InfoLabel;
