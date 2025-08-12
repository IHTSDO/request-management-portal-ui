import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideClientHydration} from '@angular/platform-browser';
import {provideHttpClient, withFetch, withInterceptors, HttpClient} from "@angular/common/http";
import {contentTypeInterceptor} from "./interceptors/content-type.interceptor";
import {authenticationInterceptor} from './interceptors/authentication.interceptor';
import {provideAnimations} from "@angular/platform-browser/animations";
import {provideToastr} from "ngx-toastr";
import {provideTranslateService} from "@ngx-translate/core";
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({eventCoalescing: true}),
        provideRouter(routes),
        provideClientHydration(),
        provideHttpClient(withFetch(), withInterceptors([
            contentTypeInterceptor,
            authenticationInterceptor
        ])),
        provideAnimations(),
        provideToastr(),
        provideTranslateService({
            loader: provideTranslateHttpLoader({
                prefix: '/i18n/',
                suffix: '.json'
            }),
            fallbackLang: 'en',
            lang: 'en'
        })
    ]
};
