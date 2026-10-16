import React from "react";

export function Avatar({ initials, tone, small = false }: { initials: string; tone: string; small?: boolean }) {
  return <span className={`avatar avatar-${tone}${small ? " avatar-small" : ""}`}>{initials}</span>;
}
