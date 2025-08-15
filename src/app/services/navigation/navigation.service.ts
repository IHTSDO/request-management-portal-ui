import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '../language/language.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(
    private router: Router,
    private languageService: LanguageService
  ) {}

  /**
   * Navigate to a route while preserving the current language parameter
   */
  navigateWithLanguage(commands: any[], extras?: any): void {
    const currentLang = this.languageService.getCurrentLanguage();
    const urlTree = this.router.createUrlTree(commands, extras);
    
    // Add language parameter if it's not already present
    if (!urlTree.queryParams['lang']) {
      urlTree.queryParams['lang'] = currentLang;
    }
    
    this.router.navigateByUrl(urlTree);
  }

  /**
   * Navigate to a route with specific language
   */
  navigateWithSpecificLanguage(commands: any[], language: string, extras?: any): void {
    const urlTree = this.router.createUrlTree(commands, extras);
    urlTree.queryParams['lang'] = language;
    this.router.navigateByUrl(urlTree);
  }

  /**
   * Get the current language from URL or service
   */
  getCurrentLanguage(): string {
    return this.languageService.getCurrentLanguage();
  }
}
