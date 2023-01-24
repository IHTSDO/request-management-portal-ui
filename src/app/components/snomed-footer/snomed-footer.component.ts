import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {ExtensionService} from '../../services/extension/extension.service';
import {AuthoringService} from '../../services/authoring/authoring.service';

@Component({
    selector: 'app-snomed-footer',
    templateUrl: './snomed-footer.component.html',
    styleUrls: ['./snomed-footer.component.scss']
})
export class SnomedFooterComponent implements OnInit {

    year: number = new Date().getFullYear();
    extension: any;
    extensionSubscription: Subscription;
    configuration: any;
    configurationSubscription: Subscription;

    constructor(private extensionService: ExtensionService,
                private authoringService: AuthoringService) {
        this.extensionSubscription = this.extensionService.getExtension().subscribe(data => this.extension = data);
        this.configurationSubscription = this.authoringService.getConfig().subscribe(data => this.configuration = data);
    }

    ngOnInit() {
    }
}
