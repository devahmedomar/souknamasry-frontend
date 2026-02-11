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
  /** Pass 'ar' to render Arabic hreflang, 'en' for English */
  lang?: 'ar' | 'en';
}

const BASE_URL = 'https://souknamasry.vercel.app';
const SITE_NAME_AR = 'سوقنا مصري';
const SITE_NAME_EN = 'Soukna Masry';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private doc: Document,
  ) {}

  public setSeoData(config: SeoConfig): void {
    this.setTitle(config.title);
    this.setMetaTags(config);
    const resolvedUrl = config.url
      ? this.ensureAbsoluteUrl(config.url)
      : BASE_URL;
    this.setCanonicalUrl(resolvedUrl);
    this.setHreflang(resolvedUrl, config.lang);
  }

  public setTitle(title: string): void {
    const suffix = SITE_NAME_AR;
    this.titleService.setTitle(`${title} | ${suffix}`);
  }

  public setMetaTags(config: SeoConfig): void {
    const isArabic = config.lang === 'ar' || !config.lang;
    const siteName = config.siteName || (isArabic ? SITE_NAME_AR : SITE_NAME_EN);

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

    const urlToUse = config.url
      ? this.ensureAbsoluteUrl(config.url)
      : BASE_URL;
    this.metaService.updateTag({ property: 'og:url', content: urlToUse });

    const type = config.type || 'website';
    this.metaService.updateTag({ property: 'og:type', content: type });

    const locale = config.locale || (isArabic ? 'ar_EG' : 'en_US');
    this.metaService.updateTag({ property: 'og:locale', content: locale });
  }

  public setCanonicalUrl(url: string): void {
    let link = this.doc.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', this.ensureAbsoluteUrl(url));
  }

  /**
   * Injects hreflang link elements for Arabic (Egypt) and English variants.
   * Called on every page navigation to keep them updated.
   */
  public setHreflang(pageUrl: string, currentLang?: 'ar' | 'en'): void {
    // Remove previously injected hreflang links
    this.doc.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

    const arUrl = pageUrl.replace(/[?&]lang=en/, '');
    const enUrl = pageUrl.includes('?')
      ? `${pageUrl}&lang=en`
      : `${pageUrl}?lang=en`;

    const links: { hreflang: string; href: string }[] = [
      { hreflang: 'ar-eg', href: arUrl },
      { hreflang: 'en', href: enUrl },
      { hreflang: 'x-default', href: arUrl },
    ];

    links.forEach(({ hreflang, href }) => {
      const el = this.doc.createElement('link');
      el.setAttribute('rel', 'alternate');
      el.setAttribute('hreflang', hreflang);
      el.setAttribute('href', href);
      this.doc.head.appendChild(el);
    });
  }

  /**
   * Injects a single JSON-LD script block.
   * Supports multiple schemas by using a unique id attribute.
   */
  public setJsonLd(data: object, id = 'default'): void {
    const selector = `script[type="application/ld+json"][data-seo-id="${id}"]`;
    let script = this.doc.querySelector(selector) as HTMLScriptElement;
    if (!script) {
      script = this.doc.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo-id', id);
      this.doc.head.appendChild(script);
    }
    script.text = JSON.stringify(data);
  }

  /** Remove all JSON-LD blocks (call on route change before setting new ones) */
  public clearJsonLd(): void {
    this.doc
      .querySelectorAll('script[type="application/ld+json"][data-seo-id]')
      .forEach(el => el.remove());
  }

  private ensureAbsoluteUrl(url: string): string {
    if (!url) return BASE_URL;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const clean = url.startsWith('/') ? url.substring(1) : url;
    return `${BASE_URL}/${clean}`;
  }
}
