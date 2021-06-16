import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {AuthenticationService} from '../../services/authentication/authentication.service';

@Component({
    selector: 'app-instance',
    templateUrl: './instance.component.html',
    styleUrls: ['./instance.component.scss']
})
export class InstanceComponent implements OnInit {

    authenticated: boolean;
    authenticatedSubscription: Subscription;

    constructor(private authService: AuthenticationService) {
        this.authenticatedSubscription = this.authService.getAuthenticated().subscribe(data => this.authenticated = data);
    }

    ngOnInit(): void {
    }

}
