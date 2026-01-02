import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

/**
 * Notification Utility - Helper functions for displaying notifications
 */
export class NotificationUtil {
    static showSuccess(
        messageService: MessageService,
        translateService: TranslateService,
        messageKey: string,
        summaryKey: string = 'AUTH.MESSAGES.SUCCESS',
        life: number = 3000
    ): void {
        translateService.get([messageKey, summaryKey]).subscribe(translations => {
            messageService.add({
                severity: 'success',
                summary: translations[summaryKey],
                detail: translations[messageKey],
                life
            });
        });
    }

    static showError(
        messageService: MessageService,
        translateService: TranslateService,
        messageKey: string,
        summaryKey: string = 'AUTH.MESSAGES.ERROR',
        life: number = 3000
    ): void {
        translateService.get([messageKey, summaryKey]).subscribe(translations => {
            messageService.add({
                severity: 'error',
                summary: translations[summaryKey],
                detail: translations[messageKey],
                life
            });
        });
    }

    static showWarning(
        messageService: MessageService,
        translateService: TranslateService,
        messageKey: string,
        summaryKey: string = 'COMMON.WARNING',
        life: number = 3000
    ): void {
        translateService.get([messageKey, summaryKey]).subscribe(translations => {
            messageService.add({
                severity: 'warn',
                summary: translations[summaryKey],
                detail: translations[messageKey],
                life
            });
        });
    }

    static showInfo(
        messageService: MessageService,
        message: string,
        summary: string = 'Info',
        life: number = 3000
    ): void {
        messageService.add({
            severity: 'info',
            summary,
            detail: message,
            life
        });
    }
}
