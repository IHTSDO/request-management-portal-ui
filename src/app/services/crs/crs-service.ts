import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CrsService {

    constructor(private http: HttpClient) {
    }

    downloadBatchRequestTemplate(): Observable<HttpResponse<Blob>> {
        return this.http.get('/ihtsdo-crs/api/batch/template/download', { observe: 'response', responseType: 'blob' });
    }
}
