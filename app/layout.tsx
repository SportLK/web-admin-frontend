import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SportLK · Admin Console",
  description: "Manage SportLK members, communities, reports, and role applications.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
