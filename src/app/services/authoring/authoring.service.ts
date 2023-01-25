import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthoringService {

    public environmentEndpoint: string;
    configuration = new Subject();

    constructor(private http: HttpClient) {
        this.environmentEndpoint = window.location.origin + '/';
    }

    // Setters & Getters: Configuration
    setConfig(config) {
        this.configuration.next(config);
    }

    getConfig() {
        return this.configuration.asObservable();
    }

    getConfigurationJSON() {
        return this.http.get('./assets/configuration2.json');
    }
}
