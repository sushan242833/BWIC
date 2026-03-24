export const CONTACT_FORM_INITIAL_VALUES = {
  name: "",
  email: "",
  phone: "",
  investmentRange: "",
  propertyType: "",
  message: "",
} as const;

export const CONTACT_INVESTMENT_RANGE_OPTIONS = [
  { value: "1cr-2cr", label: "1Cr - 2Cr" },
  { value: "2cr-3cr", label: "2Cr - 3Cr" },
  { value: "3cr-5cr", label: "3Cr - 5Cr" },
  { value: "5cr+", label: "5Cr +" },
  { value: "10cr+", label: "10 Cr +" },
] as const;

export const CONTACT_PROPERTY_TYPE_OPTIONS = [
  { value: "residential", label: "Residential Real Estate" },
  { value: "commercial", label: "Commercial Real Estate" },
  { value: "land", label: "Land Investment" },
  { value: "development", label: "Real Estate Development Projects" },
] as const;

export const CONTACT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const CONTACT_PHONE_PATTERN = /^(\+977)?[9][6-9]\d{8}$/;

export const CONTACT_FORM_MESSAGES = {
  requiredFields: "Please fill in all required fields.",
  invalidEmail: "Please enter a valid email address.",
  invalidPhone: "Please enter a valid phone number.",
  success: "Thank you for your inquiry! We'll get back to you within 24 hours.",
  defaultError:
    "An error occurred while sending your message. Please try again later.",
  failurePrefix: "Failed to send message:",
} as const;
