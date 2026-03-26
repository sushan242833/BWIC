import Link from "next/link";
import { ArrowRight, Eye, Rocket } from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import {
  highlightItems,
  leadershipTeam,
  lifecycleSteps,
  serviceItems,
} from "./AboutData";

const primaryGradient = {
  background: "linear-gradient(135deg, #004ac6 0%, #4b41e1 100%)",
};

const ABOUT_HERO_BACKGROUND_IMAGE = "/images/about_hero_section.png";

function AboutPage() {
  return (
    <div className="bg-[#faf8ff] text-[#131b2e] font-auth-body selection:bg-[#dbe1ff] selection:text-[#00174b]">
      <section className="relative flex min-h-[620px] items-center overflow-hidden px-6 py-20 sm:px-8 lg:min-h-[760px] lg:px-10">
        <div className="absolute inset-0">
          <img
            src={ABOUT_HERO_BACKGROUND_IMAGE}
            alt="High-end modern architectural building in Nepal with Himalayan mountains in the background."
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#131b2e]/85 via-[#131b2e]/50 to-[#131b2e]/10" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-screen-2xl">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-[#645efb] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.24em] text-white shadow-sm">
              Excellence In Nepal
            </span>
            <h1 className="mt-6 max-w-2xl font-auth-headline text-4xl font-extrabold leading-[0.95] tracking-[-0.05em] text-white sm:text-5xl lg:text-7xl">
              Leading the Future of{" "}
              <span className="text-[#dbe1ff]">Real Estate Investment</span> in
              Nepal
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#eef0ff] sm:text-lg sm:leading-8">
              Blue Whale Investment bridges the gap between traditional Nepalese
              land ownership and high-yield architectural development through
              data-driven precision.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={APP_ROUTES.properties}
                className="inline-flex min-h-14 items-center gap-2 rounded-xl px-7 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_18px_40px_rgba(0,74,198,0.24)] transition hover:-translate-y-0.5 hover:opacity-95"
                style={primaryGradient}
              >
                Explore Properties
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#faf8ff] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-screen-2xl gap-8 md:grid-cols-2 xl:gap-10">
          <article className="rounded-[28px] border border-[#c3c6d7]/35 bg-white p-8 shadow-[0_20px_40px_rgba(19,27,46,0.06)] sm:p-10 lg:p-12">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
              style={primaryGradient}
            >
              <Rocket className="h-7 w-7" />
            </div>
            <h2 className="mt-8 font-auth-headline text-3xl font-bold text-[#131b2e]">
              Our Mission
            </h2>
            <p className="mt-5 text-base leading-8 text-[#434655] sm:text-lg">
              To democratize high-end real estate investment in Nepal by
              providing institutional-grade analysis, legal security, and
              sustainable development practices for both local and international
              investors.
            </p>
          </article>

          <article className="rounded-[28px] border border-[#c3c6d7]/35 bg-[#f2f3ff] p-8 shadow-[0_16px_32px_rgba(19,27,46,0.04)] sm:p-10 lg:p-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4b41e1] text-white">
              <Eye className="h-7 w-7" />
            </div>
            <h2 className="mt-8 font-auth-headline text-3xl font-bold text-[#131b2e]">
              Our Vision
            </h2>
            <p className="mt-5 text-base leading-8 text-[#434655] sm:text-lg">
              To become the architectural benchmark for Nepalese urban
              development, transforming the skyline through investments that
              prioritize long-term capital appreciation and social
              responsibility.
            </p>
          </article>
        </div>
      </section>

      <section className="bg-[#dfe4fb] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-screen-2xl">
          <div className="text-center">
            <h2 className="font-auth-headline text-4xl font-bold tracking-[-0.04em] text-[#131b2e] sm:text-5xl">
              The Blue Whale Advantage
            </h2>
            <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-[#004ac6]" />
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {highlightItems.map((item) => (
              <article key={item.title} className="px-4 py-3 text-center">
                <item.icon className="mx-auto h-12 w-12 text-[#004ac6]" />
                <h3 className="mt-5 font-auth-headline text-xl font-bold text-[#131b2e]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#434655]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#faf8ff] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-screen-2xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-auth-headline text-4xl font-bold tracking-[-0.04em] text-[#131b2e]">
                Built by Visionaries
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#434655]">
                Meet the architects of your investment success, combining
                decades of experience in finance, law, and urban planning.
              </p>
            </div>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {leadershipTeam.map((member) => (
              <article key={member.name} className="group">
                <div className="relative mb-6 aspect-[3/4] overflow-hidden rounded-[24px]">
                  <img
                    src={member.image}
                    alt={member.alt}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/88 p-4 shadow-lg backdrop-blur transition md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#004ac6]">
                      {member.feature}
                    </p>
                  </div>
                </div>
                <h3 className="font-auth-headline text-2xl font-bold text-[#131b2e]">
                  {member.name}
                </h3>
                <p className="mt-2 text-base text-[#434655]">{member.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f2f3ff] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-screen-2xl">
          <div className="max-w-3xl">
            <h2 className="font-auth-headline text-4xl font-bold tracking-[-0.04em] text-[#131b2e] sm:text-5xl">
              Precision Curation for High-Ticket Assets
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#434655]">
              We provide a comprehensive ecosystem of real estate services
              designed for the sophisticated investor.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {serviceItems.map((service) => (
              <article
                key={service.title}
                className="rounded-[24px] border border-[#c3c6d7]/30 bg-white p-8 shadow-[0_18px_36px_rgba(19,27,46,0.04)] transition hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(19,27,46,0.08)]"
              >
                <service.icon className="h-11 w-11 text-[#004ac6]" />
                <h3 className="mt-6 font-auth-headline text-xl font-bold text-[#131b2e]">
                  {service.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#434655]">
                  {service.description}
                </p>
                <div className="mt-6 h-px bg-[#c3c6d7]/40" />
                <ul className="mt-6 space-y-3 text-sm font-medium text-[#131b2e]">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-[#004ac6]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#faf8ff] px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-screen-2xl">
          <div className="text-center">
            <h2 className="font-auth-headline text-4xl font-bold tracking-[-0.04em] text-[#131b2e]">
              Our Investment Lifecycle
            </h2>
            <p className="mt-4 text-base text-[#434655]">
              A transparent, four-stage journey from capital to appreciation.
            </p>
          </div>

          <div className="relative mt-16">
            <div className="absolute left-0 top-8 hidden h-px w-full bg-[#c3c6d7]/60 md:block" />
            <div className="relative z-10 grid gap-10 md:grid-cols-4 md:gap-8">
              {lifecycleSteps.map((item) => (
                <article
                  key={item.step}
                  className="bg-[#faf8ff] px-4 text-center"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#faf8ff] bg-[#dbe1ff] text-sm font-extrabold tracking-[0.14em] text-[#004ac6] shadow-sm">
                    {item.step}
                  </div>
                  <h3 className="mt-6 font-auth-headline text-xl font-bold text-[#131b2e]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#434655]">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
