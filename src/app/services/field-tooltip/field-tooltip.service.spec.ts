import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { LanguageService } from '../language/language.service';
import { FieldTooltipService } from './field-tooltip.service';

describe('FieldTooltipService', () => {
    let service: FieldTooltipService;
    let translate: { instant: jasmine.Spy; getCurrentLang: jasmine.Spy };

    beforeEach(() => {
        translate = {
            instant: jasmine.createSpy('instant').and.callFake((key: string) => {
                if (key === 'request.tooltip.reference') {
                    return 'Add one or more free, open and up-to-date sources where the concept is described (wiki or patient-focus sources are not allowed)';
                }
                return key;
            }),
            getCurrentLang: jasmine.createSpy('getCurrentLang').and.returnValue('en')
        };

        TestBed.configureTestingModule({
            providers: [
                FieldTooltipService,
                { provide: HttpClient, useValue: { get: () => of({}) } },
                { provide: Router, useValue: { url: '/be/new-request', events: of() } },
                { provide: TranslateService, useValue: translate },
                {
                    provide: LanguageService,
                    useValue: {
                        currentLanguage$: of('en'),
                        getCurrentLanguage: () => 'en'
                    }
                }
            ]
        });

        service = TestBed.inject(FieldTooltipService);
    });

    it('uses the agreed English tooltip text when no overlay is present', () => {
        expect(service.resolve('request.tooltip.reference')).toContain('wiki or patient-focus sources are not allowed');
    });

    it('prefers NRC overlay text over the shared language file', () => {
        (service as unknown as { overlaySubject: { next: (value: unknown) => void } }).overlaySubject.next({
            request: {
                tooltip: {
                    reference: 'Texte belge personnalisé pour la référence'
                }
            }
        });

        expect(service.resolve('request.tooltip.reference')).toBe('Texte belge personnalisé pour la référence');
    });
});
