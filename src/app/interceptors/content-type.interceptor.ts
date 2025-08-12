import {HttpInterceptorFn} from '@angular/common/http';

export const contentTypeInterceptor: HttpInterceptorFn = (req, next) => {

    // const reqWithHeader = req.clone({
    //     headers: req.headers.set('Content-Type', 'application/json'),
    // });
    //
    //
    // if (!request.headers.has('Content-Type')) {
    //     request = request.clone({
    //         headers: request.headers.set('Content-Type', 'application/json'),
    //     });
    // }
    // return next(reqWithHeader);

    return next(req);
};
