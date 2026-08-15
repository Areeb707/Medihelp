import type { Metadata } from "next";
import "./globals.css";
import AccessibilityOverlay from "@/components/AccessibilityOverlay";

export const metadata: Metadata = {
  title: "MediHelp AI — AI that remembers.",
  description: "Persistent AI memory for every patient — powered by Cognee Cloud",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AccessibilityOverlay />
        {children}
      </body>
    </html>
  );
}

