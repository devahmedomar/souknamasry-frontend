import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-toggle.html',
  styleUrls: ['./theme-toggle.css']
})
export class ThemeToggle {
  private themeService = inject(ThemeService);

  isDarkMode = this.themeService.isDarkMode;

  ariaLabel = computed(() =>
    this.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'
  );

  tooltipText = computed(() =>
    this.isDarkMode() ? 'Light mode' : 'Dark mode'
  );

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
