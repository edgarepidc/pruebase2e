import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tablero E2E QA",
  description: "Seguimiento de pruebas E2E ADO-EMBUS",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${dmSans.className} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
