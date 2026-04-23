import { User, Workflow } from "lucide-react";
import { FaMicrosoft } from "react-icons/fa";
import { SiAnthropic, SiOpenai } from "react-icons/si";
import { cn } from "@/lib/utils";

/** Brand / agent glyphs — OpenAI & Anthropic via react-icons; Microsoft via FA; Power BI via Simple Icons CDN. */
export function AgentIcon({
  agentId,
  className,
}: {
  agentId: string;
  className?: string;
}) {
  const common = "size-4 shrink-0";

  switch (agentId) {
    case "manual":
      return (
        <User className={cn(common, "text-[#808094]", className)} aria-hidden />
      );
    case "research":
      return (
        <SiOpenai
          className={cn(common, "text-[#412991]", className)}
          aria-hidden
        />
      );
    case "analyst":
      return (
        <FaMicrosoft
          className={cn(common, "text-[#00a4ef]", className)}
          aria-hidden
        />
      );
    case "evaluator":
      return (
        <SiAnthropic
          className={cn(common, "text-[#d97757]", className)}
          aria-hidden
        />
      );
    case "poc":
      return (
        <FaMicrosoft
          className={cn(common, "text-[#7fba00]", className)}
          aria-hidden
        />
      );
    case "writer":
      return (
        <img
          src="https://cdn.simpleicons.org/powerbi/F2C811"
          alt=""
          width={16}
          height={16}
          className={cn("size-4 shrink-0", className)}
          loading="lazy"
        />
      );
    case "orchestrator":
      return (
        <Workflow
          className={cn(common, "text-[#4f4bff]", className)}
          aria-hidden
        />
      );
    default:
      return (
        <User className={cn(common, "text-[#808094]", className)} aria-hidden />
      );
  }
}
