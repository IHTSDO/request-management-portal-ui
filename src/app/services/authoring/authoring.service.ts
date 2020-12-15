import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Configuration } from '../../models/configuration';

@Injectable({
    providedIn: 'root'
})
export class AuthoringService {

    public environmentEndpoint: string;
    private configuration = new Subject<Configuration>();

    constructor(private http: HttpClient) {
        this.environmentEndpoint = window.location.origin + '/';
    }

    // Setters & Getters: Configuration
    setConfig(config) {
        this.configuration.next(config);
    }

    getConfig(): Observable<Configuration> {
        return this.configuration.asObservable();
    }

    getConfigurationJSON(): Observable<Configuration> {
        return this.http.get<Configuration>('./assets/configuration.json');
    }
}
