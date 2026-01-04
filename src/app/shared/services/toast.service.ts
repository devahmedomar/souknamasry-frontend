import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

export interface ToastOptions {
  summary?: string;
  life?: number;
  sticky?: boolean;
  closable?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly messageService = inject(MessageService);
  private readonly translateService = inject(TranslateService);

  private readonly defaultLife = 4000;
  success(message: string, options?: ToastOptions): void {
    this.show('success', message, options?.summary ?? 'Success', options);
  }
  error(message: string, options?: ToastOptions): void {
    this.show('error', message, options?.summary ?? 'Error', options);
  }
  warn(message: string, options?: ToastOptions): void {
    this.show('warn', message, options?.summary ?? 'Warning', options);
  }
  info(message: string, options?: ToastOptions): void {
    this.show('info', message, options?.summary ?? 'Info', options);
  }
  successT(messageKey: string, summaryKey: string = 'COMMON.SUCCESS'): void {
    this.showTranslated('success', messageKey, summaryKey);
  }
  errorT(messageKey: string, summaryKey: string = 'COMMON.ERROR'): void {
    this.showTranslated('error', messageKey, summaryKey);
  }
  warnT(messageKey: string, summaryKey: string = 'COMMON.WARNING'): void {
    this.showTranslated('warn', messageKey, summaryKey);
  }
  infoT(messageKey: string, summaryKey: string = 'COMMON.INFO'): void {
    this.showTranslated('info', messageKey, summaryKey);
  }
  clear(): void {
    this.messageService.clear();
  }

  private show(
    severity: 'success' | 'error' | 'warn' | 'info',
    detail: string,
    summary: string,
    options?: ToastOptions
  ): void {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: options?.life ?? this.defaultLife,
      sticky: options?.sticky ?? false,
      closable: options?.closable ?? true
    });
  }

  private showTranslated(
    severity: 'success' | 'error' | 'warn' | 'info',
    messageKey: string,
    summaryKey: string
  ): void {
    this.translateService.get([messageKey, summaryKey]).subscribe(translations => {
      this.messageService.add({
        severity,
        summary: translations[summaryKey],
        detail: translations[messageKey],
        life: this.defaultLife,
        closable: true
      });
    });
  }
}
