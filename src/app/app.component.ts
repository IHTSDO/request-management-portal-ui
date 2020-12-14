import { Component, OnInit } from '@angular/core';
import 'jquery';
import { Title } from '@angular/platform-browser';
import { AuthoringService } from './services/authoring/authoring.service';
import { BranchingService } from './services/branching/branching.service';
import { TerminologyServerService } from './services/terminologyServer/terminology-server.service';
import { Configuration } from './models/configuration';
import { AuthenticationService } from './services/authentication/authentication.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    versions: object;
    environment: string;

    authenticated: boolean;
    authenticatedSubscription: Subscription;

    constructor(private authoringService: AuthoringService,
                private branchingService: BranchingService,
                private titleService: Title,
                private terminologyService: TerminologyServerService,
                private authService: AuthenticationService) {
        this.authenticatedSubscription = this.authService.getAuthenticated().subscribe(data => this.authenticated = data);
    }

    ngOnInit() {
        this.titleService.setTitle('SNOMED CT Request Management Portal');
        this.environment = window.location.host.split(/[.]/)[0].split(/[-]/)[0];

        this.authoringService.getVersions().subscribe(versions => {
            this.versions = versions;
        });

        this.authoringService.getConfigurationJSON().subscribe(config => {
            const configuration: Configuration = config;

            configuration.extension = config.extensions.find(item => {
                return item.key.toLowerCase() === this.environment;
            });

            this.authoringService.setConfig(configuration);

            this.terminologyService.getVersions(false).subscribe(versions => {
                versions.items.reverse();
                this.branchingService.setBranchPath(versions.items[0].branchPath);
            });
        });

        this.assignFavicon();
    }

    assignFavicon() {
        const favicon = $('#favicon');

        switch (this.environment) {
            case 'local':
                favicon.attr('href', 'favicon_grey.ico');
                break;
            case 'dev':
                favicon.attr('href', 'favicon_red.ico');
                break;
            case 'uat':
                favicon.attr('href', 'favicon_green.ico');
                break;
            case 'training':
                favicon.attr('href', 'favicon_yellow.ico');
                break;
            default:
                favicon.attr('href', 'favicon.ico');
                break;
        }
    }
}
