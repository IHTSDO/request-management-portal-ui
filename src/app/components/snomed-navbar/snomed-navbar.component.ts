import { Component, OnInit } from '@angular/core';

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
    defaultlanguageList = [
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
            code: 'dk',
            flag: 'dk',
            label: 'Dansk',
            title: 'Danish'
        },
        {
            code: 'de',
            flag: 'de',
            label: 'Deutsche',
            title: 'German'
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
            code: 'nz',
            flag: 'nz',
            label: 'New Zealand',
            title: 'New Zealand'
        },
        {
            code: 'local',
            flag: 'local',
            label: 'Localhost',
            title: 'Localhost'
        }
    ];

    constructor() {
        this.environment = window.location.host.split(/[.]/)[0].split(/[-]/)[0];
        console.log('environment: ', this.environment);
        this.environmentName = this.defaultlanguageList.find(f => f.code === this.environment).title;
        console.log('environmentName: ', this.environmentName);
    }

    ngOnInit() {
        console.log(window.location);
        if (window.location.pathname === '/') {
            this.siteFlag = this.defaultlanguageList.find(f => f.code === this.environment).flag;
            this.siteFlagLabel = this.defaultlanguageList.find(f => f.code === this.environment).label;
            console.log('siteFlag: ', this.siteFlag);
            console.log('siteFlagLabel: ', this.siteFlagLabel);
        } else {
            this.siteFlag = this.defaultlanguageList.find(f => f.code === window.location.pathname.match(/.{2}$/).pop()).flag;
            this.siteFlagLabel = this.defaultlanguageList.find(f => f.code === window.location.pathname.match(/.{2}$/).pop()).label;
            console.log('siteFlag: ', this.siteFlag);
            console.log('siteFlagLabel: ', this.siteFlagLabel);
        }
    }

    isDashboard(): boolean {
        return window.location.pathname.includes('dashboard');
    }
}
