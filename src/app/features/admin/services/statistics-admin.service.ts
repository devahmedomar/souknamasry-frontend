import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  DashboardOverviewResponse,
  RevenueTrendResponse,
  SalesByCategoryResponse,
} from '../models/statistics.model';

@Injectable({
  providedIn: 'root',
})
export class StatisticsAdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}admin/statistics`;

  /**
   * Get comprehensive dashboard overview
   * GET /api/admin/statistics/dashboard
   */
  getDashboardOverview(): Observable<DashboardOverviewResponse> {
    return this.http.get<DashboardOverviewResponse>(`${this.apiUrl}/dashboard`);
  }

  /**
   * Get revenue trends for specified period
   * GET /api/admin/statistics/revenue-trend?days=30
   */
  getRevenueTrend(days: number = 30): Observable<RevenueTrendResponse> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<RevenueTrendResponse>(
      `${this.apiUrl}/revenue-trend`,
      { params }
    );
  }

  /**
   * Get sales statistics by category
   * GET /api/admin/statistics/sales-by-category
   */
  getSalesByCategory(): Observable<SalesByCategoryResponse> {
    return this.http.get<SalesByCategoryResponse>(
      `${this.apiUrl}/sales-by-category`
    );
  }
}
