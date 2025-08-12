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

    httpUpdateUser(user: User) {
        return this.http.put<User>('/api/user?username=' + user.login, user);
    }

    httpLogin(loginInformation: Login) {
        return this.http.post<Login>('/api/authenticate', loginInformation);
    }

    httpLogout() {
        return this.http.post<Login>('/api/account/logout', {});
    }

    httpUpdatePassword(password: string) {
        return this.http.put('/api/user/password', { newPassword: password });
    }
}
