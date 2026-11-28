import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Site-wide metadata (issue #19)
// default: the title used when a page gives no title of its own (like the home page).
// template: pages give a short title, and "%s" is replaced with it,
// so "My Properties" becomes "My Properties | HomeBase" in the browser tab.
// openGraph: what a shared link preview shows (title, description, site name).
// No Open Graph image yet, because HomeBase has no logo or image (see issue #19).
export const metadata: Metadata = {
  title: {
    default: "HomeBase",
    template: "%s | HomeBase",
  },
  description:
    "HomeBase helps homeowners keep track of their properties and home maintenance tasks in one place.",
  applicationName: "HomeBase",
  openGraph: {
    title: "HomeBase",
    description:
      "HomeBase helps homeowners keep track of their properties and home maintenance tasks in one place.",
    siteName: "HomeBase",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
