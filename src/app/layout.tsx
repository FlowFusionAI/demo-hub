import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono, Caveat } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "Saurav KC · AI Systems for Business Operations",
  description:
    "Automation engineer. I build AI systems that handle real business operations, and you can use them live on this site. Flagship: a full-stack ATS that processed 350+ applicants and saved a clinic 15-20 hours every week.",
  openGraph: {
    title: "Saurav KC · The Operations Floor",
    description:
      "Live AI automation demos: ticket triage, RAG assistant, applicant screening. 3 systems live, 2 in build.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
