import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "CollabCanvas — Draw Together",
  description: "Real-time collaborative whiteboard for teams. Draw, sketch, and ideate together.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }} className={geistSans.variable}>
        {children}
      </body>
    </html>
  );
}
