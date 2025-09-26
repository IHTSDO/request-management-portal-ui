import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Login, User} from '../../models/user';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import { AuthoringService } from '../authoring/authoring.service';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    private user = new BehaviorSubject<User>(undefined!);
    private referer = new BehaviorSubject<string>('');

    constructor(private http: HttpClient, private authoringService: AuthoringService) {
    }

    setUser(user: User) {
        this.user.next(user);
    }

    getUser() {
        return this.user.asObservable();
    }

    setReferer(referer: string) {
        this.referer.next(referer);
    }

    getReferer() {
        return this.referer.asObservable();
    }

    httpGetUser() {
        return this.http.get<User>('/auth');
    }

    logout() {
        window.location.href =
            this.authoringService.uiConfig.endpoints.imsEndpoint + 'logout?serviceReferer=' + window.location.href;
    }
}
