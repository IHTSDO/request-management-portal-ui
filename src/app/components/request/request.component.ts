import {FormsModule, NgForm} from '@angular/forms';
import {NgIf, CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Request, RequestComment} from '../../models/request';
import {AuthoringService} from '../../services/authoring/authoring.service';
import {ToastrService} from 'ngx-toastr';
import {StatusTransformPipe} from '../../pipes/status-transform/status-transform.pipe';
import {RequestTypeTransformPipe} from '../../pipes/request-type-transform/request-type-transform.pipe';
import {User} from '../../models/user';
import {BehaviorSubject, debounceTime, of, Subscription, switchMap, tap} from 'rxjs';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import { TranslatePipe } from '@ngx-translate/core';

enum Mode {
    NEW,
    VIEW,
    EDIT
}

@Component({
    selector: 'app-request',
    imports: [CommonModule, FormsModule, NgIf, RouterLink, StatusTransformPipe, RequestTypeTransformPipe, TranslatePipe],
    templateUrl: './request.component.html',
    styleUrl: './request.component.scss',
    providers: [StatusTransformPipe]
})
export class RequestComponent implements OnInit {

    requestComments: RequestComment[] = [];
    user!: User;
    userSubscription: Subscription;
    displayWorkflowDiagram: boolean = false;
    comment: string = '';

    searchText: string = '';
    typeahead = new BehaviorSubject<string>('');
    typeaheadResults: string[] = [];

    ModeType = Mode; // Expose the Mode enum to the template for use in conditionals
    mode: Mode = Mode.NEW; // Default mode is NEW

    public formType: string = 'add-concept';
    public formLangageRefset: string = '';
    public formContextRefset: string = '';

    request: Request;
    requestId: string;
    country: string;

    typeaheadSubscription = this.typeahead.pipe(
        debounceTime(300), // Delay for 300ms after the last event
        tap(() => {
            console.log('yo');
            this.typeaheadResults = [];
        }),
        switchMap(searchText => {
            if (searchText !== '') {
                return this.authoringService.httpGetTypeahead(searchText, this.country)
            } else {
                return of();
            }
        }) // Switch to the new observable, cancels the previous one
    ).subscribe((response: any) => {
        this.typeaheadResults = response;
    });

    constructor(private readonly authoringService: AuthoringService,
                private readonly toastr: ToastrService,
                private readonly authenticationService: AuthenticationService,
                private readonly router: Router,
                private readonly activatedRoute: ActivatedRoute,
                private readonly statusPipe: StatusTransformPipe) {
        this.userSubscription = this.authenticationService.getUser().subscribe(data => this.user = data);
    }

    ngOnInit(): void {
        this.country = this.activatedRoute.snapshot.paramMap.get('country');
        this.requestId = this.activatedRoute.snapshot.paramMap.get('id');
        if (this.requestId) {
            this.mode = Mode.VIEW; // Set mode to view if requestId is present
            this.authoringService.httpGetRMPRequestDetails(this.requestId).subscribe(response => {
                if (response) {
                    this.request = response as Request;
                }
            });
            this.authoringService.httpGetComments(this.requestId).subscribe(response => {
                this.requestComments = response;
            });
        } else {
            this.resetFormValues(); // Reset form values to defaults
        }
    }

    saveRequest(form: NgForm): void {
        if (this.mode === Mode.NEW) {
            if (!form.valid) {
                this.toastr.error('Please fill in all required fields before submitting.', 'Form Incomplete');
                return;
            }

            this.request.type = this.formType; // Set the type based on the form type
            this.request.country = this.country; // Set the country from the route parameter
            this.request.status = 'NEW'; // Default status for new requests
            this.request.languageRefset = this.formLangageRefset; // Set language refset
            this.request.contextRefset = this.formContextRefset; // Set context refset

            this.toastr.info('Creating new request...', 'Please wait');
            this.authoringService.httpCreateRMPRequest(this.request).subscribe(response => {
                    if (response) {
                        this.router.navigate([this.country]); // Navigate to the country page after creation
                        this.request = response as Request;
                        this.toastr.clear(); // Clear any previous toastr messages
                        this.toastr.success('Request with ID: ' + this.request.id + ' has been created successfully.', 'Request Created');
                    }
                }, error => {
                    this.toastr.clear(); // Clear any previous toastr messages
                    this.toastr.error('Failed to create request: ' + error.message, 'Error');
                }
            );
        }
    }

    resetForm(form: NgForm): void {
        const currentFormType = this.formType; // Store current form type
        form.resetForm(); // Reset the form state
        this.resetFormValues(); // Reset form values to defaults
        this.toastr.clear(); // Clear any previous toastr messages

        setTimeout(() => {
            this.formType = currentFormType;
            this.formLangageRefset = ''; // Reset language refset
            this.formContextRefset = ''; // Reset context refset
        }, 0);
    }

    private resetFormValues(): void {
        this.request = new Request(
            null, // id
            '', // type
            'NEW', // status
            this.country, // country
            '', // reporter
            '', // assignee
            '', // summary
            '', // languageRefset
            '', // contextRefset
            '', // concept
            '', // conceptId
            '', // conceptName
            '', // relationshipType
            '', // relationshipTarget
            '', // existingRelationship
            '', // memberConceptIds
            '', // eclQuery
            '', // existingDescription
            '', // newDescription
            '', // newFSN
            '', // newPT
            '', // newSynonyms
            '', // parentConcept
            '', // justification
            '', // reference
            0,  // created timestamp placeholder
            0,   // updated timestamp placeholder
            '', // additionalInformation
            '', // sourceId
            '', // destinationId
            '', // characteristicTypeId
            '' // memberId
        );
    }

    moveTask(transition: string): void {
        let updatedRequest: Request = this.request;
        updatedRequest.status = transition;

        this.authoringService.httpPutRMPRequest(updatedRequest).subscribe({
            next: () => {
                this.toastr.success('#' + updatedRequest.id + ' ' + this.statusPipe.transform(transition), 'SUCCESS');
                this.request.status = transition;
            },
            error: () => {
                this.toastr.error('#' + updatedRequest.id + ' ' + this.statusPipe.transform(transition), 'ERROR');
            }
        });
    }

    postComment(): void {
        let requestComment = new RequestComment(this.request.id, this.comment)

        this.authoringService.httpPostComment(this.request.id, requestComment).subscribe({
            next: () => {
                this.toastr.success('#' + this.request.id + ' Comment Added', 'SUCCESS');
                this.comment = '';
                this.authoringService.httpGetComments(this.requestId).subscribe(response => {
                    this.requestComments = response;
                });
            },
            error: () => {
                this.toastr.error('#' + this.request.id + ' Comment Failed', 'ERROR');
            }
        })
    }

    onTypeaheadInput() {
        this.typeahead.next(this.searchText);
    }

    isStaff(user: User): boolean {
        return user.roles.includes('ROLE_ms-belgium')
            || user.roles.includes('ROLE_ms-denmark')
            || user.roles.includes('ROLE_ms-estonia')
            || user.roles.includes('ROLE_ms-ireland')
            || user.roles.includes('ROLE_ms-newzealand')
            || user.roles.includes('ROLE_ms-france')
            || user.roles.includes('ROLE_ms-switzerland')
            || user.roles.includes('ROLE_ms-korea');
    }

    isUser(user: User): boolean {
        return user.roles.includes('ROLE_rmp-be-requestor')
            || user.roles.includes('ROLE_rmp-dk-requestor')
            || user.roles.includes('ROLE_rmp-ee-requestor')
            || user.roles.includes('ROLE_rmp-ie-requestor')
            || user.roles.includes('ROLE_rmp-nz-requestor')
            || user.roles.includes('ROLE_rmp-fr-requestor')
            || user.roles.includes('ROLE_rmp-ch-requestor')
            || user.roles.includes('ROLE_rmp-kr-requestor');
    }
}
