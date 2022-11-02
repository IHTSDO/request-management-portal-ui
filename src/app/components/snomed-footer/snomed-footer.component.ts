import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {InstanceService} from '../../services/instance/instance.service';
import {AuthoringService} from '../../services/authoring/authoring.service';

@Component({
    selector: 'app-snomed-footer',
    templateUrl: './snomed-footer.component.html',
    styleUrls: ['./snomed-footer.component.scss']
})
export class SnomedFooterComponent implements OnInit {

    year: number = new Date().getFullYear();
    instance: any;
    instanceSubscription: Subscription;
    configuration: any;
    configurationSubscription: Subscription;

    constructor(private instanceService: InstanceService,
                private authoringService: AuthoringService) {
        this.instanceSubscription = this.instanceService.getInstance().subscribe(data => this.instance = data);
        this.configurationSubscription = this.authoringService.getConfig().subscribe(data => this.configuration = data);
    }

    ngOnInit() {
    }
}
