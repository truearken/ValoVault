import type { Metadata } from "next";
import { Chakra_Petch, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { DataProvider } from "@/context/DataContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra-petch",
  weight: ["600", "700"],
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ValoVault - Valorant Inventory Manager",
  description: "Manage your Valorant skins and presets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-bs-theme="dark">
      <body className={`${chakraPetch.variable} ${plexMono.variable} ${plexSans.variable}`}>
        <ErrorBoundary>
          <DataProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </DataProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
