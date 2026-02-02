import { Injectable, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'theme';

  // Signal-based theme state
  currentTheme = signal<Theme>('light');
  isDarkMode = computed(() => this.currentTheme() === 'dark');

  constructor() {
    // Only initialize theme in browser (SSR-safe)
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();
      this.setupStorageListener();
    }
  }

  /**
   * Initialize theme from localStorage or system preference
   * Called automatically in constructor (browser-only)
   */
  initializeTheme(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const savedTheme = this.getStoredTheme();
    const theme = savedTheme || this.detectSystemPreference();

    this.setTheme(theme);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Set theme explicitly
   * @param theme - 'light' or 'dark'
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.applyThemeToDOM(theme);
    this.saveToStorage(theme);
  }

  /**
   * Get theme from localStorage
   * @returns Theme or null if not found
   */
  private getStoredTheme(): Theme | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored === 'dark' || stored === 'light' ? stored : null;
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
      return null;
    }
  }

  /**
   * Detect system color scheme preference
   * @returns 'dark' if system prefers dark mode, 'light' otherwise
   */
  private detectSystemPreference(): Theme {
    if (!isPlatformBrowser(this.platformId)) {
      return 'light';
    }

    try {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    } catch (error) {
      console.warn('Failed to detect system preference:', error);
      return 'light';
    }
  }

  /**
   * Apply theme to DOM by setting data-theme attribute on html element
   * @param theme - Theme to apply
   */
  private applyThemeToDOM(theme: Theme): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      document.documentElement.setAttribute('data-theme', theme);
    } catch (error) {
      console.error('Failed to apply theme to DOM:', error);
    }
  }

  /**
   * Save theme preference to localStorage
   * @param theme - Theme to save
   */
  private saveToStorage(theme: Theme): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }

  /**
   * Listen for storage events to sync theme across browser tabs
   */
  private setupStorageListener(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === this.STORAGE_KEY && event.newValue) {
          const newTheme = event.newValue as Theme;
          if (newTheme === 'light' || newTheme === 'dark') {
            this.currentTheme.set(newTheme);
            this.applyThemeToDOM(newTheme);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to setup storage listener:', error);
    }
  }
}
