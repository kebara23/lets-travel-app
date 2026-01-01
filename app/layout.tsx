import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { BrandingProvider } from "@/components/shared/branding-provider";
import { DemoRoleSwitcher } from "@/components/shared/demo-role-switcher";

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: 'swap',
});

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "AWAKE OS | Eco-Luxury Sanctuary",
  description: "Operating System for Invisible Hospitality",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(cormorant.variable, outfit.variable, "antialiased")}>
      <body className="min-h-screen bg-awake-bone font-sans text-awake-moss selection:bg-awake-sage/20">
        <BrandingProvider>
          <DemoRoleSwitcher />
          {children}
        </BrandingProvider>
      </body>
    </html>
  );
}
