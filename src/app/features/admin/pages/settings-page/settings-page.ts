import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import {
  SiteThemeAdminService,
  SiteTheme,
  CreateThemeDto,
  UpdateThemeDto,
} from '../../services/site-theme-admin.service';
import { SiteThemeService } from '../../../../core/services/site-theme.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToggleSwitchModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.css',
})
export class SettingsPage implements OnInit {
  private readonly siteThemeAdminService = inject(SiteThemeAdminService);
  private readonly siteThemeService = inject(SiteThemeService);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  themes = signal<SiteTheme[]>([]);
  activeTheme = signal<string>('default');
  loading = signal(false);
  saving = signal(false);

  showCreateDialog = signal(false);
  showEditDialog = signal(false);
  editingTheme = signal<SiteTheme | null>(null);

  createForm!: FormGroup;
  editForm!: FormGroup;

  ngOnInit(): void {
    this.createForm = this.fb.group({
      key: ['', [Validators.required, Validators.pattern(/^[a-z0-9_-]+$/)]],
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      isEnabled: [true],
    });

    this.editForm = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      isEnabled: [true],
    });

    this.loadSettings();
  }

  loadSettings(): void {
    this.loading.set(true);
    this.siteThemeAdminService.getSettings().subscribe({
      next: (settings) => {
        this.themes.set(settings.themes);
        this.activeTheme.set(settings.activeTheme);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load settings',
        });
      },
    });
  }

  setActiveTheme(key: string): void {
    if (key === this.activeTheme()) return;
    this.siteThemeAdminService.setActiveTheme(key).subscribe({
      next: (settings) => {
        this.activeTheme.set(settings.activeTheme);
        this.themes.set(settings.themes);
        this.siteThemeService.activeTheme.set(settings.activeTheme);
        this.siteThemeService.applyToDOM(settings.activeTheme);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Active theme updated',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update active theme',
        });
      },
    });
  }

  openCreateDialog(): void {
    this.createForm.reset({ isEnabled: true });
    this.showCreateDialog.set(true);
  }

  submitCreate(): void {
    if (this.createForm.invalid) return;
    this.saving.set(true);
    const dto: CreateThemeDto = this.createForm.value;
    this.siteThemeAdminService.createTheme(dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.showCreateDialog.set(false);
        this.loadSettings();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Theme created',
        });
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to create theme',
        });
      },
    });
  }

  openEditDialog(theme: SiteTheme): void {
    this.editingTheme.set(theme);
    this.editForm.setValue({
      nameEn: theme.nameEn,
      nameAr: theme.nameAr,
      isEnabled: theme.isEnabled,
    });
    this.showEditDialog.set(true);
  }

  submitEdit(): void {
    const theme = this.editingTheme();
    if (!theme || this.editForm.invalid) return;
    this.saving.set(true);
    const dto: UpdateThemeDto = this.editForm.value;
    this.siteThemeAdminService.updateTheme(theme.key, dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.showEditDialog.set(false);
        this.loadSettings();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Theme updated',
        });
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to update theme',
        });
      },
    });
  }

  confirmDelete(theme: SiteTheme): void {
    this.confirmationService.confirm({
      message: `Delete theme "${theme.nameEn}"? This cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.deleteTheme(theme.key),
    });
  }

  private deleteTheme(key: string): void {
    this.siteThemeAdminService.deleteTheme(key).subscribe({
      next: () => {
        this.loadSettings();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Theme deleted',
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to delete theme',
        });
      },
    });
  }
}
