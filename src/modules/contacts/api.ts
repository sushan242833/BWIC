import { getApiData } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/routes";
import type { ContactMessage } from "@/modules/contacts/types";

export const getContactMessages = (): Promise<ContactMessage[]> =>
  getApiData<ContactMessage[]>(API_ENDPOINTS.contacts.list);

export const getContactMessage = (
  id: string | number,
): Promise<ContactMessage> =>
  getApiData<ContactMessage>(API_ENDPOINTS.contacts.detail(id));
