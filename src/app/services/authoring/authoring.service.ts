import { Injectable, InjectionToken } from '@angular/core';
import { UIConfiguration } from '../../models/uiConfiguration';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Request } from 'src/app/models/request';

export const WINDOW = new InjectionToken<Window>("WINDOW", {
    factory: () => (typeof window !== "undefined" ? window : ({} as Window)),
});

@Injectable({ providedIn: 'root' })
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

    httpGetRMPRequests(country, pageIndex = 0, pageSize = 10): Observable<any> {
        return this.http.get<any>('/authoring-services/rmp-tasks?country=' + country + '&page=' + pageIndex + '&size=' + pageSize);
    }

    searchRMPTask(country: string, searchText: string, pageIndex = 0, pageSize = 10): any {
        return this.http.get<any>('/authoring-services/rmp-tasks/search?country=' + country + '&criteria=' + searchText + '&page=' + pageIndex + '&size=' + pageSize);
    }

    httpGetRMPRequestDetails(requestId): Observable<any> {
        return this.http.get<any>('/authoring-services/rmp-tasks/' + requestId);
    }

    httpDeleteRMPRequest(id: number) {
        return this.http.delete('/authoring-services/rmp-tasks/' + id);
    }

    httpCreateRMPRequest(request: Request): Observable<Request> {
        const requestBody = {
            ...request
        };
        delete requestBody.id; // Ensure id is not sent in the request body
        delete requestBody.created; // Ensure created is not sent in the request body
        delete requestBody.updated; // Ensure updated is not sent in the request body

        return this.http.post<Request>('/authoring-services/rmp-tasks', requestBody);
    }
}
