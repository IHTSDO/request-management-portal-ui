import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-snomed-navbar',
    templateUrl: './snomed-navbar.component.html',
    styleUrls: ['./snomed-navbar.component.scss']
})
export class SnomedNavbarComponent implements OnInit {

    environment: string;

    siteLocale = 'en';
    siteFlag: string;
    languageList = [
        {
            code: 'en',
            flag: 'gb',
            label: 'English'
        },
        {
            code: 'dk',
            flag: 'dk',
            label: 'Dansk'
        }
    ];

    constructor() {
        this.environment = window.location.host.split(/[.]/)[0].split(/[-]/)[0];
    }

    ngOnInit() {
        this.siteLocale = window.location.pathname.split('/')[1];
        this.siteFlag = this.languageList.find(f => f.code === this.siteLocale).flag;
    }
}
