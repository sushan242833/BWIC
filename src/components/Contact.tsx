import React, { useState } from "react";
import { contactInfo } from "../utils/ContactInformation";
import { sendJson } from "@/lib/api";

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    investmentRange: "",
    propertyType: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, phone, investmentRange, propertyType, message } =
      formData;

    // Basic required fields check
    if (!name.trim() || !email.trim() || !investmentRange || !propertyType) {
      alert("Please fill in all required fields.");
      return;
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Phone number validation (basic Nepal phone format — adjust as needed)
    const phoneRegex = /^(\+977)?[9][6-9]\d{8}$/;
    if (phone && !phoneRegex.test(phone)) {
      alert("Please enter a valid phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      await sendJson("/api/contacts", {
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

      alert(
        "Thank you for your inquiry! We'll get back to you within 24 hours.",
      );
      setFormData({
        name: "",
        email: "",
        phone: "",
        investmentRange: "",
        propertyType: "",
        message: "",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred while sending your message. Please try again later.";
      alert(`Failed to send message: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
      title: "Phone",
      details: contactInfo.phone,
      description: "Available 24/7",
      action: "Call Now",
      link: `tel:${contactInfo.phone}`,
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "Email",
      details: contactInfo.email,
      description: "Response within 24 hours",
      action: "Send Email",
      link: `mailto:${contactInfo.email}`,
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      title: "Office",
      details: contactInfo.address.street,
      description: `${contactInfo.address.city}, ${contactInfo.address.country}`,
      action: "Get Directions",
      link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${contactInfo.address.street}, ${contactInfo.address.city}, ${contactInfo.address.country}`,
      )}`,
    },
  ];

  const officeHours = [
    { day: "Sunday - Friday", hours: "9:00 AM - 7:00 PM" },
    { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
  ];

  return (
    <section className="relative py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 overflow-hidden">
      {/* Background Elements */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='contactGrid' width='20' height='20' patternUnits='userSpaceOnUse'%3e%3cpath d='m 20 0 l 0 0 0 20' fill='none' stroke='white' stroke-width='0.5'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='60' height='60' fill='url(%23contactGrid)'/%3e%3c/svg%3e")`,
        }}
      />

      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 mb-6">
            Let's Start Building Your
            <span className="block text-blue-400">Real Estate Portfolio</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Ready to explore premium investment opportunities? Our expert team
            is here to guide you through every step of your real estate
            investment journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Contact Form */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">
                Get in Touch
              </h3>
              <p className="text-slate-300">
                Fill out the form below and we'll respond within 24 hours.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                    placeholder="Ram Pandey"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                    placeholder="pram@gmail.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                    placeholder="+977 9800000000"
                  />
                </div>

                <div>
                  <label
                    htmlFor="investmentRange"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Investment Range *
                  </label>
                  <select
                    id="investmentRange"
                    name="investmentRange"
                    value={formData.investmentRange}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  >
                    <option value="">Select Range</option>
                    <option value="1cr-2cr">1Cr - 2Cr</option>
                    <option value="2cr-3cr">2Cr - 3Cr</option>
                    <option value="3cr-5cr">3Cr - 5Cr</option>
                    <option value="5cr+">5Cr +</option>
                    <option value="10cr+">10 Cr +</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="propertyType"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Property Interest *
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                >
                  <option value="">Select Property Type</option>
                  <option value="residential">Residential Real Estate</option>
                  <option value="commercial">Commercial Real Estate</option>
                  <option value="land">Land Investment</option>
                  <option value="development">
                    Real Estate Development Projects
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
                  placeholder="Tell us about your investment goals and any specific questions you have..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8 w-full">
            {/* Centered content container */}
            <div className="max-w-4xl mx-auto px-4 w-full">
              {/* Contact Methods */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {contactMethods.map((method, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800 p-6 rounded-xl shadow-md"
                  >
                    <div className="text-blue-400 mb-4">{method.icon}</div>
                    <h3 className="text-white text-lg font-semibold mb-1">
                      {method.title}
                    </h3>
                    <p className="text-slate-300 text-sm mb-1">
                      {method.details}
                    </p>
                    <p className="text-slate-400 text-sm mb-3">
                      {method.description}
                    </p>
                    <a
                      href={method.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium inline-block"
                    >
                      {method.action} →
                    </a>
                  </div>
                ))}
              </div>

              {/* Office Hours */}
              <div className="mt-8 bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/30">
                <h4 className="text-white font-semibold mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Office Hours
                </h4>
                <div className="space-y-3">
                  {officeHours.map((schedule, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-slate-300">{schedule.day}</span>
                      <span className="text-slate-200 font-medium">
                        {schedule.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
