import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserAdminService } from '../../services/user-admin.service';
import { User, UserQueryParams } from '../../models/user.model';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './users-page.html',
  styleUrl: './users-page.css',
})
export class UsersPage implements OnInit {
  private readonly userService = inject(UserAdminService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);

  users = signal<User[]>([]);
  loading = signal(false);
  showDialog = signal(false);
  isEditMode = signal(false);
  selectedUser = signal<User | null>(null);

  // Pagination
  totalRecords = signal(0);
  currentPage = signal(1);
  rowsPerPage = signal(20);

  // Filters
  searchTerm = signal('');
  selectedRole = signal<'admin' | 'customer' | null>(null);
  selectedStatus = signal<boolean | null>(null);

  roleOptions = [
    { label: 'All Roles', value: null },
    { label: 'Admin', value: 'admin' },
    { label: 'Customer', value: 'customer' },
  ];

  statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  userForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', []],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    phone: [''],
    role: ['customer', [Validators.required]],
    isActive: [true],
    city: [''],
    imageUrl: [''],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);

    const params: UserQueryParams = {
      page: this.currentPage(),
      limit: this.rowsPerPage(),
    };

    if (this.searchTerm()) {
      params.search = this.searchTerm();
    }
    if (this.selectedRole()) {
      params.role = this.selectedRole()!;
    }
    if (this.selectedStatus() !== null) {
      params.isActive = this.selectedStatus()!;
    }

    this.userService.getAllUsers(params).subscribe({
      next: (response) => {
        this.users.set(response.data.users);
        this.totalRecords.set(response.data.pagination.total);
        this.loading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users',
        });
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: any): void {
    this.currentPage.set(event.page + 1);
    this.rowsPerPage.set(event.rows);
    this.loadUsers();
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  openCreateDialog(): void {
    this.isEditMode.set(false);
    this.selectedUser.set(null);
    this.userForm.reset({
      role: 'customer',
      isActive: true,
    });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showDialog.set(true);
  }

  openEditDialog(user: User): void {
    this.isEditMode.set(true);
    this.selectedUser.set(user);
    this.userForm.patchValue({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      city: user.city,
      imageUrl: user.imageUrl,
    });
    this.userForm.get('email')?.disable();
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
    this.userForm.reset();
    this.userForm.get('email')?.enable();
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.getRawValue();

    if (this.isEditMode()) {
      const updateData = { ...formValue };
      delete updateData.email;
      delete updateData.password;

      this.userService
        .updateUser(this.selectedUser()!._id, updateData)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User updated successfully',
            });
            this.closeDialog();
            this.loadUsers();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to update user',
            });
          },
        });
    } else {
      this.userService.createUser(formValue).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'User created successfully',
          });
          this.closeDialog();
          this.loadUsers();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to create user',
          });
        },
      });
    }
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    const message = user.isActive
      ? 'Are you sure you want to deactivate this user?'
      : 'Are you sure you want to activate this user?';

    this.confirmationService.confirm({
      message,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const serviceCall = user.isActive
          ? this.userService.deactivateUser(user._id)
          : this.userService.activateUser(user._id);

        serviceCall.subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `User ${action}d successfully`,
            });
            this.loadUsers();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Failed to ${action} user`,
            });
          },
        });
      },
    });
  }

  deleteUser(user: User): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to permanently delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
      header: 'Delete User',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.userService.deleteUser(user._id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User deleted permanently',
            });
            this.loadUsers();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to delete user',
            });
          },
        });
      },
    });
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' {
    return role === 'admin' ? 'danger' : 'info';
  }

  getStatusSeverity(isActive: boolean): 'success' | 'info' | 'warn' | 'danger' {
    return isActive ? 'success' : 'danger';
  }
}
