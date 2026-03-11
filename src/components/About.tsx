import React, { useState, useEffect } from "react";
import { teamMembers } from "../utils/TeamMembers";

const AboutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("story");

  const [activeTeamMember, setActiveTeamMember] = useState<number | null>(null);

  const tabContent = {
    story: {
      title: "Our Story",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-300 leading-relaxed">
            Established in 2024 in the heart of Kathmandu, BWIC began with a
            clear ambition: to reshape the way people invest in real estate in
            Nepal. Though we're at the beginning of our journey, our foundation
            is built on transparency, trust, and long-term vision.
          </p>
          <p className="text-lg text-slate-300 leading-relaxed">
            As a newly formed company, we are focused on building strong
            industry relationships, conducting thorough research, and crafting
            strategies that support both local growth and investor confidence.
          </p>
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-600/10 rounded-xl p-6 border border-blue-400/20">
            <h4 className="text-xl font-bold text-blue-400 mb-4">
              Our Mission
            </h4>
            <p className="text-slate-300">
              To provide accessible, secure, and future-focused real estate
              investment opportunities in Nepal — empowering individuals and
              communities through smart property ownership.
            </p>
          </div>
        </div>
      ),
    },
    approach: {
      title: "Our Approach",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-300 leading-relaxed">
            As a young firm, our approach emphasizes careful groundwork. We
            prioritize learning from Nepal’s unique real estate dynamics while
            setting up ethical and data-informed investment frameworks.
          </p>
          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "Foundation Research",
                desc: "Understanding Nepal’s property market, regulations, and investment behavior",
              },
              {
                step: "02",
                title: "Network Building",
                desc: "Forming alliances with legal experts, real estate agents, and developers",
              },
              {
                step: "03",
                title: "Platform Development",
                desc: "Designing a user-friendly system to connect investors with verified listings",
              },
              {
                step: "04",
                title: "Pilot Investments",
                desc: "Launching small-scale, transparent property investment opportunities",
              },
              {
                step: "05",
                title: "Feedback & Scaling",
                desc: "Learning from early adopters and continuously improving our offerings",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-all duration-300"
              >
                <div className="bg-blue-500 text-white font-bold text-sm px-3 py-1 rounded-full flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">
                    {item.title}
                  </h4>
                  <p className="text-slate-300 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden ">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='aboutGrid' width='20' height='20' patternUnits='userSpaceOnUse'%3e%3cpath d='m 20 0 l 0 0 0 20' fill='none' stroke='white' stroke-width='0.5'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='60' height='60' fill='url(%23aboutGrid)'/%3e%3c/svg%3e")`,
            animation: "gridFloat 20s ease-in-out infinite",
          }}
        />

        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Building Wealth Through
                <span className="block text-blue-400 animate-pulse">
                  Strategic Real Estate
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-slate-300 mb-8 leading-relaxed animate-fade-in-delayed">
                BWIC has been the trusted partner for investors seeking premium
                real estate opportunities. We combine deep market expertise with
                innovative technology to deliver exceptional returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Tabbed Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row justify-center mb-12 bg-slate-800/30 rounded-xl p-2 backdrop-blur-sm border border-slate-700/50">
              {Object.keys(tabContent).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  {tabContent[tab as keyof typeof tabContent].title}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
              <div key={activeTab} className="animate-fade-in">
                <h2 className="text-3xl font-bold text-white mb-6">
                  {tabContent[activeTab as keyof typeof tabContent].title}
                </h2>
                {tabContent[activeTab as keyof typeof tabContent].content}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Team Section */}
      <section className="py-20 bg-slate-800/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Leadership Team
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Meet the experts driving our success. Click on any team member to
              learn more about their background and achievements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className={`bg-slate-800/50 rounded-xl p-6 text-center border transition-all duration-300 cursor-pointer ${
                  activeTeamMember === index
                    ? "border-blue-400/50 scale-105 shadow-xl shadow-blue-500/20"
                    : "border-slate-700/50 hover:border-blue-400/30"
                }`}
                onClick={() =>
                  setActiveTeamMember(activeTeamMember === index ? null : index)
                }
              >
                <div
                  className={`w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 transition-transform duration-300 ${
                    activeTeamMember === index ? "scale-110 animate-pulse" : ""
                  }`}
                >
                  {member.image}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-400 font-medium mb-2">
                  {member.position}
                </p>
                <p className="text-slate-300 text-sm mb-3">
                  {member.experience}
                </p>
                <p className="text-slate-400 text-xs">{member.background}</p>
                <div className="mt-4">
                  <span className="text-blue-400 text-sm">
                    {activeTeamMember === index
                      ? "Click to close"
                      : "Click to learn more"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Team Member Details */}
          {activeTeamMember !== null && (
            <div className="bg-gradient-to-r from-blue-500/10 to-indigo-600/10 rounded-2xl p-8 border border-blue-400/20 animate-fade-in">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-4">
                  {teamMembers[activeTeamMember].name} -{" "}
                  {teamMembers[activeTeamMember].position}
                </h3>
                <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                  {teamMembers[activeTeamMember].bio}
                </p>
                <div>
                  <h4 className="text-xl font-bold text-blue-400 mb-4">
                    Key Achievements
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    {teamMembers[activeTeamMember].achievements.map(
                      (achievement, i) => (
                        <div
                          key={i}
                          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
                        >
                          <p className="text-slate-300 text-sm">
                            {achievement}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes gridFloat {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(5px, -5px) rotate(1deg);
          }
          50% {
            transform: translate(-3px, 3px) rotate(-1deg);
          }
          75% {
            transform: translate(3px, 5px) rotate(0.5deg);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }

        .animate-fade-in-delayed {
          animation: fade-in-up 1s ease-out 0.3s both;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .transition-all.duration-2000 {
          transition-duration: 2000ms;
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
