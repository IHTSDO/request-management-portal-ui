import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    private user = new BehaviorSubject<User>({username: '', password: ''});
    private authenticated = new BehaviorSubject<boolean>(false);

    private account: User;
    private accountSubscription: Subscription;

    constructor(private http: HttpClient) {
        this.accountSubscription = this.getUser().subscribe(data => this.account = data);
    }

    setUser(user) {
        this.user.next(user);
    }

    getUser(): Observable<User> {
        return this.user.asObservable();
    }

    setAuthenticated(status) {
        this.authenticated.next(status);
    }

    getAuthenticated(): Observable<boolean> {
        return this.authenticated.asObservable();
    }

    getLoggedInUser() {
        return this.http.post<User>('/auth', this.account);
    }
}
