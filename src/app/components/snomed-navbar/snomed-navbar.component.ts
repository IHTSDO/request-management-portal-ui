import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Location} from '@angular/common';

@Component({
    selector: 'app-snomed-navbar',
    templateUrl: './snomed-navbar.component.html',
    styleUrls: ['./snomed-navbar.component.scss']
})
export class SnomedNavbarComponent implements OnInit {

    environment: string;

    instance: any;
    language: any;

    instanceList = [
        {
            code: 'en',
            instanceFlag: 'gb',
            instanceName: 'English',
            defaultLanguage: 'en'
        },
        {
            code: 'ie',
            instanceFlag: 'ie',
            instanceName: 'Irish',
            defaultLanguage: 'en'
        },
        {
            code: 'it',
            instanceFlag: 'it',
            instanceName: 'Italian',
            defaultLanguage: 'it'
        },
        {
            code: 'dk',
            instanceFlag: 'dk',
            instanceName: 'Danish',
            defaultLanguage: 'dk'
        },
        {
            code: 'de',
            instanceFlag: 'de',
            instanceName: 'German',
            defaultLanguage: 'de'
        },
        {
            code: 'nl',
            instanceFlag: 'nl',
            instanceName: 'Netherlands',
            defaultLanguage: 'nl'
        },
        {
            code: 'ch',
            instanceFlag: 'ch',
            instanceName: 'Switzerland',
            defaultLanguage: 'de'
        },
        {
            code: 'fr',
            instanceFlag: 'fr',
            instanceName: 'French',
            defaultLanguage: 'fr'
        },
        {
            code: 'be',
            instanceFlag: 'be',
            instanceName: 'Belgian',
            defaultLanguage: 'nl'
        },
        {
            code: 'no',
            instanceFlag: 'no',
            instanceName: 'Norwegian',
            defaultLanguage: 'no_nn'
        },
        {
            code: 'nz',
            instanceFlag: 'nz',
            instanceName: 'New Zealand',
            defaultLanguage: 'en'
        },
        {
            code: 'ee',
            instanceFlag: 'ee',
            instanceName: 'Estonian',
            defaultLanguage: 'en'
        }
    ];

    languageList = [
        {
            languageCode: 'en',
            languageFlag: 'gb',
            languageName: 'English'
        },
        {
            languageCode: 'it',
            languageFlag: 'it',
            languageName: 'Italiano'
        },
        {
            languageCode: 'dk',
            languageFlag: 'dk',
            languageName: 'Dansk'
        },
        {
            languageCode: 'de',
            languageFlag: 'de',
            languageName: 'Deutsch'
        },
        {
            languageCode: 'nl',
            languageFlag: 'nl',
            languageName: 'Nederlands'
        },
        {
            languageCode: 'fr',
            languageFlag: 'fr',
            languageName: 'Français'
        },
        {
            languageCode: 'no_nn',
            languageFlag: 'no',
            languageName: 'Nynorsk'
        },
        {
            languageCode: 'no_nb',
            languageFlag: 'no',
            languageName: 'Bokmål'
        }
    ];

    constructor(private translate: TranslateService,
                private location: Location) {
        this.environment = window.location.host.split(/[.]/)[0];
    }

    ngOnInit() {
        if (this.environment.includes('local')) {
            this.instance = this.instanceList.find(instance => instance.code === 'en');
        } else if (this.environment.includes('dev')) {
            this.instance = this.instanceList.find(instance => instance.code === this.environment.slice(4,6));
        } else if (!this.environment.includes('local')) {
            this.instance = this.instanceList.find(instance => instance.code === this.environment.slice(0,2));
        }

        let urlLanguage = this.location.path().slice(1);

        if (this.languageList.some(lang => lang.languageCode === urlLanguage)) {
            this.language = this.languageList.find(language => language.languageCode === urlLanguage);
        } else {
            this.language = this.languageList.find(language => language.languageCode === this.instance.defaultLanguage);
        }

        this.location.replaceState(this.language.languageCode);
        this.translate.use(this.language.languageCode);
    }

    changeLanguage(lang: string) {
        this.language = this.languageList.find(language => language.languageCode === lang);

        this.location.replaceState(this.language.languageCode);
        this.translate.use(this.language.languageCode);
    }
}
