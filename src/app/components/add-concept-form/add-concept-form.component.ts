import { Component, OnInit, ViewChild } from '@angular/core';
import { Request } from "../../models/request";
import { JiraService } from "../../services/jira/jira.service";
import { ToastrService } from "ngx-toastr";
import { AuthenticationService } from "../../services/authentication/authentication.service";

@Component({
    selector: 'app-add-concept-form',
    templateUrl: './add-concept-form.component.html',
    styleUrls: ['./add-concept-form.component.scss']
})
export class AddConceptFormComponent implements OnInit {

    @ViewChild('requestForm') requestForm;
    request: Request = new Request('', '', '');

    constructor(private jiraService: JiraService,
                private toastr: ToastrService,
                private authService: AuthenticationService) {
    }

    ngOnInit(): void {
    }

    submitRequest() {
        this.authService.getLoggedInUser().subscribe(response => {
            this.authService.setAuthenticated(true);

            this.jiraService.postJiraIssue(this.request, '11505').subscribe(data => {
                    this.toastr.success(data['key'] + ' created', 'SUCCESS', {closeButton: true, disableTimeOut: true});
                    this.requestForm.reset();
                },
                error => {
                    this.toastr.error('Unable to create ticket', 'ERROR', {closeButton: true, disableTimeOut: true});
                });
        },
        error => {
            this.toastr.error('Unable to verify user', 'ERROR', {closeButton: true, disableTimeOut: true});
        });
    }
}
