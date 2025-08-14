import { apiService } from './api';
import { DashboardSummary } from '../types';

class DashboardService {
  private basePath = '/api/v1/dashboard';

  async getDashboardSummary(): Promise<DashboardSummary> {
    return apiService.get(`${this.basePath}/summary`);
  }

  async getDashboardMetrics(): Promise<{
    contacts_count: number;
    leads_count: number;
    opportunities_count: number;
    activities_count: number;
    revenue_this_month: number;
    revenue_this_quarter: number;
    pipeline_value: number;
    conversion_rate: number;
  }> {
    return apiService.get(`${this.basePath}/metrics`);
  }

  async getChartData(
    type: 'revenue' | 'pipeline' | 'activities' | 'leads',
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<Array<{ date: string; value: number; label?: string }>> {
    return apiService.get(`${this.basePath}/charts/${type}`, {
      params: { period }
    });
  }

  async getRecentActivities(limit: number = 10): Promise<any[]> {
    return apiService.get(`${this.basePath}/recent-activities`, {
      params: { limit }
    });
  }

  async getTopPerformers(): Promise<{
    top_sales_reps: Array<{ name: string; revenue: number; deals: number }>;
    top_lead_sources: Array<{ source: string; count: number; conversion_rate: number }>;
    top_companies: Array<{ company: string; revenue: number; opportunities: number }>;
  }> {
    return apiService.get(`${this.basePath}/top-performers`);
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;