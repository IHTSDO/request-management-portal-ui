import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TemplateService {

    constructor(private http: HttpClient) {
    }

    downloadAPBatchRequestTemplate(): Observable<HttpResponse<Blob>> {
        return this.http.get('/template-service/transformation/template/download', { observe: 'response', responseType: 'blob' });
    }
}
