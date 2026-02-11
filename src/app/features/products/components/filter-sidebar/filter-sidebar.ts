import {
  Component,
  input,
  output,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {
  CategoryAttribute,
  ActiveFilters,
} from '../../../../shared/models/category-attribute.interface';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './filter-sidebar.html',
  styleUrl: './filter-sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterSidebar {
  private translateService = inject(TranslateService);

  private currentLang = toSignal(
    this.translateService.onLangChange.pipe(map((e) => e.lang)),
    { initialValue: this.translateService.currentLang }
  );

  attributes = input.required<CategoryAttribute[]>();
  activeFilters = input<ActiveFilters>({});

  filtersChanged = output<ActiveFilters>();

  private collapsedGroups = signal<Set<string>>(new Set());

  totalActiveCount = computed(() => Object.keys(this.activeFilters()).length);

  getAttributeLabel(attr: CategoryAttribute): string {
    return this.currentLang() === 'ar' && attr.labelAr
      ? attr.labelAr
      : attr.label;
  }

  getOptionLabel(attr: CategoryAttribute, optionValue: string): string {
    const option = attr.options?.find((o) => o.value === optionValue);
    if (!option) return optionValue;
    return this.currentLang() === 'ar' && option.labelAr
      ? option.labelAr
      : option.label;
  }

  isSelectActive(attr: CategoryAttribute, value: string): boolean {
    const current = this.activeFilters()[attr.key];
    return typeof current === 'string' && current === value;
  }

  isMultiSelectActive(attr: CategoryAttribute, value: string): boolean {
    const current = this.activeFilters()[attr.key];
    return Array.isArray(current) && current.includes(value);
  }

  getRangeMin(attr: CategoryAttribute): number | undefined {
    const current = this.activeFilters()[attr.key];
    return typeof current === 'object' && !Array.isArray(current)
      ? (current as { min?: number; max?: number }).min
      : undefined;
  }

  getRangeMax(attr: CategoryAttribute): number | undefined {
    const current = this.activeFilters()[attr.key];
    return typeof current === 'object' && !Array.isArray(current)
      ? (current as { min?: number; max?: number }).max
      : undefined;
  }

  getActiveCount(attr: CategoryAttribute): number {
    const current = this.activeFilters()[attr.key];
    if (!current) return 0;
    if (Array.isArray(current)) return current.length;
    if (typeof current === 'object') {
      const r = current as { min?: number; max?: number };
      return (r.min !== undefined ? 1 : 0) + (r.max !== undefined ? 1 : 0);
    }
    return 1;
  }

  isGroupCollapsed(key: string): boolean {
    return this.collapsedGroups().has(key);
  }

  toggleGroup(key: string): void {
    const next = new Set(this.collapsedGroups());
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.collapsedGroups.set(next);
  }

  onSelectChange(attr: CategoryAttribute, value: string): void {
    const current = this.activeFilters();
    const existing = current[attr.key];
    const newFilters =
      existing === value
        ? this.omitKey(current, attr.key)
        : { ...current, [attr.key]: value };
    this.filtersChanged.emit(newFilters);
  }

  onMultiSelectChange(
    attr: CategoryAttribute,
    value: string,
    checked: boolean
  ): void {
    const current = this.activeFilters();
    const existing = (current[attr.key] as string[]) ?? [];
    const updated = checked
      ? [...existing, value]
      : existing.filter((v) => v !== value);
    const newFilters =
      updated.length === 0
        ? this.omitKey(current, attr.key)
        : { ...current, [attr.key]: updated };
    this.filtersChanged.emit(newFilters);
  }

  onRangeChange(
    attr: CategoryAttribute,
    bound: 'min' | 'max',
    rawValue: string
  ): void {
    const parsed = rawValue === '' ? undefined : Number(rawValue);
    const current = this.activeFilters();
    const existing =
      typeof current[attr.key] === 'object' && !Array.isArray(current[attr.key])
        ? (current[attr.key] as { min?: number; max?: number })
        : {};
    const updated = { ...existing, [bound]: parsed };
    const isEmpty = updated.min === undefined && updated.max === undefined;
    const newFilters = isEmpty
      ? this.omitKey(current, attr.key)
      : { ...current, [attr.key]: updated };
    this.filtersChanged.emit(newFilters);
  }

  clearAll(): void {
    this.filtersChanged.emit({});
  }

  hasActiveFilters(): boolean {
    return Object.keys(this.activeFilters()).length > 0;
  }

  private omitKey(obj: ActiveFilters, key: string): ActiveFilters {
    const { [key]: _, ...rest } = obj;
    return rest;
  }
}
