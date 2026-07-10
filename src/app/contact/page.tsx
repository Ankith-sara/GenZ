import { Mail, MapPin, Camera, Link2 } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { getUserAndProfile } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import { MainHeader } from "@/components/main-header";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Contact — GenZ",
  description:
    "Get in touch with GenZ — manufacturer partnerships, investors, press, or general questions.",
};

const CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: "genz.official.hq@gmail.com",
    href: "mailto:genz.official.hq@gmail.com",
  },
  {
    icon: Link2,
    label: "LinkedIn",
    value: "linkedin.com/company/genz",
    href: "https://linkedin.com/company/genz",
  },
  {
    icon: Camera,
    label: "Instagram",
    value: "@genz.india",
    href: "https://instagram.com/genz.india",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "India",
    href: undefined,
  },
];

export default async function ContactPage() {
  const session = await getUserAndProfile();
  const isLoggedIn = !!session;
  const role = session?.profile?.role;

  return (
    <div className="bg-background flex min-h-screen flex-col font-sans">
      <MainHeader
        isLoggedIn={isLoggedIn}
        role={role}
        userName={session?.profile?.full_name || session?.email}
        signOutAction={signOut}
      />

      <main className="flex-1">
        <section className="py-20 sm:py-24 bg-background">
          <div className="mx-auto grid max-w-7xl gap-14 px-6 sm:grid-cols-2 sm:px-12">
            <div>
              <p className="text-smoke eyebrow mb-3">Get in Touch</p>
              <div className="bg-chartreuse-lime mb-4 h-[3px] w-12" />
              <h1 className="font-serif text-4xl leading-[1.2] sm:text-6xl text-foreground font-normal tracking-normal">
                Let&apos;s talk.
              </h1>
              <p className="text-charcoal mt-6 max-w-md text-lg sm:text-xl font-sans font-normal leading-relaxed tracking-wide">
                Manufacturer partnership, investment, press, or just a question —
                we&apos;d love to hear from you.
              </p>

              <ul className="mt-12 space-y-6">
                {CHANNELS.map((c) => {
                  const Icon = c.icon;
                  const content = (
                    <span className="flex items-center gap-4">
                      <span className="border-ash bg-paper-white flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-foreground shadow-none">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="text-smoke block text-xs uppercase tracking-wider font-sans">
                          {c.label}
                        </span>
                        <span className="block text-sm font-sans text-charcoal">{c.value}</span>
                      </span>
                    </span>
                  );
                  return (
                    <li key={c.label}>
                      {c.href ? (
                        <a
                          href={c.href}
                          target={c.href.startsWith("http") ? "_blank" : undefined}
                          rel={
                            c.href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="hover:underline underline-offset-4 decoration-butter-highlight decoration-2"
                        >
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <ContactForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
