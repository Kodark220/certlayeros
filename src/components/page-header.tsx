import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export function PageHeader({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("pt-12 pb-8 px-4 sm:px-6 lg:px-8", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight animate-fade-in">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-muted-foreground text-lg animate-fade-in">
                {description}
              </p>
            )}
          </div>
          {children && <div className="animate-fade-in">{children}</div>}
        </div>
      </div>
    </div>
  );
}
