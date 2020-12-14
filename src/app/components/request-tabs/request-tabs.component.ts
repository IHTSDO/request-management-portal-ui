import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-request-form',
    templateUrl: './request-tabs.component.html',
    styleUrls: ['./request-tabs.component.scss']
})
export class RequestTabsComponent implements OnInit {

    requestType = 'addConcept';

    constructor() {
    }

    ngOnInit(): void {
        // this.jiraService.postJiraIssue(this.request).subscribe(data => {
        //     console.log('response: ', data);
        // });
    }
}
