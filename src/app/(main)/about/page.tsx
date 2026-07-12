import type { Metadata } from "next";
import { AboutClient } from "./about-client";

export const metadata: Metadata = {
  title: "About Us — GenZ",
  description: "India's trusted B2C manufacturing and innovation platform, founded to connect talent with opportunity.",
};

export default function AboutPage() {
  return (
    <main className="flex-1 bg-cream-paper font-sans text-ink-black antialiased">
      <AboutClient />
    </main>
  );
}
