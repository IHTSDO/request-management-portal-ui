import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImsService {

  constructor(private http: HttpClient) {
  }
  
  httpGetUser(username: string): Observable<any> {
    return this.http.get('/ims-api/user?username=' + username); 
  }
}
