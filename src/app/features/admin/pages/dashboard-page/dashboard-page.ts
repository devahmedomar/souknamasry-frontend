import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { StatisticsAdminService } from '../../services/statistics-admin.service';
import { DashboardOverview } from '../../models/statistics.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    ChartModule,
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly statisticsService = inject(StatisticsAdminService);

  currentUser = this.authService.currentUser;
  loading = signal(false);
  dashboardData = signal<DashboardOverview | null>(null);

  // Chart data for revenue trend
  revenueChartData = signal<any>(null);
  revenueChartOptions = signal<any>(null);

  // Chart data for sales by category
  categoryChartData = signal<any>(null);
  categoryChartOptions = signal<any>(null);

  ngOnInit(): void {
    const user = this.currentUser();
    console.log('Admin Dashboard loaded');
    console.log('Current user:', user);
    console.log('User email:', user?.email);
    console.log('User role:', user?.role);
    console.log('Token exists:', !!this.authService.token());

    if (user && user.role === 'admin') {
      this.loadDashboardStatistics();
      this.loadRevenueTrend();
      this.loadSalesByCategory();
    } else {
      console.warn('User is not authenticated as admin or user data is missing');
    }
  }

  loadDashboardStatistics(): void {
    this.loading.set(true);
    this.statisticsService.getDashboardOverview().subscribe({
      next: (response) => {
        this.dashboardData.set(response.data);
        this.loading.set(false);
        console.log('Dashboard statistics loaded successfully');
      },
      error: (error) => {
        console.error('Failed to load dashboard statistics:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        this.loading.set(false);
      },
    });
  }

  loadRevenueTrend(days: number = 30): void {
    this.statisticsService.getRevenueTrend(days).subscribe({
      next: (response) => {
        const data = response.data;
        this.revenueChartData.set({
          labels: data.map((d) => new Date(d.date).toLocaleDateString()),
          datasets: [
            {
              label: 'Revenue',
              data: data.map((d) => d.revenue),
              borderColor: '#42A5F5',
              backgroundColor: 'rgba(66, 165, 245, 0.2)',
              fill: true,
              tension: 0.4,
            },
          ],
        });
        this.revenueChartOptions.set({
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        });
      },
      error: (error) => {
        console.error('Failed to load revenue trend:', error);
      },
    });
  }

  loadSalesByCategory(): void {
    this.statisticsService.getSalesByCategory().subscribe({
      next: (response) => {
        const data = response.data;
        this.categoryChartData.set({
          labels: data.map((d) => d.name),
          datasets: [
            {
              label: 'Revenue by Category',
              data: data.map((d) => d.revenue),
              backgroundColor: [
                '#42A5F5',
                '#66BB6A',
                '#FFA726',
                '#EF5350',
                '#AB47BC',
                '#26C6DA',
              ],
            },
          ],
        });
        this.categoryChartOptions.set({
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'right',
            },
          },
        });
      },
      error: (error) => {
        console.error('Failed to load sales by category:', error);
      },
    });
  }

  getOrderStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    const statusMap: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
      delivered: 'success',
      processing: 'info',
      pending: 'warn',
      cancelled: 'danger',
    };
    return statusMap[status.toLowerCase()] || 'info';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount);
  }
}
