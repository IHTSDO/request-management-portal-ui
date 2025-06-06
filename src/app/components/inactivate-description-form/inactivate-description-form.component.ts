import { Component, OnInit, ViewChild } from '@angular/core';
import { Request } from '../../models/request';
import { SnomedUtilityService } from '../../services/snomedUtility/snomed-utility.service';
import {Observable, Subscription} from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { TerminologyServerService } from '../../services/terminologyServer/terminology-server.service';
import { JiraService } from '../../services/jira/jira.service';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import {ExtensionService} from '../../services/extension/extension.service';

@Component({
    selector: 'app-inactivate-description-form',
    templateUrl: './inactivate-description-form.component.html',
    styleUrls: ['./inactivate-description-form.component.scss']
})
export class InactivateDescriptionFormComponent implements OnInit {

    @ViewChild('requestForm') requestForm;
    request: Request = new Request('', '', '');

    private extension: any;
    private extensionSubscription: Subscription;
    // typeahead
    search = (text$: Observable<string>) => text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => {
            if (this.extension.code.includes('kr')) {
                if (term.length < 1) {
                    return [];
                } else {
                    return this.terminologyService.getTypeahead(term);
                }
            } else {
                if (term.length < 3) {
                    return [];
                } else {
                    return this.terminologyService.getTypeahead(term);
                }
            }
        })
    )

    constructor(private terminologyService: TerminologyServerService,
                private jiraService: JiraService,
                private toastr: ToastrService,
                private authService: AuthenticationService,
                private extensionService: ExtensionService) {
        this.extensionSubscription = this.extensionService.getExtension().subscribe(data => this.extension = data);
    }

    ngOnInit(): void {
    }

    submitRequest() {
        this.authService.getLoggedInUser().subscribe(response => {
                this.authService.setAuthenticated(true);

                this.jiraService.postJiraIssue(this.request, '11510').subscribe(data => {
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

    populateConceptFields(event) {
        this.request.conceptId = SnomedUtilityService.getIdFromShortConcept(event.item);
        this.request.conceptName = SnomedUtilityService.getFsnFromShortConcept(event.item);
    }
}
