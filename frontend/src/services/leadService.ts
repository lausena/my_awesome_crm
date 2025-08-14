import { apiService } from './api';
import { Lead, LeadFormData, LeadStatus, LeadSource, PaginatedResponse } from '../types';

export interface LeadsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus;
  source?: LeadSource;
  assigned_to?: number;
  priority?: 'low' | 'medium' | 'high';
  score_min?: number;
  score_max?: number;
}

class LeadService {
  private basePath = '/api/v1/leads';

  async getLeads(params: LeadsListParams = {}): Promise<PaginatedResponse<Lead>> {
    return apiService.get(`${this.basePath}`, { params });
  }

  async getLead(id: number): Promise<Lead> {
    return apiService.get(`${this.basePath}/${id}`);
  }

  async createLead(data: LeadFormData): Promise<Lead> {
    return apiService.post(`${this.basePath}`, data);
  }

  async updateLead(id: number, data: Partial<LeadFormData>): Promise<Lead> {
    return apiService.put(`${this.basePath}/${id}`, data);
  }

  async deleteLead(id: number): Promise<void> {
    return apiService.delete(`${this.basePath}/${id}`);
  }

  async updateLeadStatus(id: number, status: LeadStatus): Promise<Lead> {
    return apiService.patch(`${this.basePath}/${id}`, { status });
  }

  async scoreLeads(): Promise<void> {
    return apiService.post(`${this.basePath}/score`);
  }

  async convertLead(id: number): Promise<{ contact_id: number; opportunity_id: number }> {
    return apiService.post(`${this.basePath}/${id}/convert`);
  }

  async getLeadsByStatus(status: LeadStatus): Promise<Lead[]> {
    const response = await apiService.get<PaginatedResponse<Lead>>(`${this.basePath}`, {
      params: { status, limit: 100 }
    });
    return response.data;
  }

  async getHighScoreLeads(minScore: number = 70): Promise<Lead[]> {
    const response = await apiService.get<PaginatedResponse<Lead>>(`${this.basePath}`, {
      params: { score_min: minScore, limit: 50 }
    });
    return response.data;
  }
}

export const leadService = new LeadService();
export default leadService;