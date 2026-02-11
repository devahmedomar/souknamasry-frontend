import { Component, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import {
  CategoryAdminService,
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../services/category-admin.service';
import { CategoryAttributesAdminService } from '../../services/category-attributes-admin.service';
import {
  CategoryAttribute,
  AttributeOption,
} from '../../../../shared/models/category-attribute.interface';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    SelectModule,
    CheckboxModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './categories-page.html',
  styleUrl: './categories-page.css',
})
export class CategoriesPage implements OnInit {
  private readonly categoryService = inject(CategoryAdminService);
  private readonly categoryAttributesAdminService = inject(CategoryAttributesAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly platformId = inject(PLATFORM_ID);

  categories = signal<Category[]>([]);
  loading = signal(false);
  dialogVisible = signal(false);
  isEditMode = signal(false);
  selectedCategory = signal<Category | null>(null);

  categoryForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    nameAr: ['', [Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    descriptionAr: ['', [Validators.maxLength(500)]],
    image: [''],
    parent: [null],
    isActive: [true],
  });

  parentCategories = signal<Category[]>([]);

  // Attribute editor dialog state
  attrsDialogVisible = signal(false);
  editingCategoryForAttrs = signal<Category | null>(null);
  categoryAttributes = signal<CategoryAttribute[]>([]);
  attrsLoading = signal(false);
  attrsSaving = signal(false);

  attributeTypeOptions = [
    { label: 'Select (Radio buttons)', value: 'select' },
    { label: 'Multi-Select (Checkboxes)', value: 'multi-select' },
    { label: 'Number Range', value: 'number-range' },
    { label: 'Text', value: 'text' },
  ];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCategories();
    }
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        const categories = response.data.categories || [];
        this.categories.set(categories);
        this.parentCategories.set(
          categories.filter((cat) => !cat.parent)
        );
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load categories',
        });
        this.loading.set(false);
      },
    });
  }

  openCreateDialog(): void {
    this.isEditMode.set(false);
    this.selectedCategory.set(null);
    this.categoryForm.reset({ isActive: true });
    this.dialogVisible.set(true);
  }

  openEditDialog(category: Category): void {
    this.isEditMode.set(true);
    this.selectedCategory.set(category);
    this.categoryForm.patchValue({
      name: category.name,
      nameAr: category.nameAr || '',
      description: category.description || '',
      descriptionAr: category.descriptionAr || '',
      image: category.image || '',
      parent: typeof category.parent === 'object' ? category.parent?._id : category.parent,
      isActive: category.isActive,
    });
    this.dialogVisible.set(true);
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
    this.categoryForm.reset();
    this.selectedCategory.set(null);
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const formValue = this.categoryForm.value;

    if (this.isEditMode() && this.selectedCategory()) {
      const updateData: UpdateCategoryDto = {
        name: formValue.name,
        nameAr: formValue.nameAr || undefined,
        description: formValue.description || undefined,
        descriptionAr: formValue.descriptionAr || undefined,
        image: formValue.image || undefined,
        parent: formValue.parent || undefined,
        isActive: formValue.isActive,
      };

      this.categoryService
        .updateCategory(this.selectedCategory()!._id, updateData)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Category updated successfully',
            });
            this.loadCategories();
            this.closeDialog();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to update category',
            });
          },
        });
    } else {
      const createData: CreateCategoryDto = {
        name: formValue.name,
        nameAr: formValue.nameAr || undefined,
        description: formValue.description || undefined,
        descriptionAr: formValue.descriptionAr || undefined,
        image: formValue.image || undefined,
        parent: formValue.parent || undefined,
        isActive: formValue.isActive,
      };

      this.categoryService.createCategory(createData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Category created successfully',
          });
          this.loadCategories();
          this.closeDialog();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to create category',
          });
        },
      });
    }
  }

  toggleCategoryStatus(category: Category): void {
    const action = category.isActive ? 'deactivate' : 'activate';
    const actionText = category.isActive ? 'Deactivate' : 'Activate';

    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} "${category.name}"?`,
      header: `${actionText} Category`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const request = category.isActive
          ? this.categoryService.deactivateCategory(category._id)
          : this.categoryService.activateCategory(category._id);

        request.subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Category ${action}d successfully`,
            });
            this.loadCategories();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || `Failed to ${action} category`,
            });
          },
        });
      },
    });
  }

  deleteCategory(category: Category): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      header: 'Delete Category',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.categoryService.deleteCategory(category._id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Category deleted successfully',
            });
            this.loadCategories();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail:
                error.error?.message ||
                'Failed to delete category. It may have associated products or subcategories.',
            });
          },
        });
      },
    });
  }

  getParentName(category: Category): string {
    if (!category.parent) return '-';
    return typeof category.parent === 'object'
      ? category.parent.name
      : 'Unknown';
  }

  // ─── Attribute Editor ────────────────────────────────────────────────────────

  openAttributesDialog(category: Category): void {
    this.editingCategoryForAttrs.set(category);
    this.attrsDialogVisible.set(true);
    this.attrsLoading.set(true);
    this.categoryAttributes.set([]);

    this.categoryAttributesAdminService
      .getAttributesForCategory(category._id)
      .subscribe({
        next: (res) => {
          const sorted = [...(res.data.categoryAttributes?.attributes ?? [])].sort((a, b) => a.order - b.order);
          this.categoryAttributes.set(sorted);
          this.attrsLoading.set(false);
        },
        error: (err) => {
          if (err.status !== 404) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Warning',
              detail: 'Could not load existing attributes',
            });
          }
          this.categoryAttributes.set([]);
          this.attrsLoading.set(false);
        },
      });
  }

  closeAttributesDialog(): void {
    this.attrsDialogVisible.set(false);
    this.editingCategoryForAttrs.set(null);
    this.categoryAttributes.set([]);
  }

  addAttribute(): void {
    const newAttr: CategoryAttribute = {
      key: '',
      label: '',
      labelAr: '',
      type: 'select',
      options: [],
      filterable: true,
      required: false,
      order: this.categoryAttributes().length,
    };
    this.categoryAttributes.update((attrs) => [...attrs, newAttr]);
  }

  removeAttribute(index: number): void {
    this.categoryAttributes.update((attrs) => attrs.filter((_, i) => i !== index));
  }

  updateAttribute(index: number, field: keyof CategoryAttribute, value: unknown): void {
    this.categoryAttributes.update((attrs) => {
      const updated = [...attrs];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  addOption(attrIndex: number): void {
    this.categoryAttributes.update((attrs) => {
      const updated = [...attrs];
      const attr = { ...updated[attrIndex] };
      attr.options = [...(attr.options ?? []), { value: '', label: '', labelAr: '' }];
      updated[attrIndex] = attr;
      return updated;
    });
  }

  removeOption(attrIndex: number, optionIndex: number): void {
    this.categoryAttributes.update((attrs) => {
      const updated = [...attrs];
      const attr = { ...updated[attrIndex] };
      attr.options = (attr.options ?? []).filter((_, i) => i !== optionIndex);
      updated[attrIndex] = attr;
      return updated;
    });
  }

  updateOption(attrIndex: number, optionIndex: number, field: keyof AttributeOption, value: string): void {
    this.categoryAttributes.update((attrs) => {
      const updated = [...attrs];
      const attr = { ...updated[attrIndex] };
      const options = [...(attr.options ?? [])];
      options[optionIndex] = { ...options[optionIndex], [field]: value };
      attr.options = options;
      updated[attrIndex] = attr;
      return updated;
    });
  }

  saveAttributes(): void {
    const categoryId = this.editingCategoryForAttrs()?._id;
    if (!categoryId) return;

    const attrsToSave = this.categoryAttributes().map((attr, i) => ({
      ...attr,
      order: i,
    }));

    this.attrsSaving.set(true);
    this.categoryAttributesAdminService
      .saveAttributesForCategory(categoryId, attrsToSave)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Category attributes saved successfully',
          });
          this.attrsSaving.set(false);
          this.closeAttributesDialog();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to save attributes',
          });
          this.attrsSaving.set(false);
        },
      });
  }
}
