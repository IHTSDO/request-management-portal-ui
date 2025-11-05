import {Component, Inject, OnInit, DOCUMENT} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {SnomedNavbarComponent} from "./components/snomed-navbar/snomed-navbar.component";
import {AuthenticationService} from "./services/authentication/authentication.service";

import {AuthoringService} from './services/authoring/authoring.service';
import {ConfigService} from './services/config/config.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, SnomedNavbarComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    title = 'request-management';

    environment: string = '';
    country: string = '';

    constructor(private readonly authenticationService: AuthenticationService,
                private readonly authoringService: AuthoringService,
                private readonly configService: ConfigService,
                @Inject(DOCUMENT) private readonly document: Document) {
    }

    ngOnInit() {
        this.environment = window.location.host.split(/[.]/)[0].split(/[-]/)[0];

        this.assignFavicon();

        this.authoringService.httpGetUIConfiguration().subscribe(config => {
            this.authoringService.uiConfig = config;
        });

        this.configService.loadConfig().subscribe(data => {
            this.authenticationService.httpGetUser().subscribe(user => {
                this.authenticationService.setUser(user);
            });
        });

    }

    assignFavicon() {
        switch (this.environment) {
            case 'local':
                this.document.getElementById('favicon')!.setAttribute('href', 'favicon_grey.ico');
                break;
            case 'dev':
                this.document.getElementById('favicon')!.setAttribute('href', 'favicon_red.ico');
                break;
            case 'uat':
                this.document.getElementById('favicon')!.setAttribute('href', 'favicon_green.ico');
                break;
            case 'training':
                this.document.getElementById('favicon')!.setAttribute('href', 'favicon_yellow.ico');
                break;
            default:
                this.document.getElementById('favicon')!.setAttribute('href', 'favicon.ico');
                break;
        }
    }
}
