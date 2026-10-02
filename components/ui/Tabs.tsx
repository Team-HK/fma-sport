"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  defaultTab,
}: {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  defaultTab?: string;
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  return (
    <div>
      <div role="tablist" aria-label="Sections" className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "cursor-pointer border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div key={tab.id} role="tabpanel" hidden={active !== tab.id} className="pt-5">
          {tab.content}
        </div>
      ))}
    </div>
  );
}
