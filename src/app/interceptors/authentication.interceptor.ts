import {HttpInterceptorFn, HttpErrorResponse} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthoringService} from '../services/authoring/authoring.service';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

export const authenticationInterceptor: HttpInterceptorFn = (req, next) => {
    const authoringService = inject(AuthoringService);

    return next(req).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 403) {
                const uiConfig = authoringService.uiConfig;

                if (uiConfig?.endpoints?.imsEndpoint) {
                    const currentUrl = window.location.href;
                    const redirectUrl = `${uiConfig.endpoints.imsEndpoint}?serviceReferer=${encodeURIComponent(currentUrl)}`;
                    window.location.replace(redirectUrl);
                }
            }
            return throwError(() => error);
        })
    );
};
