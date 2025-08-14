import {Component, OnInit} from '@angular/core';
import {User} from '../../models/user';
import {Subscription} from 'rxjs';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import {NgIf} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {LanguageService} from '../../services/language/language.service';
import {NavigationService} from '../../services/navigation/navigation.service';

@Component({
    selector: 'app-dashboard',
    imports: [NgIf, TranslatePipe],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

    user!: User;
    userSubscription: Subscription;

    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly languageService: LanguageService,
        private readonly navigationService: NavigationService
    ) {
        this.userSubscription = this.authenticationService.getUser().subscribe(data => this.user = data);
    }

    ngOnInit(): void {
        this.languageService.initializeLanguageFromUrl();
    }

    navigateToCountry(country: string): void {
        this.navigationService.navigateWithLanguage([country]);
    }
}
