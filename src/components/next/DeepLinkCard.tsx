import { FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeepLinkCardProps {
  title: string;
  description: string;
  href: string;
  iconColor: string;
  linkLabel?: string;
  onClick?: () => void;
}

export const DeepLinkCard = ({ title, description, href, iconColor, linkLabel, onClick }: DeepLinkCardProps) => {
  const isPlaceholder = href === "LINK NEEDED";

  const content = (
    <>
      <div className={cn("p-2 rounded-full mb-3", iconColor)}>
        <FileText className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-display uppercase text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-snug flex-grow">
        {description}
      </p>
      <div className="mt-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
        <span>{isPlaceholder ? "LINK NEEDED" : (linkLabel || "Open Doc")}</span>
        {!isPlaceholder && <ExternalLink className="w-3 h-3" />}
      </div>
    </>
  );

  if (isPlaceholder || onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left group relative flex flex-col items-start p-5 bg-card border-2 border-foreground rounded-sm ink-shadow-sm transition-transform hover:-translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${title}: ${description}${isPlaceholder ? " (Link needed)" : ""}`}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col items-start p-5 bg-card border-2 border-foreground rounded-sm ink-shadow-sm transition-transform hover:-translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`${title}: ${description} (opens in a new tab)`}
    >
      {content}
    </a>
  );
};
