import { Component, OnInit } from '@angular/core';
import { AuthoringService } from '../../services/authoring/authoring.service';
import { Configuration } from '../../models/configuration';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-snomed-footer',
    templateUrl: './snomed-footer.component.html',
    styleUrls: ['./snomed-footer.component.scss']
})
export class SnomedFooterComponent implements OnInit {

    year: number = new Date().getFullYear();
    configuration: Configuration;
    configurationSubscription: Subscription;

    constructor(private authoringService: AuthoringService) {
        this.configurationSubscription = this.authoringService.getConfig().subscribe(data => this.configuration = data);
    }

    ngOnInit() {
    }
}
