import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';

@Component({
    selector: 'app-snomed-navbar',
    templateUrl: './snomed-navbar.component.html',
    styleUrls: ['./snomed-navbar.component.scss']
})
export class SnomedNavbarComponent implements OnInit {

    environment: string;
    environmentName: string;
    siteFlag: string;
    siteFlagLabel: string;
    instanceList = [
        {
            code: 'en',
            flag: 'gb',
            label: 'English',
            title: 'English'
        },
        {
            code: 'ie',
            flag: 'ie',
            label: 'English',
            title: 'Irish'
        },
        {
            code: 'it',
            flag: 'it',
            label: 'Italiano',
            title: 'Italian'
        },
        {
            code: 'ch',
            flag: 'ch',
            label: 'Swiss',
            title: 'Swiss'
        },
        {
            code: 'dk',
            flag: 'dk',
            label: 'Dansk',
            title: 'Danish'
        },
        {
            code: 'de',
            flag: 'de',
            label: 'Deutsch',
            title: 'German'
        },
        {
            code: 'et',
            flag: 'et',
            label: 'Estonian',
            title: 'Estonian'
        },
        {
            code: 'nl',
            flag: 'nl',
            label: 'Nederlands',
            title: 'Netherlands'
        },
        {
            code: 'fr',
            flag: 'fr',
            label: 'Français',
            title: 'French'
        },
        {
            code: 'be',
            flag: 'be',
            label: 'Belgium',
            title: 'Belgian'
        },
        {
            code: 'no',
            flag: 'no',
            label: 'Norway',
            title: 'Norwegian'
        },
        {
            code: 'no_nb',
            flag: 'no',
            label: 'Bokmål',
            title: 'Norwegian'
        },
        {
            code: 'no_nn',
            flag: 'no',
            label: 'Nynorsk',
            title: 'Norwegian'
        },
        {
            code: 'nz',
            flag: 'nz',
            label: 'New Zealand',
            title: 'New Zealand'
        }
    ];

    constructor(private translate: TranslateService,
                private location: Location,
                private route: ActivatedRoute) {
        this.environment = window.location.host.split(/[.]/)[0];
    }

    ngOnInit() {
        if (this.environment.includes('dev')) {
            this.environment = this.environment.slice(4, 6);
        } else if (!this.environment.includes('local')) {
            this.environment = this.environment.slice(0, 2);
        }

        if (this.languageExists(this.location.path().slice(1))) {
            this.siteFlag = this.instanceList.find(f => f.code === this.location.path().slice(1)).flag;
            this.siteFlagLabel = this.instanceList.find(f => f.code === this.location.path().slice(1)).label;
            this.environmentName = this.instanceList.find(f => f.code === this.location.path().slice(1)).title;
            this.translate.use(this.location.path().slice(1));
        } else {
            this.defaultToEnglish();
        }
    }

    languageExists(lang: string): boolean {
        if (lang) {
            return !!this.instanceList.find(item => item.code === lang);
        }
    }

    defaultToEnglish() {
        this.siteFlag = this.instanceList.find(f => f.code === 'en').flag;
        this.siteFlagLabel = this.instanceList.find(f => f.code === 'en').label;
        this.environmentName = this.instanceList.find(f => f.code === 'en').title;
        this.translate.use('en');
        this.location.replaceState('en');
    }

    changeLanguage(lang: string) {
        this.siteFlag = this.instanceList.find(f => f.code === lang).flag;
        this.siteFlagLabel = this.instanceList.find(f => f.code === lang).label;
        this.translate.use(lang);
    }
}
