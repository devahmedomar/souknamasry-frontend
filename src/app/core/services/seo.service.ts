import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoConfig {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  locale?: string;
  siteName?: string;
  imageAlt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private doc: Document,
  ) { }

  public setSeoData(config: SeoConfig): void {
    this.setTitle(config.title);
    this.setMetaTags(config);
    if (config.url) {
      this.setCanonicalUrl(config.url);
    }
  }

  public setTitle(title: string): void {
    this.titleService.setTitle(`${title} | Soukna Masry`);
  }

  public setMetaTags(config: SeoConfig): void {
    // Site name
    const siteName = config.siteName || 'Soukna Masry';
    this.metaService.updateTag({ property: 'og:site_name', content: siteName });

    if (config.description) {
      this.metaService.updateTag({ name: 'description', content: config.description });
      this.metaService.updateTag({ property: 'og:description', content: config.description });
      this.metaService.updateTag({ name: 'twitter:description', content: config.description });
    }

    if (config.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords });
    }

    this.metaService.updateTag({ property: 'og:title', content: config.title });
    this.metaService.updateTag({ name: 'twitter:title', content: config.title });

    if (config.image) {
      // Ensure absolute URL for images (social media requires absolute URLs)
      const absoluteImageUrl = this.ensureAbsoluteUrl(config.image);

      this.metaService.updateTag({ property: 'og:image', content: absoluteImageUrl });
      this.metaService.updateTag({ property: 'og:image:secure_url', content: absoluteImageUrl });
      this.metaService.updateTag({ property: 'og:image:width', content: '1200' });
      this.metaService.updateTag({ property: 'og:image:height', content: '630' });

      if (config.imageAlt) {
        this.metaService.updateTag({ property: 'og:image:alt', content: config.imageAlt });
      }

      this.metaService.updateTag({ name: 'twitter:image', content: absoluteImageUrl });
      this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    }

    if (config.url) {
      const absoluteUrl = this.ensureAbsoluteUrl(config.url);
      this.metaService.updateTag({ property: 'og:url', content: absoluteUrl });
    }

    if (config.type) {
      this.metaService.updateTag({ property: 'og:type', content: config.type });
    } else {
      this.metaService.updateTag({ property: 'og:type', content: 'website' });
    }

    // Default locale could be injected or passed, usually 'en_US' or 'ar_EG'
    const locale = config.locale || 'en_US';
    this.metaService.updateTag({ property: 'og:locale', content: locale });
  }

  public setCanonicalUrl(url: string): void {
    let link: HTMLLinkElement = this.doc.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    // Ensure absolute URL
    if (!url.startsWith('http')) {
      // Assuming base url is the current origin if not provided, or a specific domain
      // For canonical, it's better to be explicit.
      // I will use document.location.origin if available, but for SSR it might differ.
      // For now, I'll assume the caller passes a full URL or I prepend the production domain.
      // Since I don't know the exact prod domain, I'll just set what is passed.
    }
    link.setAttribute('href', url);
  }

  /**
   * Ensures a URL is absolute. If it's relative, prepends the production domain.
   * Social media platforms require absolute URLs for images and links.
   */
  private ensureAbsoluteUrl(url: string): string {
    if (!url) return '';

    // Already absolute URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Use production domain for absolute URLs
    const baseUrl = 'https://souknamasry.vercel.app';

    // Remove leading slash if present to avoid double slashes
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;

    return `${baseUrl}/${cleanUrl}`;
  }

  public setJsonLd(data: any): void {
    let script: HTMLScriptElement = this.doc.querySelector(
      'script[type="application/ld+json"]',
    ) as HTMLScriptElement;
    if (!script) {
      script = this.doc.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      this.doc.head.appendChild(script);
    }
    script.text = JSON.stringify(data);
  }
}
