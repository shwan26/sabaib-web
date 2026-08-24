import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SabaiB · Split bills with friends",
  description: "Join a SabaiB bill, claim your dishes, and pay your fair share.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
