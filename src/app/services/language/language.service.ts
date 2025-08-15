import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { isSupportedLanguage, DEFAULT_LANGUAGE } from '../../constants/languages';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<string>('en');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
    // Initialize with default language
    this.currentLanguageSubject.next(DEFAULT_LANGUAGE);
  }

  setLanguage(language: string): void {
    this.translate.use(language);
    this.currentLanguageSubject.next(language);
    this.updateUrlWithLanguage(language);
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  private updateUrlWithLanguage(language: string): void {
    const currentUrl = this.router.url;
    const urlTree = this.router.parseUrl(currentUrl);
    
    // Update or add the lang query parameter
    urlTree.queryParams['lang'] = language;
    
    this.router.navigateByUrl(urlTree);
  }

  initializeLanguageFromUrl(): void {
    // Get language from query parameters
    const langParam = this.route.snapshot.queryParamMap.get('lang');
    
    if (langParam && isSupportedLanguage(langParam)) {
      this.translate.use(langParam);
      this.currentLanguageSubject.next(langParam);
    } else {
      // No language in URL, use default
      this.translate.use(DEFAULT_LANGUAGE);
      this.currentLanguageSubject.next(DEFAULT_LANGUAGE);
    }
  }


}
