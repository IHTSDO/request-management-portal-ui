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
            code: 'local',
            flag: 'local',
            label: 'Localhost',
            title: 'Localhost'
        }
    ];

    constructor() {
        this.environment = window.location.host.split(/[.]/)[0].split(/[-]/)[0];
        this.environmentName = this.defaultlanguageList.find(f => f.code === this.environment).title;
    }

    ngOnInit() {
        if (window.location.pathname === '/') {
            this.siteFlag = this.defaultlanguageList.find(f => f.code === this.environment).flag;
            this.siteFlagLabel = this.defaultlanguageList.find(f => f.code === this.environment).label;
        } else {
            this.siteFlag = this.defaultlanguageList.find(f => f.code === window.location.pathname.match(/\/(.*)\//).pop()).flag;
            this.siteFlagLabel = this.defaultlanguageList.find(f => f.code === window.location.pathname.match(/\/(.*)\//).pop()).label;
        }


    }
}
