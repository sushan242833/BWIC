import {
  CONTACT_INVESTMENT_RANGE_OPTIONS,
  CONTACT_PROPERTY_TYPE_OPTIONS,
} from "@/modules/contacts/constants";

const propertyTypeLabelMap = new Map<string, string>(
  CONTACT_PROPERTY_TYPE_OPTIONS.map((option) => [option.value, option.label]),
);

const investmentRangeLabelMap = new Map<string, string>(
  CONTACT_INVESTMENT_RANGE_OPTIONS.map((option) => [option.value, option.label]),
);

export const formatContactDate = (value: string): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));

export const formatContactDateTime = (value: string): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export const formatPropertyType = (value: string): string =>
  propertyTypeLabelMap.get(value) ?? value;

export const formatInvestmentRange = (value: string): string =>
  investmentRangeLabelMap.get(value) ?? value;

export const buildMessagePreview = (message?: string | null): string => {
  const trimmedMessage = message?.trim();

  if (!trimmedMessage) {
    return "No additional message was included with this inquiry.";
  }

  return trimmedMessage.length > 110
    ? `${trimmedMessage.slice(0, 107)}...`
    : trimmedMessage;
};
