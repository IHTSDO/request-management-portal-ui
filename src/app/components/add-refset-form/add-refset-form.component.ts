import {Component, ViewChild} from '@angular/core';
import {Request} from '../../models/request';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {JiraService} from '../../services/jira/jira.service';
import {ToastrService} from 'ngx-toastr';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import {TerminologyServerService} from '../../services/terminologyServer/terminology-server.service';

@Component({
    selector: 'app-add-refset-form',
    templateUrl: './add-refset-form.component.html',
    styleUrl: './add-refset-form.component.scss'
})
export class AddRefsetFormComponent {

    @ViewChild('requestForm') requestForm;
    request: Request = new Request('', '', '');

    // typeahead
    search = (text$: Observable<string>) => text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => {
            if (term.length < 3) {
                return [];
            } else {
                return this.terminologyService.getTypeahead(term);
            }
        })
    )

    constructor(private jiraService: JiraService,
                private toastr: ToastrService,
                private authService: AuthenticationService,
                private terminologyService: TerminologyServerService) {
    }

    ngOnInit(): void {
    }

    submitRequest() {
        this.authService.getLoggedInUser().subscribe(response => {
                this.authService.setAuthenticated(true);

                this.jiraService.postJiraIssue(this.request, '12505').subscribe(data => {
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
