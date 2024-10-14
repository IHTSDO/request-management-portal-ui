import {Component, Inject, OnInit} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthoringService } from './services/authoring/authoring.service';
import { BranchingService } from './services/branching/branching.service';
import { TerminologyServerService } from './services/terminologyServer/terminology-server.service';
import { AuthenticationService } from './services/authentication/authentication.service';
import { Subscription } from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {DOCUMENT} from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    environment: string;

    authenticated: boolean;
    authenticatedSubscription: Subscription;

    constructor(private authoringService: AuthoringService,
                private branchingService: BranchingService,
                private titleService: Title,
                private terminologyService: TerminologyServerService,
                private authService: AuthenticationService,
                private translate: TranslateService,
                @Inject(DOCUMENT) private document: Document) {
        this.authenticatedSubscription = this.authService.getAuthenticated().subscribe(data => this.authenticated = data);
        translate.addLangs(['en', 'dk', 'de', 'it', 'fr', 'nl', 'no_nb', 'no_nn']);
        translate.setDefaultLang('en');
        translate.use('en');
    }

    ngOnInit() {
        this.titleService.setTitle('SNOMED CT Request Management Portal');
        this.environment = window.location.host.split(/[.]/)[0];

        if (this.environment.includes('dev')) {
            this.environment = this.environment.slice(4, 6);
        } else if (!this.environment.includes('local')) {
            this.environment = this.environment.slice(0, 2);
        }

        this.assignFavicon();
    }

    assignFavicon() {
        switch (this.environment) {
            case 'local':
                this.document.getElementById('favicon')?.setAttribute('href', 'favicon_grey.ico');
                break;
            case 'dev':
                this.document.getElementById('favicon')?.setAttribute('href', 'favicon_red.ico');
                break;
            case 'uat':
                this.document.getElementById('favicon')?.setAttribute('href', 'favicon_green.ico');
                break;
            case 'training':
                this.document.getElementById('favicon')?.setAttribute('href', 'favicon_yellow.ico');
                break;
            default:
                this.document.getElementById('favicon')?.setAttribute('href', 'favicon.ico');
                break;
        }
    }
}
