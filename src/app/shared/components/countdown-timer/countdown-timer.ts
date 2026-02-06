import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './countdown-timer.html',
  styleUrl: './countdown-timer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownTimer implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  // Input: End date for countdown
  endDate = input.required<Date | string>();

  // Optional: Label to show above countdown
  label = input<string>('');

  // Optional: Size variant
  size = input<'sm' | 'md' | 'lg'>('md');

  // Optional: Show labels
  showLabels = input<boolean>(true);

  // Optional: Compact mode (inline)
  compact = input<boolean>(false);

  // Countdown values
  days = signal(0);
  hours = signal(0);
  minutes = signal(0);
  seconds = signal(0);

  // Is countdown expired
  isExpired = signal(false);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.updateCountdown();
      this.intervalId = setInterval(() => this.updateCountdown(), 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateCountdown(): void {
    const endDateValue = this.endDate();
    const end = typeof endDateValue === 'string' ? new Date(endDateValue) : endDateValue;
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) {
      this.days.set(0);
      this.hours.set(0);
      this.minutes.set(0);
      this.seconds.set(0);
      this.isExpired.set(true);

      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    this.days.set(days);
    this.hours.set(hours);
    this.minutes.set(minutes);
    this.seconds.set(seconds);
  }

  // Pad single digit numbers with leading zero
  padNumber(num: number): string {
    return num.toString().padStart(2, '0');
  }
}
