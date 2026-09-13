import type { Metadata } from "next";
import "./globals.css";
import { AnalyticsConsent } from "@/components/AnalyticsConsent";

export const metadata: Metadata = {
  title: "SabaiB - Split Bills Together",
  description: "A simple bill-splitting app. Create a bill and share with friends to settle easily.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <AnalyticsConsent />
      </body>
    </html>
  );
}
