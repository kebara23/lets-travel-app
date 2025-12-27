import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AWAKE OS",
  description: "High-End Hospitality Platform",
};

import { BrandingProvider } from "@/components/shared/branding-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className={cn(
        inter.className,
        "min-h-screen bg-background text-foreground selection:bg-accent/30"
      )}>
        <BrandingProvider>
          <main className="max-w-[1440px] mx-auto">
            {children}
          </main>
        </BrandingProvider>
      </body>
    </html>
  );
}

