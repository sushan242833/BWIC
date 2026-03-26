import {
  Building2,
  ChartPie,
  LandPlot,
  type LucideIcon,
  MapPinned,
  Rocket,
  Scale,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

type HighlightItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type TeamMember = {
  name: string;
  role: string;
  feature: string;
  image: string;
  alt: string;
};

type ServiceItem = {
  title: string;
  description: string;
  features: [string, string];
  icon: LucideIcon;
};

type LifecycleStep = {
  step: string;
  title: string;
  description: string;
};

export const highlightItems: HighlightItem[] = [
  {
    title: "Local Expertise",
    description:
      "Deep-rooted understanding of Kathmandu Valley's zoning and regional development patterns.",
    icon: MapPinned,
  },
  {
    title: "Legal Transparency",
    description:
      "Bulletproof legal vetting and title clearance processes ensuring complete confidence for your capital.",
    icon: ShieldCheck,
  },
  {
    title: "ROI Focus",
    description:
      "An aggressive strategy aimed at outperforming the traditional market through disciplined execution.",
    icon: TrendingUp,
  },
];

export const leadershipTeam: TeamMember[] = [
  {
    name: "Sushan Poudel",
    role: "Founder & Principal Investor",
    feature: "Chief Strategy Officer",
    image: "/images/image1.png",
    alt: "Professional portrait of Sushan Poudel in a charcoal suit.",
  },
  {
    name: "Sadikshya Shrestha",
    role: "Managing Partner",
    feature: "Head of Legal Affairs",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvFbpCcPugDQakqFlZj9tp2PYgyZQA4_5ZHH1bk9LuCW4yGm0e37HP3axc_PyhTskvQI7pYmJXK2oimwDMebg2MW2Hmz54xXzGUHzpgyuiPm6Bywes_ZzCpF2M_68ILCreZwe9WKnfQf9_vB7aDs6bUyDUs85unv_WLmMC3TqzLID1HsHAosSzi-RQQM0tzbLPivOOUgQxn4TqfxVRDuJ5LDWkkbRmv4tm_yjesGGiKCvNilOcLHPzOPtQIYfsCQavKvtYT8d-RVw",
    alt: "Professional portrait of Sadikshya Shrestha in a corporate setting.",
  },
  {
    name: "Bishwo Biraj Rana",
    role: "Chief Technical Officer",
    feature: "Director of Development",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAZptM5bUq_WFBeOpw_JqtvLZLXFbzJnsXYKcqOV7C0rbv57PEgZRDSzm1z1NMclPk1F3Z9LgFo5FEWmu19Eq_FQ5tIbnOM_i3GM_w_OIe2-rxVSYj7JZ8L11_3yLOd1iL9-UlDAnN8M22xE0Vgdx-UxMWe4FcVsNojhWkrEn7Er8YtVvcpwCkDPtRIZq6bxv_fbijOAS7qCqpA32oFjy1lGfMEnU05NSgYoQ4fG3rIzqIUKjhNQf_hxu8Ikp-dt3xkjouYEM6v0SI",
    alt: "Editorial portrait of Bishwo Biraj Rana with sophisticated studio lighting.",
  },
];

export const serviceItems: ServiceItem[] = [
  {
    title: "Property Investment Advisory",
    description:
      "Strategic planning and opportunity identification based on macroeconomic trends and local master plans.",
    features: ["Yield Forecasting", "Risk Assessment"],
    icon: Building2,
  },
  {
    title: "Land Acquisition Support",
    description:
      "End-to-end support in securing prime parcels with clean titles and meaningful development potential.",
    features: ["Title Verification", "Soil & Terrain Analysis"],
    icon: LandPlot,
  },
  {
    title: "Project Development Services",
    description:
      "Converting raw land into high-value residential and commercial architectural landmarks.",
    features: ["Design Coordination", "Construction Management"],
    icon: Rocket,
  },
  {
    title: "Rental Property Management",
    description:
      "Maximizing cash flow through professional tenant sourcing and disciplined asset maintenance.",
    features: ["24/7 Support", "Revenue Optimization"],
    icon: MapPinned,
  },
  {
    title: "Portfolio Diversification",
    description:
      "Balancing your holdings across different property types and geographic regions for resilient growth.",
    features: ["Asset Allocation", "Rebalancing Strategy"],
    icon: ChartPie,
  },
  {
    title: "Legal & Financial Consultation",
    description:
      "Navigating the complexities of Nepalese property laws and capital gains tax structures.",
    features: ["Tax Planning", "Compliance Audits"],
    icon: Scale,
  },
];

export const lifecycleSteps: LifecycleStep[] = [
  {
    step: "01",
    title: "Consultation",
    description:
      "Defining your financial goals, risk appetite, and investment timeline.",
  },
  {
    step: "02",
    title: "Analysis",
    description:
      "Quantitative due diligence and opportunity matching against our database.",
  },
  {
    step: "03",
    title: "Execution",
    description:
      "Legal transfer, capital deployment, and structural implementation.",
  },
  {
    step: "04",
    title: "Management",
    description:
      "Ongoing oversight, reporting, and eventual exit strategy optimization.",
  },
];
