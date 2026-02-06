import {
  Directive,
  ElementRef,
  inject,
  input,
  AfterViewInit,
  OnDestroy,
  Renderer2,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type AnimationType = 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'zoom-in';

@Directive({
  selector: '[appScrollAnimate]',
  standalone: true,
})
export class ScrollAnimateDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);

  // Animation type
  animation = input<AnimationType>('fade-up');

  // Delay in milliseconds before animation starts
  delay = input<number>(0);

  // Threshold for triggering (0-1)
  threshold = input<number>(0.1);

  // Whether to animate only once
  once = input<boolean>(true);

  private observer?: IntersectionObserver;
  private hasAnimated = false;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Skip animation, show element immediately
      this.renderer.addClass(this.el.nativeElement, 'visible');
      return;
    }

    this.setupElement();
    this.setupObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupElement(): void {
    // Add initial hidden state
    this.renderer.addClass(this.el.nativeElement, 'animate-hidden');
    this.renderer.setStyle(this.el.nativeElement, 'transition-delay', `${this.delay()}ms`);
  }

  private setupObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (this.once() && this.hasAnimated) return;

            this.animateIn();
            this.hasAnimated = true;

            if (this.once()) {
              this.observer?.disconnect();
            }
          } else if (!this.once() && this.hasAnimated) {
            this.animateOut();
          }
        });
      },
      { threshold: this.threshold() }
    );

    this.observer.observe(this.el.nativeElement);
  }

  private animateIn(): void {
    // Remove hidden state
    this.renderer.removeClass(this.el.nativeElement, 'animate-hidden');
    // Add animation class
    this.renderer.addClass(this.el.nativeElement, `animate-${this.animation()}`);
  }

  private animateOut(): void {
    // Add hidden state back
    this.renderer.addClass(this.el.nativeElement, 'animate-hidden');
    // Remove animation class
    this.renderer.removeClass(this.el.nativeElement, `animate-${this.animation()}`);
    this.hasAnimated = false;
  }
}
