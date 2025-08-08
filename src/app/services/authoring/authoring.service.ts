import { Injectable } from '@angular/core';
import { UIConfiguration } from '../../models/uiConfiguration';
import { HttpClient } from '@angular/common/http';
import {map, Observable, Subject, of} from 'rxjs';
import {Request, RequestComment} from '../../models/request';

@Injectable({ providedIn: 'root' })
export class AuthoringService {

    uiConfig: UIConfiguration;

    constructor(private http: HttpClient) {
    }

    httpGetUIConfiguration(): Observable<UIConfiguration> {
        return this.http.get<UIConfiguration>('/authoring-services/ui-configuration');
    }

    httpGetRMPRequests(country, pageSize = 100,  pageIndex = 0, sort: string = 'updatedDate,desc', status?: string[]): Observable<any> {
        let url = '/authoring-services/rmp-tasks?country=' + country + '&page=' + pageIndex + '&size=' + pageSize + '&sort=' + sort;
        if (status?.length > 0) url += '&statuses=' + status.join(',');
        return this.http.get<any>(url);
    }

    searchRMPTask(country: string, searchText: string, pageSize = 100, pageIndex = 0, sort: string = 'updatedDate,desc', status?: string[], assignees?: string[], reporters?: string[]): any {
        let url = '/authoring-services/rmp-tasks/search?country=' + country + '&criteria=' + searchText + '&page=' + pageIndex + '&size=' + pageSize + '&sort=' + sort;
        if (status?.length > 0) url += '&statuses=' + status.join(',');
        if (assignees?.length > 0) url += '&assignees=' + assignees.join(',');
        if (reporters?.length > 0) url += '&reporters=' + reporters.join(',');
        return this.http.get<any>(url);
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

    httpPostComment(id: number, comment: RequestComment): Observable<RequestComment> {
        return this.http.post<RequestComment>('/authoring-services/rmp-tasks/' + id + '/comment', comment);
    }

    httpGetUsersByRole(roleName: string): Observable<any> {
        return this.http.get('/authoring-services/users?groupName=' + roleName + '&offset=0&limit=100');
    }

    httpGetTypeahead(text: string, country: string): Observable<any> {
        const params = {
            termFilter: text,
            limit: 20,
            expand: 'fsn()',
            activeFilter: true,
            termActive: true
        };

        return this.http.get(this.uiConfig.endpoints.terminologyServerEndpoint + 'MAIN/SNOMEDCT-' + country.toUpperCase() + '/concepts?activeFilter=true&termActive=true&limit=20&term=' + text)
            .pipe(map(responseData => {
                const typeaheads = [];

                responseData['items'].forEach((item) => {
                    typeaheads.push(item.id + ' |' + item.fsn.term + '|');
                });

                return typeaheads;
            }));
    }

    getTypeahead(country: string, term: string) {
        if (!this.uiConfig || !this.uiConfig.endpoints || !this.uiConfig.endpoints.terminologyServerEndpoint) {
            console.warn('UI configuration not loaded yet');
            return of([]);
        }

        const params = {
            termFilter: term,
            limit: 20,
            expand: 'fsn()',
            activeFilter: true,
            termActive: true
        };

        let branchPath: string = '';

        if (country) {
            branchPath = '/SNOMEDCT-' + country.toUpperCase();
        }

        return this.http.get(this.uiConfig.endpoints.terminologyServerEndpoint + 'MAIN' + branchPath + '/concepts?activeFilter=true&termActive=true&limit=20&term=' + term)
            .pipe(map(responseData => {
                const typeaheads = [];

                if (responseData && responseData['items']) {
                    responseData['items'].forEach((item) => {
                        typeaheads.push(this.convertShortConceptToString(item));
                    });
                }

                return typeaheads;
            }));
    }

    convertShortConceptToString(input): string {
        return input.id + ' |' + input.fsn.term + '|';
    }
}
