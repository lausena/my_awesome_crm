import { apiService } from './api';
import { Opportunity, OpportunityFormData, OpportunityStage, PaginatedResponse } from '../types';

export interface OpportunitiesListParams {
  page?: number;
  limit?: number;
  search?: string;
  stage?: OpportunityStage;
  assigned_to?: number;
  company?: string;
  amount_min?: number;
  amount_max?: number;
  probability_min?: number;
  probability_max?: number;
}

class OpportunityService {
  private basePath = '/api/v1/opportunities';

  async getOpportunities(params: OpportunitiesListParams = {}): Promise<PaginatedResponse<Opportunity>> {
    return apiService.get(`${this.basePath}`, { params });
  }

  async getOpportunity(id: number): Promise<Opportunity> {
    return apiService.get(`${this.basePath}/${id}`);
  }

  async createOpportunity(data: OpportunityFormData): Promise<Opportunity> {
    return apiService.post(`${this.basePath}`, data);
  }

  async updateOpportunity(id: number, data: Partial<OpportunityFormData>): Promise<Opportunity> {
    return apiService.put(`${this.basePath}/${id}`, data);
  }

  async deleteOpportunity(id: number): Promise<void> {
    return apiService.delete(`${this.basePath}/${id}`);
  }

  async updateOpportunityStage(id: number, stage: OpportunityStage): Promise<Opportunity> {
    return apiService.patch(`${this.basePath}/${id}`, { stage });
  }

  async getOpportunitiesByStage(stage: OpportunityStage): Promise<Opportunity[]> {
    const response = await apiService.get<PaginatedResponse<Opportunity>>(`${this.basePath}`, {
      params: { stage, limit: 100 }
    });
    return response.data;
  }

  async getPipelineData(): Promise<{ [key in OpportunityStage]: Opportunity[] }> {
    const stages = Object.values(OpportunityStage);
    const pipelineData: { [key in OpportunityStage]: Opportunity[] } = {} as any;

    for (const stage of stages) {
      pipelineData[stage] = await this.getOpportunitiesByStage(stage);
    }

    return pipelineData;
  }

  async getOpportunityStats(): Promise<{
    total_count: number;
    total_value: number;
    won_count: number;
    won_value: number;
    lost_count: number;
    lost_value: number;
    pipeline_value: number;
  }> {
    return apiService.get(`${this.basePath}/stats`);
  }

  async getForecast(period: 'month' | 'quarter' | 'year' = 'quarter'): Promise<{
    period: string;
    total_forecast: number;
    weighted_forecast: number;
    opportunities_count: number;
  }> {
    return apiService.get(`${this.basePath}/forecast`, { params: { period } });
  }
}

export const opportunityService = new OpportunityService();
export default opportunityService;