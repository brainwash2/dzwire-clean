import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DzWire Terminal",
  description: "Algerian Macroeconomic & Situational Awareness Terminal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
