import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage implements OnInit {
  private readonly authService = inject(AuthService);

  currentUser = this.authService.currentUser;

  stats = [
    {
      icon: 'pi pi-box',
      label: 'Total Products',
      value: '-',
      color: 'bg-primary',
    },
    {
      icon: 'pi pi-shopping-cart',
      label: 'Total Orders',
      value: '-',
      color: 'bg-success',
    },
    {
      icon: 'pi pi-users',
      label: 'Total Users',
      value: '-',
      color: 'bg-info',
    },
    {
      icon: 'pi pi-dollar',
      label: 'Revenue',
      value: '-',
      color: 'bg-warning',
    },
  ];

  quickActions = [
    {
      icon: 'pi pi-box',
      title: 'Manage Products',
      description: 'Add, edit, or remove products',
    },
    {
      icon: 'pi pi-shopping-cart',
      title: 'View Orders',
      description: 'Process customer orders',
    },
    {
      icon: 'pi pi-users',
      title: 'Manage Users',
      description: 'View and manage user accounts',
    },
  ];

  ngOnInit(): void {
    // Future: Load dashboard statistics
    console.log('Admin Dashboard loaded for:', this.currentUser()?.email);
  }
}
