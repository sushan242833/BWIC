export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  investmentRange: string;
  propertyType: string;
  message?: string | null;
  createdAt: string;
  updatedAt: string;
}
