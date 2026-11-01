import React from "react";

export function StatusPill({ children }: { children: string }) {
  return (
    <span className={`pill pill-${children.toLowerCase().replaceAll(" ", "-")}`}>
      <i />
      {children}
    </span>
  );
}
