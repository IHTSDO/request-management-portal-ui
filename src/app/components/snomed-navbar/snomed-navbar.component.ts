import {Component, OnInit} from '@angular/core';
import {User} from "../../models/user";
import {Subscription} from "rxjs";
import {AuthenticationService} from "../../services/authentication/authentication.service";
import {NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault} from "@angular/common";
import {Router, RouterLink} from '@angular/router';
import {TranslateService, TranslatePipe} from "@ngx-translate/core";
import {Extension} from '../../models/extension';
import {ConfigService} from '../../services/config/config.service';
import * as data from 'public/config/config.json';

@Component({
    selector: 'app-snomed-navbar',
    standalone: true,
    imports: [NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, TranslatePipe, RouterLink],
    templateUrl: './snomed-navbar.component.html',
    styleUrl: './snomed-navbar.component.scss'
})
export class SnomedNavbarComponent implements OnInit {

    environment: string = '';

    user!: User;
    userSubscription: Subscription;
    extension: Extension;
    extensionSubscription: Subscription;
    expandedUserMenu: boolean = false;
    expandedAppMenu: boolean = false;
    expandedItemMenu: boolean = false;
    expandedLanguageMenu: boolean = false;
    rolesView: boolean = false;
    config: any = data;

    constructor(private readonly authenticationService: AuthenticationService,
                private readonly router: Router,
                private readonly configService: ConfigService,
                public translate: TranslateService) {
        this.userSubscription = this.authenticationService.getUser().subscribe(data => this.user = data);
        this.extensionSubscription = this.configService.getExtension().subscribe(extension => this.extension = extension);
        router.events.subscribe(() => this.closeMenus());
        this.translate.addLangs(['en', 'de', 'dk', 'fr', 'it', 'nl', 'ko']);
        this.translate.setFallbackLang('en');
        this.translate.use('en');
    }

    ngOnInit() {
        this.environment = window.location.host.split(/[.]/)[0].split(/[-]/)[0];
    }

    setTranslation(language: string): void {
        this.translate.use(language);
        this.expandedLanguageMenu = false;
    }

    getFlagFromLanguage(): string {
        return this.config.languages.find(lang => lang.languageCode === this.translate.getCurrentLang()).languageFlag;
    }

    switchMenu(name: string): void {
        switch (name) {
            case 'user':
                this.expandedUserMenu = true;
                this.expandedAppMenu = false;
                this.expandedItemMenu = false;
                this.expandedLanguageMenu = false;
                break;
            case 'app':
                this.expandedUserMenu = false;
                this.expandedAppMenu = true;
                this.expandedItemMenu = false;
                this.expandedLanguageMenu = false;
                break;
            case 'item':
                this.expandedUserMenu = false;
                this.expandedAppMenu = false;
                this.expandedItemMenu = true;
                this.expandedLanguageMenu = false;
                break;
            case 'language':
                this.expandedUserMenu = false;
                this.expandedAppMenu = false;
                this.expandedItemMenu = false;
                this.expandedLanguageMenu = true;
                break;
        }
    }

    closeMenus(): void {
        this.expandedUserMenu = false;
        this.expandedAppMenu = false;
        this.expandedItemMenu = false;
        this.expandedLanguageMenu = false;
        this.rolesView = false;
    }

    openRolesView(): void {
        this.closeMenus();
        this.rolesView = true;
    }

    getInitials(user: User): string {
        let initials = '';

        if (user.firstName) {
            initials += user.firstName?.charAt(0).toUpperCase();
        }

        if (user.lastName) {
            initials += user.lastName?.charAt(0).toUpperCase();
        }

        return initials;
    }

    navigateTo(location: string): void {
        this.router.navigate([location]);
    }

    redirectTo(url: string): void {
        window.open(url, '_blank');
    }

    logout(): void {
        this.authenticationService.httpLogout().subscribe({
            next: () => {
                this.authenticationService.setUser(undefined!);
                this.router.navigate(['/']);
            },
            error: (e) => console.error('error: ', e)
        });
    }
}
