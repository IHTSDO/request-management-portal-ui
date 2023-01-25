import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Location} from '@angular/common';
import {ExtensionService} from '../../services/extension/extension.service';
import {AuthoringService} from '../../services/authoring/authoring.service';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-snomed-navbar',
    templateUrl: './snomed-navbar.component.html',
    styleUrls: ['./snomed-navbar.component.scss']
})
export class SnomedNavbarComponent implements OnInit {

    environment: string;

    extension: any;
    extensionSubscription: Subscription;
    language: any;
    languageSubscription: Subscription;
    configuration: any;
    configurationSubscription: Subscription;

    constructor(private translate: TranslateService,
                private location: Location,
                private extensionService: ExtensionService,
                private authoringService: AuthoringService) {
        this.environment = window.location.host.split(/[.]/)[0];
        this.extensionSubscription = this.extensionService.getExtension().subscribe(data => this.extension = data);
        this.languageSubscription = this.extensionService.getLanguage().subscribe(data => this.language = data);
        this.configurationSubscription = this.authoringService.getConfig().subscribe(data => this.configuration = data);
    }

    ngOnInit() {
        this.authoringService.getConfigurationJSON().subscribe(config => {
            this.authoringService.setConfig(config);

            if (this.environment.includes('local')) {
                this.extensionService.setExtension(this.configuration.extensions.find(extension => extension.code === 'en'));
            } else if (this.environment.includes('dev')) {
                this.extensionService.setExtension(this.configuration.extensions.find(extension => extension.code === this.environment.slice(4,6)));
            } else if (!this.environment.includes('local')) {
                this.extensionService.setExtension(this.configuration.extensions.find(extension => extension.code === this.environment.slice(0,2)));
            }

            let urlLanguage = this.location.path().slice(1);

            if (this.configuration.languages.some(lang => lang.languageCode === urlLanguage)) {
                this.extensionService.setLanguage(this.configuration.languages.find(language => language.languageCode === urlLanguage));
            } else {
                this.extensionService.setLanguage(this.configuration.languages.find(language => language.languageCode === this.extension.defaultLanguage));
            }

            this.location.replaceState(this.language.languageCode);
            this.translate.use(this.language.languageCode);
        });
    }

    changeLanguage(lang: string) {
        this.extensionService.setLanguage(this.configuration.languages.find(language => language.languageCode === lang));

        this.location.replaceState(this.language.languageCode);
        this.translate.use(this.language.languageCode);
    }
}
