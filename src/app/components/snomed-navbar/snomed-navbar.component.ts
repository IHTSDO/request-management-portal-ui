import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../../models/user';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { JiraService } from "../../services/jira/jira.service";

@Component({
    selector: 'app-snomed-navbar',
    templateUrl: './snomed-navbar.component.html',
    styleUrls: ['./snomed-navbar.component.scss']
})
export class SnomedNavbarComponent implements OnInit {

    environment: string;

    siteLanguage: string = 'en';
    siteLocale: string;
    languageList = [
        { code: 'en', label: 'English' },
        { code: 'fr', label: 'Français' }
    ];

    constructor(private authenticationService: AuthenticationService, private jiraService: JiraService) {
        this.environment = window.location.host.split(/[.]/)[0].split(/[-]/)[0];
    }

    ngOnInit() {
        this.siteLocale = window.location.pathname.split('/')[1];
        this.siteLanguage = this.languageList.find(f => f.code === this.siteLocale).code;
    }
}
