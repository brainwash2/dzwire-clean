import type { Metadata } from "next";
import "./[locale]/globals.css"; // Points directly to your compiled stylesheet

export const metadata: Metadata = {
  title: "DzWire Terminal",
  description: "Algerian Macroeconomic & Situational Awareness Terminal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
