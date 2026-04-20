import { Injectable } from '@angular/core';
import { UIConfiguration } from '../../models/uiConfiguration';
import { HttpClient } from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {Request, RequestAttachment, RequestComment} from '../../models/request';

function normalizeAttachment(raw: any): RequestAttachment | null {
    if (raw == null) {
        return null;
    }
    const id = raw.id ?? raw.attachmentId;
    if (id == null) {
        return null;
    }
    const fileName = raw.fileName ?? raw.filename ?? raw.name ?? 'attachment';
    return {
        id,
        fileName,
        sizeBytes: raw.sizeBytes ?? raw.size,
        created: raw.created ?? raw.createdDate ?? raw.uploadedAt,
        downloadUrl: raw.downloadUrl ?? raw.url ?? raw.href
    };
}

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

    httpDeleteComment(commentId: number) {
        return this.http.delete('/authoring-services/rmp-tasks/comments/' + commentId + '/');
    }

    httpPostComment(id: number, comment: RequestComment): Observable<RequestComment> {
        return this.http.post<RequestComment>('/authoring-services/rmp-tasks/' + id + '/comment', comment);
    }

    httpGetRequestAttachments(requestId: string | number): Observable<RequestAttachment[]> {
        return this.http.get<any>('/authoring-services/rmp-tasks/' + requestId + '/attachments').pipe(
            map((body) => {
                let items: any[] = [];
                if (Array.isArray(body)) {
                    items = body;
                } else if (Array.isArray(body?.content)) {
                    items = body.content;
                } else if (Array.isArray(body?.attachments)) {
                    items = body.attachments;
                }
                return items.map(normalizeAttachment).filter((a): a is RequestAttachment => a != null);
            })
        );
    }

    httpPostRequestAttachment(requestId: string | number, file: File): Observable<RequestAttachment> {
        const formData = new FormData();
        formData.append('file', file, file.name);
        return this.http.post<any>('/authoring-services/rmp-tasks/' + requestId + '/attachments', formData).pipe(
            map((raw) => {
                const normalized = normalizeAttachment(raw);
                return normalized ?? { id: raw?.id ?? Date.now(), fileName: file.name };
            })
        );
    }

    httpDeleteRequestAttachment(requestId: string | number, attachmentId: string | number): Observable<unknown> {
        return this.http.delete('/authoring-services/rmp-tasks/' + requestId + '/attachments/' + attachmentId);
    }

    httpGetUsersByRole(roleName: string): Observable<any> {
        return this.http.get('/authoring-services/users?groupName=' + roleName + '&offset=0&limit=100');
    }

    getTypeahead(country: string, term: string) {
        let branchPath: string = '';

        if (country) {
            branchPath = '/SNOMEDCT-' + country.toUpperCase();
        }

        return this.http.get('/term-server/snomed-ct/MAIN' + branchPath + '/concepts?activeFilter=true&termActive=true&limit=20&term=' + term)
            .pipe(map(responseData => {
                const typeaheads = [];

                if (responseData['items']) {
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

    getConcept(country: string, conceptId: string): Observable<any> {
        let branchPath: string = '';

        if (country) {
            branchPath = '/SNOMEDCT-' + country.toUpperCase();
        }

        return this.http.get('/term-server/snomed-ct/browser/MAIN' + branchPath + '/concepts/' + conceptId);
    }
}
