import {Component, OnInit} from '@angular/core';
import {User} from "../../models/user";
import {Subscription} from "rxjs";
import {AuthenticationService} from "../../services/authentication/authentication.service";
import {NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault} from "@angular/common";
import {Router} from '@angular/router';
import {TranslateService, TranslatePipe} from "@ngx-translate/core";
import {Extension} from '../../models/extension';
import * as data from 'public/config/config.json';
import {AuthoringService} from '../../services/authoring/authoring.service';
import {LanguageService} from '../../services/language/language.service';
import {SUPPORTED_LANGUAGES} from '../../constants/languages';
import {NavigationService} from '../../services/navigation/navigation.service';
import {ConfigService, LauncherApp} from '../../services/config/config.service';

@Component({
    selector: 'app-snomed-navbar',
    standalone: true,
    imports: [NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, TranslatePipe],
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

    apps: LauncherApp[] = [];

    constructor(private readonly authenticationService: AuthenticationService,
                private readonly router: Router,
                private readonly authoringService: AuthoringService,
                private readonly configService: ConfigService,
                public translate: TranslateService,
                private readonly languageService: LanguageService,
                private readonly navigationService: NavigationService) {
        this.userSubscription = this.authenticationService.getUser().subscribe(data => {
            this.user = data;
            const allApps = this.configService.getLauncherApps();
            this.apps = allApps.filter(a => !a.clientName || this.user.clientAccess.includes(a.clientName));
        });
        this.extensionSubscription = this.configService.getExtension().subscribe(extension => this.extension = extension);
        this.router.events.subscribe(() => this.closeMenus());
        this.translate.addLangs(SUPPORTED_LANGUAGES);
    }

    ngOnInit() {
        this.environment = window.location.host.split(/[.]/)[0].split(/[-]/)[0];
        this.languageService.initializeLanguageFromUrl();
    }

    setTranslation(language: string): void {
        this.languageService.setLanguage(language);
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

    appsByGroup(group: number): LauncherApp[] {
        return this.apps.filter(a => (a.group ?? 4) === group);
    }

    navigateTo(location: string): void {
        window.location.href = this.authoringService.uiConfig.endpoints.imsEndpoint + location;
    }

    redirectTo(url: string): void {
        window.open(url, '_blank');
    }

    logout(): void {
        this.authenticationService.logout();
    }

    navigateToHome(): void {
        this.navigationService.navigateWithLanguage(['']);
    }
}
