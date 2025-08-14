import { apiService } from './api';
import { Activity, ActivityFormData, ActivityType, ActivityStatus, PaginatedResponse } from '../types';

export interface ActivitiesListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: ActivityType;
  status?: ActivityStatus;
  assigned_to?: number;
  contact_id?: number;
  opportunity_id?: number;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  overdue?: boolean;
}

class ActivityService {
  private basePath = '/api/v1/activities';

  async getActivities(params: ActivitiesListParams = {}): Promise<PaginatedResponse<Activity>> {
    return apiService.get(`${this.basePath}`, { params });
  }

  async getActivity(id: number): Promise<Activity> {
    return apiService.get(`${this.basePath}/${id}`);
  }

  async createActivity(data: ActivityFormData): Promise<Activity> {
    return apiService.post(`${this.basePath}`, data);
  }

  async updateActivity(id: number, data: Partial<ActivityFormData>): Promise<Activity> {
    return apiService.put(`${this.basePath}/${id}`, data);
  }

  async deleteActivity(id: number): Promise<void> {
    return apiService.delete(`${this.basePath}/${id}`);
  }

  async updateActivityStatus(id: number, status: ActivityStatus): Promise<Activity> {
    return apiService.patch(`${this.basePath}/${id}`, { status });
  }

  async completeActivity(id: number, notes?: string): Promise<Activity> {
    return apiService.patch(`${this.basePath}/${id}/complete`, { notes });
  }

  async getTodayActivities(): Promise<Activity[]> {
    const today = new Date().toISOString().split('T')[0];
    const response = await apiService.get<PaginatedResponse<Activity>>(`${this.basePath}`, {
      params: { due_date: today, limit: 100 }
    });
    return response.data;
  }

  async getOverdueActivities(): Promise<Activity[]> {
    const response = await apiService.get<PaginatedResponse<Activity>>(`${this.basePath}`, {
      params: { overdue: true, limit: 100 }
    });
    return response.data;
  }

  async getUpcomingActivities(days: number = 7): Promise<Activity[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days);
    
    const response = await apiService.get<PaginatedResponse<Activity>>(`${this.basePath}`, {
      params: { 
        due_date_start: startDate.toISOString().split('T')[0],
        due_date_end: endDate.toISOString().split('T')[0],
        limit: 100 
      }
    });
    return response.data;
  }

  async getActivityStats(): Promise<{
    total_count: number;
    completed_count: number;
    overdue_count: number;
    due_today_count: number;
    pending_count: number;
  }> {
    return apiService.get(`${this.basePath}/stats`);
  }

  async getContactActivities(contactId: number): Promise<Activity[]> {
    const response = await apiService.get<PaginatedResponse<Activity>>(`${this.basePath}`, {
      params: { contact_id: contactId, limit: 100 }
    });
    return response.data;
  }

  async getOpportunityActivities(opportunityId: number): Promise<Activity[]> {
    const response = await apiService.get<PaginatedResponse<Activity>>(`${this.basePath}`, {
      params: { opportunity_id: opportunityId, limit: 100 }
    });
    return response.data;
  }
}

export const activityService = new ActivityService();
export default activityService;