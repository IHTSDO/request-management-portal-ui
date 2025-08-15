/**
 * Supported language codes for the application
 */
export const SUPPORTED_LANGUAGES = ['en', 'de', 'dk', 'fr', 'it', 'nl', 'ko'];

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * Check if a language code is supported
 */
export function isSupportedLanguage(code: string): code is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(code);
}

/**
 * Get the default language (English)
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
