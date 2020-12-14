import { Component, OnInit, ViewChild } from '@angular/core';
import { Request } from "../../models/request";
import { JiraService } from "../../services/jira/jira.service";
import { ToastrService } from "ngx-toastr";
import { User } from "../../models/user";
import { AuthenticationService } from "../../services/authentication/authentication.service";

@Component({
    selector: 'app-other-form',
    templateUrl: './other-form.component.html',
    styleUrls: ['./other-form.component.scss']
})
export class OtherFormComponent implements OnInit {

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

                this.jiraService.postJiraIssue(this.request, '10309').subscribe(data => {
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

    customReset() {
    }
}
