import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prasad Tyres",
  description: "Tyre management admin console",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={hankenGrotesk.variable}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
