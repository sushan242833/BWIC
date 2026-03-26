import Link from "next/link";
import {
  ChevronDown,
  Mail,
  MapPin,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { APP_ROUTES } from "@/config/routes";
import { sendJson } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/routes";
import {
  CONTACT_EMAIL_PATTERN,
  CONTACT_FORM_INITIAL_VALUES,
  CONTACT_FORM_MESSAGES,
  CONTACT_INVESTMENT_RANGE_OPTIONS,
  CONTACT_PHONE_PATTERN,
  CONTACT_PROPERTY_TYPE_OPTIONS,
} from "@/modules/contacts/constants";
import { contactInfo } from "@/utils/ContactInformation";
import { socialMediaLinks } from "@/utils/SocialMediaLinks";

const primaryGradient = {
  background: "linear-gradient(135deg, #004ac6 0%, #4b41e1 100%)",
};

const createInitialContactFormData = () => ({
  ...CONTACT_FORM_INITIAL_VALUES,
});

const headquartersAddress = `${contactInfo.address.street}, ${contactInfo.address.city}, ${contactInfo.address.country}`;

const contactMethods: Array<{
  title: string;
  detail: string;
  supporting?: string;
  icon: LucideIcon;
}> = [
  {
    title: "Direct Line",
    detail: contactInfo.phone,
    supporting: "Private consultation desk",
    icon: Phone,
  },
  {
    title: "Email Inquiry",
    detail: contactInfo.email,
    supporting: "Response within 24 hours",
    icon: Mail,
  },
  {
    title: "Main Headquarters",
    detail: contactInfo.address.street,
    supporting: `${contactInfo.address.city}, ${contactInfo.address.country}`,
    icon: MapPin,
  },
];

const faqItems = [
  {
    question: "What is the minimum investment?",
    answer:
      "Our entry-level investment portfolios start from tailored entry points based on the asset class, while larger commercial and land opportunities are structured for higher-capital allocations.",
  },
  {
    question: "Is legal assistance provided?",
    answer:
      "Yes. Every Blue Whale engagement includes legal due diligence, document review, and transaction support to help protect your capital throughout the acquisition process.",
  },
  {
    question: "How often are portfolio reports shared?",
    answer:
      "We provide regular portfolio updates and performance reporting, with timing adjusted to the investment structure and the level of management support you choose.",
  },
];

const socialAccentClasses: Record<string, string> = {
  Twitter: "border-[#26c6da]/30 bg-[#ecfeff] text-[#0ea5a8]",
  Facebook: "border-[#4f7cff]/30 bg-[#eef2ff] text-[#3157df]",
  Instagram: "border-[#ff5c9f]/30 bg-[#fff1f7] text-[#db2777]",
};

function SocialIcon({ path }: { path: string }) {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d={path} />
    </svg>
  );
}

function ContactSection() {
  const [formData, setFormData] = useState(createInitialContactFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { name, email, phone, investmentRange, propertyType, message } =
      formData;

    if (!name.trim() || !email.trim() || !investmentRange || !propertyType) {
      alert(CONTACT_FORM_MESSAGES.requiredFields);
      return;
    }

    if (!CONTACT_EMAIL_PATTERN.test(email)) {
      alert(CONTACT_FORM_MESSAGES.invalidEmail);
      return;
    }

    if (phone && !CONTACT_PHONE_PATTERN.test(phone)) {
      alert(CONTACT_FORM_MESSAGES.invalidPhone);
      return;
    }

    setIsSubmitting(true);

    try {
      await sendJson(API_ENDPOINTS.contacts.list, {
        method: "POST",
        body: {
          name,
          email,
          phone,
          investmentRange,
          propertyType,
          message,
        },
      });

      alert(CONTACT_FORM_MESSAGES.success);
      setFormData(createInitialContactFormData());
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : CONTACT_FORM_MESSAGES.defaultError;

      alert(`${CONTACT_FORM_MESSAGES.failurePrefix} ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#faf8ff] font-auth-body text-[#131b2e] selection:bg-[#dbe1ff] selection:text-[#00174b]">
      <section className="px-6 pb-8 pt-14 sm:px-8 lg:px-10 lg:pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h1 className="font-auth-headline text-[clamp(3rem,6vw,5rem)] font-extrabold leading-[0.94] tracking-[-0.06em] text-[#131b2e]">
              Get in Touch with Our{" "}
              <span className="bg-[linear-gradient(135deg,#004ac6_0%,#4b41e1_100%)] bg-clip-text text-transparent">
                Investment Experts.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#434655] sm:text-lg">
              Connect with our specialized team for a bespoke consultation on
              premium real estate opportunities in Nepal. Your gateway to
              institutional-grade asset management starts here.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 pt-8 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-12 lg:items-start">
          <div className="space-y-12 lg:col-span-5">
            <div className="space-y-9">
              {contactMethods.map((method) => (
                <article key={method.title} className="flex items-start gap-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef0ff] text-[#004ac6] shadow-[0_8px_20px_rgba(0,74,198,0.08)]">
                    <method.icon className="h-4 w-4" />
                  </div>

                  <div>
                    <h2 className="font-auth-headline text-lg font-semibold text-[#131b2e]">
                      {method.title}
                    </h2>
                    <p className="mt-1 text-sm leading-7 text-[#131b2e]">
                      {method.detail}
                    </p>
                    {method.supporting ? (
                      <p className="text-sm leading-7 text-[#676b7c]">
                        {method.supporting}
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7a8092]">
                Connect With Us
              </p>
              <div className="mt-5 flex gap-3">
                {socialMediaLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.name}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition hover:-translate-y-0.5 ${
                      socialAccentClasses[item.name] ??
                      "border-[#c3c6d7]/40 bg-white text-[#4b41e1]"
                    }`}
                  >
                    <SocialIcon path={item.icon} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-[20px] bg-white p-6 shadow-[0_24px_60px_rgba(19,27,46,0.08)] ring-1 ring-[#d8ddf2] sm:p-8 lg:p-10">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-xs font-semibold tracking-[0.02em] text-[#434655]"
                    >
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                      className="w-full rounded-xl border border-transparent bg-[#eef0ff] px-4 py-3.5 text-sm text-[#131b2e] outline-none transition placeholder:text-[#7a8092] focus:border-[#c7d0ff] focus:ring-4 focus:ring-[#004ac6]/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-xs font-semibold tracking-[0.02em] text-[#434655]"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                      className="w-full rounded-xl border border-transparent bg-[#eef0ff] px-4 py-3.5 text-sm text-[#131b2e] outline-none transition placeholder:text-[#7a8092] focus:border-[#c7d0ff] focus:ring-4 focus:ring-[#004ac6]/10"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="propertyType"
                      className="text-xs font-semibold tracking-[0.02em] text-[#434655]"
                    >
                      Service of Interest
                    </label>
                    <div className="relative">
                      <select
                        id="propertyType"
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={handleInputChange}
                        required
                        className="w-full appearance-none rounded-xl border border-transparent bg-[#eef0ff] px-4 py-3.5 pr-11 text-sm text-[#131b2e] outline-none transition focus:border-[#c7d0ff] focus:ring-4 focus:ring-[#004ac6]/10"
                      >
                        <option value="">Select a service</option>
                        {CONTACT_PROPERTY_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7285]" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="investmentRange"
                      className="text-xs font-semibold tracking-[0.02em] text-[#434655]"
                    >
                      Investment Range
                    </label>
                    <div className="relative">
                      <select
                        id="investmentRange"
                        name="investmentRange"
                        value={formData.investmentRange}
                        onChange={handleInputChange}
                        required
                        className="w-full appearance-none rounded-xl border border-transparent bg-[#eef0ff] px-4 py-3.5 pr-11 text-sm text-[#131b2e] outline-none transition focus:border-[#c7d0ff] focus:ring-4 focus:ring-[#004ac6]/10"
                      >
                        <option value="">Select a range</option>
                        {CONTACT_INVESTMENT_RANGE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7285]" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-xs font-semibold tracking-[0.02em] text-[#434655]"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="How can we assist your investment goals?"
                    className="min-h-[160px] w-full resize-none rounded-xl border border-transparent bg-[#eef0ff] px-4 py-3.5 text-sm text-[#131b2e] outline-none transition placeholder:text-[#7a8092] focus:border-[#c7d0ff] focus:ring-4 focus:ring-[#004ac6]/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl px-6 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-white shadow-[0_16px_30px_rgba(0,74,198,0.24)] transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                  style={primaryGradient}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-3">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Sending...
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactSection;
