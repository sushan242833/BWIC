import Link from "next/link";
import React from "react";
import { APP_ROUTES } from "@/config/routes";

const HERO_BACKGROUND_IMAGE = "/images/hero_section.png";

const HeroSection: React.FC = () => {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-[#faf8ff]"
    >
      <div className="relative min-h-[720px] sm:min-h-[780px] lg:min-h-[921px]">
        <div className="absolute inset-0">
          <img
            src={HERO_BACKGROUND_IMAGE}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,248,255,0.98)_0%,rgba(250,248,255,0.94)_26%,rgba(250,248,255,0.72)_48%,rgba(250,248,255,0.18)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(167,224,218,0.4)_0%,rgba(250,248,255,0)_34%)]" />
          <div className="absolute inset-x-0 bottom-0 h-52 bg-[linear-gradient(180deg,rgba(250,248,255,0)_0%,#faf8ff_100%)]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[720px] sm:min-h-[780px] lg:min-h-[921px] max-w-7xl items-center px-6 py-16 sm:px-8 lg:px-10">
          <div className="max-w-[680px]">
            <h1
              id="hero-heading"
              className="font-auth-headline text-[clamp(3.5rem,7vw,5.75rem)] font-extrabold leading-[0.94] tracking-[-0.05em] text-[#131b2e]"
            >
              <span className="block">Unlock High-Yield</span>
              <span className="block bg-blue-700 bg-clip-text text-transparent">
                Real Estate
              </span>
              <span className="block">Investments in</span>
              <span className="block">Nepal</span>
            </h1>

            <p className="mt-8 max-w-[760px] font-auth-body text-lg leading-[1.5] text-[#434655] sm:text-xl md:text-[1.55rem] md:leading-[1.45]">
              Data-driven insights and verified opportunities for savvy
              investors. Experience the next generation of institutional-grade
              property acquisition.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Link
                href={APP_ROUTES.properties}
                className="inline-flex font-auth-body min-h-16 items-center justify-center rounded-2xl bg-blue-700 px-10 py-4 text-sm font-extrabold uppercase tracking-[0.12em] text-white hover:bg-blue-600"
              >
                Explore Properties
              </Link>

              <Link
                href={APP_ROUTES.recommendations}
                className="inline-flex min-h-16 items-center justify-center rounded-2xl border-2 border-[#c3c6d7] bg-white/30 px-10 py-4 font-auth-body text-sm font-extrabold uppercase tracking-[0.12em] text-[#004ac6]  hover:bg-white/55"
              >
                Get Recommendations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
