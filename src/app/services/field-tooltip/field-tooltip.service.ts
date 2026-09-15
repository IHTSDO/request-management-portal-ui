import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';
import { DEFAULT_LANGUAGE } from '../../constants/languages';
import * as appConfig from 'public/config/config.json';
import { LanguageService } from '../language/language.service';

/**
 * Loads NRC-specific field tooltip overrides for the current extension language.
 * English tooltips are never overridden. Place customizations at:
 * public/i18n/overrides/{country}/{lang}.json
 * e.g. public/i18n/overrides/be/fr.json for Belgian French.
 */
@Injectable({
    providedIn: 'root'
})
export class FieldTooltipService {
    private readonly overlaySubject = new BehaviorSubject<Record<string, unknown>>({});
    readonly overlay$ = this.overlaySubject.asObservable();

    private loadedKey = '';

    constructor(
        private readonly http: HttpClient,
        private readonly router: Router,
        private readonly translate: TranslateService,
        private readonly languageService: LanguageService
    ) {
        this.languageService.currentLanguage$.subscribe(() => this.loadOverlay());
        this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
            .subscribe(() => this.loadOverlay());
        this.loadOverlay();
    }

    resolve(tooltipKey: string): string {
        const overlayValue = this.lookup(this.overlaySubject.value, tooltipKey);
        if (typeof overlayValue === 'string' && overlayValue.trim()) {
            return overlayValue;
        }
        const translated = this.translate.instant(tooltipKey);
        return translated === tooltipKey ? '' : translated;
    }

    private loadOverlay(): void {
        const language = this.languageService.getCurrentLanguage() || this.translate.getCurrentLang() || DEFAULT_LANGUAGE;
        const country = this.getCountryFromUrl();
        const loadKey = `${country || ''}:${language}`;

        if (this.loadedKey === loadKey) {
            return;
        }

        this.loadedKey = loadKey;

        if (language === DEFAULT_LANGUAGE || !country) {
            this.overlaySubject.next({});
            return;
        }
        this.http.get<Record<string, unknown>>(`/i18n/overrides/${country}/${language}.json`).pipe(
            catchError(() => of(null))
        ).subscribe(overlay => {
            if (this.loadedKey !== loadKey) {
                return;
            }
            this.overlaySubject.next(overlay || {});
        });
    }

    private getCountryFromUrl(): string | null {
        const path = this.router.url.split('?')[0];
        const segment = path.split('/').filter(Boolean)[0];
        if (!segment) {
            return null;
        }
        const extensions = (appConfig as { extensions?: { shortCode: string }[] }).extensions || [];
        return extensions.some(extension => extension.shortCode === segment) ? segment : null;
    }

    private lookup(source: Record<string, unknown>, dottedKey: string): unknown {
        return dottedKey.split('.').reduce<unknown>((current, part) => {
            if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
                return (current as Record<string, unknown>)[part];
            }
            return undefined;
        }, source);
    }
}
