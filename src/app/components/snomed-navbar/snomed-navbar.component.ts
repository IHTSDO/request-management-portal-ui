import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-snomed-navbar',
    templateUrl: './snomed-navbar.component.html',
    styleUrls: ['./snomed-navbar.component.scss']
})
export class SnomedNavbarComponent implements OnInit {

    environment: string;
    siteFlag: string;
    siteFlagLabel: string;
    defaultlanguageList = [
        {
            code: 'en',
            flag: 'gb',
            label: 'English'
        },
        {
            code: 'dk',
            flag: 'dk',
            label: 'Dansk'
        },
        {
            code: 'de',
            flag: 'de',
            label: 'Deutsche'
        },
        {
            code: 'local',
            flag: 'gb',
            label: 'Localhost'
        }
    ];

    constructor() {
        this.environment = window.location.host.split(/[.]/)[0].split(/[-]/)[0];

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
