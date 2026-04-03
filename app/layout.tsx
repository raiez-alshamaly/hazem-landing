import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HAZEM — Interactive Identity",
  description: "An operating system representing a mind. Two worlds. One identity.",
  keywords: ["Hazem", "portfolio", "developer", "AI", "full-stack", "interactive"],
  openGraph: {
    title: "HAZEM — Interactive Identity",
    description: "An operating system representing a mind.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0B0F14" />
      </head>
      <body className="antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
