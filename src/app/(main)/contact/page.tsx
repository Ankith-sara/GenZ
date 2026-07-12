import { Mail, MapPin, Camera, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

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
    icon: Phone,
    label: "Phone",
    value: "+91 77948 93768",
    href: "tel:+917794893768",
  },
  {
    icon: Camera,
    label: "Instagram",
    value: "@genzonline.in",
    href: "https://www.instagram.com/genzonline.in",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "India",
    href: undefined,
  },
];

export default async function ContactPage() {
  return (
    <main className="flex-1 bg-cream-paper font-sans text-ink-black antialiased">
      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-6 sm:grid-cols-2 sm:px-12">
          <div>
            <span className="text-caption font-graphik uppercase tracking-[0.2em] text-smoke block mb-4">
              Get in Touch
            </span>
            <div className="bg-gold-yellow mb-5 h-[3px] w-12" />
            <h1 className="font-nantes text-4xl sm:text-6xl font-normal leading-[1.1] tracking-tight text-ink-black">
              Let&apos;s talk.
            </h1>
            <p className="text-charcoal mt-6 max-w-md text-body font-graphik leading-relaxed">
              Manufacturer partnership, investment, press, or just a question —
              we&apos;d love to hear from you.
            </p>

            <ul className="mt-12 space-y-6">
              {CHANNELS.map((c) => {
                const Icon = c.icon;
                const content = (
                  <span className="flex items-center gap-4">
                    <span className="border border-ash bg-pure-white flex h-11 w-11 shrink-0 items-center justify-center rounded-none text-ink-black">
                      <Icon className="h-4 w-4 text-forest-green" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="text-smoke block text-[10px] uppercase tracking-wider font-graphik font-medium">
                        {c.label}
                      </span>
                      <span className="block text-sm font-graphik text-charcoal">{c.value}</span>
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
                        className="hover:underline underline-offset-4 decoration-gold-yellow decoration-2 block w-fit"
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

          <div className="bg-pure-white border border-ash p-8 sm:p-10 rounded-none">
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
