import { Injectable } from '@angular/core';
import { UIConfiguration } from '../../models/uiConfiguration';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import {Request, RequestComment} from '../../models/request';

@Injectable({ providedIn: 'root' })
export class AuthoringService {

    // public environmentEndpoint: string;
    private uiConfiguration: Subject<UIConfiguration> = new Subject<UIConfiguration>();

    constructor(private http: HttpClient) {
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

    httpGetRMPRequests(country, pageSize = 10,  pageIndex = 0, sort: string = 'updatedDate,desc'): Observable<any> {
        return this.http.get<any>('/authoring-services/rmp-tasks?country=' + country + '&page=' + pageIndex + '&size=' + pageSize + '&sort=' + sort);
    }

    searchRMPTask(country: string, searchText: string, pageSize = 10, pageIndex = 0, sort: string = 'updatedDate,desc'): any {
        return this.http.get<any>('/authoring-services/rmp-tasks/search?country=' + country + '&criteria=' + searchText + '&page=' + pageIndex + '&size=' + pageSize + '&sort=' + sort);
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

    httpPutRMPRequest(request: Request): Observable<Request> {
        return this.http.put<Request>('/authoring-services/rmp-tasks/' + request.id, request);
    }

    httpGetComments(id: string): Observable<RequestComment[]> {
        return this.http.get<RequestComment[]>('/authoring-services/rmp-tasks/' + id + '/comment');
    }

    httpPostComment(id: string, comment: RequestComment): Observable<RequestComment> {
        return this.http.post<RequestComment>('/authoring-services/rmp-tasks/' + id + '/comment', comment);
    }
}
