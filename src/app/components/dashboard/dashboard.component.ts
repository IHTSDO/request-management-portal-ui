import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {User} from '../../models/user';
import {Subscription} from 'rxjs';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import {NgIf} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
    selector: 'app-dashboard',
    imports: [RouterLink, NgIf, TranslatePipe],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

    user!: User;
    userSubscription: Subscription;

    constructor(private readonly authenticationService: AuthenticationService) {
        this.userSubscription = this.authenticationService.getUser().subscribe(data => this.user = data);
    }
}
