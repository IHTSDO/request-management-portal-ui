import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Location} from '@angular/common';
import {InstanceService} from '../../services/instance/instance.service';
import {AuthoringService} from '../../services/authoring/authoring.service';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-snomed-navbar',
    templateUrl: './snomed-navbar.component.html',
    styleUrls: ['./snomed-navbar.component.scss']
})
export class SnomedNavbarComponent implements OnInit {

    environment: string;

    instance: any;
    instanceSubscription: Subscription;
    language: any;
    languageSubscription: Subscription;
    configuration: any;
    configurationSubscription: Subscription;

    constructor(private translate: TranslateService,
                private location: Location,
                private instanceService: InstanceService,
                private authoringService: AuthoringService) {
        this.environment = window.location.host.split(/[.]/)[0];
        this.instanceSubscription = this.instanceService.getInstance().subscribe(data => this.instance = data);
        this.languageSubscription = this.instanceService.getLanguage().subscribe(data => this.language = data);
        this.configurationSubscription = this.authoringService.getConfig().subscribe(data => this.configuration = data);
    }

    ngOnInit() {
        this.authoringService.getConfigurationJSON().subscribe(config => {
            this.authoringService.setConfig(config);

            if (this.environment.includes('local')) {
                console.log('this.configuration: ', this.configuration);
                this.instanceService.setInstance(this.configuration.instances?.find(instance => instance.code === 'en'));
            } else if (this.environment.includes('dev')) {
                console.log('this.configuration: ', this.configuration);
                this.instanceService.setInstance(this.configuration.instances?.find(instance => instance.code === this.environment.slice(4,6)));
            } else if (!this.environment.includes('local')) {
                this.instanceService.setInstance(this.configuration.instances?.find(instance => instance.code === this.environment.slice(0,2)));
            }

            let urlLanguage = this.location.path().slice(1);

            if (this.configuration.languages?.some(lang => lang.languageCode === urlLanguage)) {
                this.instanceService.setLanguage(this.configuration.languages?.find(language => language.languageCode === urlLanguage));
            } else {
                this.instanceService.setLanguage(this.configuration.languages?.find(language => language.languageCode === this.instance.defaultLanguage));
            }

            this.location.replaceState(this.language?.languageCode);
            this.translate.use(this.language?.languageCode);
        });
    }

    changeLanguage(lang: string) {
        this.instanceService.setLanguage(this.configuration.languages.find(language => language.languageCode === lang));

        this.location.replaceState(this.language.languageCode);
        this.translate.use(this.language.languageCode);
    }
}
