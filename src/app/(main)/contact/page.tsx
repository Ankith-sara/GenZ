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
    <main className="bg-cream-paper text-ink-black flex-1 font-sans antialiased">
      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-6 sm:grid-cols-2 sm:px-12">
          <div>
            <span className="text-caption font-graphik text-smoke mb-4 block tracking-[0.2em] uppercase">
              Get in Touch
            </span>
            <div className="bg-brand-yellow-dark mb-5 h-[3px] w-12" />
            <h1 className="font-nantes text-ink-black text-4xl leading-[1.1] font-normal tracking-tight sm:text-6xl">
              Let&apos;s talk.
            </h1>
            <p className="text-charcoal text-body font-graphik mt-6 max-w-md leading-relaxed">
              Manufacturer partnership, investment, press, or just a question —
              we&apos;d love to hear from you.
            </p>

            <ul className="mt-12 space-y-6">
              {CHANNELS.map((c) => {
                const Icon = c.icon;
                const content = (
                  <span className="flex items-center gap-4">
                    <span className="border-ash bg-pure-white text-ink-black flex h-11 w-11 shrink-0 items-center justify-center rounded-none border">
                      <Icon className="text-brand-yellow h-4 w-4" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="text-smoke font-graphik block text-[10px] font-medium tracking-wider uppercase">
                        {c.label}
                      </span>
                      <span className="font-graphik text-charcoal block text-sm">
                        {c.value}
                      </span>
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
                          c.href.startsWith("http") ? "noopener noreferrer" : undefined
                        }
                        className="decoration-brand-yellow-dark block w-fit decoration-2 underline-offset-4 hover:underline"
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

          <div className="bg-pure-white border-ash rounded-none border p-8 sm:p-10">
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
