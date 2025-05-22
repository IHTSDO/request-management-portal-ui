import {Injectable, InjectionToken} from '@angular/core';
import {UIConfiguration} from '../../models/uiConfiguration';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';

export const WINDOW = new InjectionToken<Window>("WINDOW", {
    factory: () => (typeof window !== "undefined" ? window : ({} as Window)),
});

@Injectable({providedIn: 'root'})
export class AuthoringService {


    // public environmentEndpoint: string;
    private uiConfiguration: Subject<UIConfiguration> = new Subject<UIConfiguration>();

    constructor(private http: HttpClient) {
        // this.environmentEndpoint = window.location.origin + '/';
    }

    setUIConfiguration(uiConfiguration: UIConfiguration): void {
        this.uiConfiguration.next(uiConfiguration);
    }

    getUIConfiguration(): Observable<UIConfiguration> {
        return this.uiConfiguration.asObservable();
    }

    httpGetUIConfiguration(): Observable<UIConfiguration> {
        return this.http.get<UIConfiguration>('/authoring-services/ui-configuration');
    }
}
