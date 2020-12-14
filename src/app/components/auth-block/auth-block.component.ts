import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { User } from '../../models/user';

@Component({
    selector: 'app-auth-block',
    templateUrl: './auth-block.component.html',
    styleUrls: ['./auth-block.component.scss']
})
export class AuthBlockComponent implements OnInit {

    user: User;
    userSubscription: Subscription;

    constructor(private authService: AuthenticationService) {
        this.userSubscription = this.authService.getUser().subscribe(data => this.user = data);
    }

    ngOnInit(): void {
    }

    updateUser() {
        this.authService.setUser(this.user);
    }
}
