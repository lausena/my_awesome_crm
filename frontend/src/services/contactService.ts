import { apiService } from './api';
import { Contact, ContactFormData, PaginatedResponse } from '../types';

export interface ContactsListParams {
  page?: number;
  limit?: number;
  search?: string;
  company?: string;
  lead_source?: string;
  is_active?: boolean;
}

class ContactService {
  private basePath = '/api/v1/contacts';

  async getContacts(params: ContactsListParams = {}): Promise<PaginatedResponse<Contact>> {
    return apiService.get(`${this.basePath}`, { params });
  }

  async getContact(id: number): Promise<Contact> {
    return apiService.get(`${this.basePath}/${id}`);
  }

  async createContact(data: ContactFormData): Promise<Contact> {
    return apiService.post(`${this.basePath}`, data);
  }

  async updateContact(id: number, data: Partial<ContactFormData>): Promise<Contact> {
    return apiService.put(`${this.basePath}/${id}`, data);
  }

  async deleteContact(id: number): Promise<void> {
    return apiService.delete(`${this.basePath}/${id}`);
  }

  async getRecentContacts(limit: number = 5): Promise<Contact[]> {
    const response = await apiService.get<PaginatedResponse<Contact>>(`${this.basePath}`, {
      params: { limit, page: 1 }
    });
    return response.data;
  }

  async searchContacts(query: string): Promise<Contact[]> {
    const response = await apiService.get<PaginatedResponse<Contact>>(`${this.basePath}`, {
      params: { search: query, limit: 50 }
    });
    return response.data;
  }
}

export const contactService = new ContactService();
export default contactService;