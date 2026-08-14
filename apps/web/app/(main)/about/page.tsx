import type { Metadata } from "next";
import { AboutClient } from "./about-client";

export const metadata: Metadata = {
  title: "About Us — GenZ",
  description:
    "India's trusted B2C manufacturing and innovation platform, founded to connect talent with opportunity.",
};

export default function AboutPage() {
  return (
    <main className="bg-cream-paper text-ink-black flex-1 font-sans antialiased">
      <AboutClient />
    </main>
  );
}
