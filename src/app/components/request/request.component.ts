import { FormsModule, NgForm } from '@angular/forms';
import { NgIf, CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Request, RequestComment } from '../../models/request';
import { AuthoringService } from '../../services/authoring/authoring.service';
import { ToastrService } from 'ngx-toastr';
import { StatusTransformPipe } from '../../pipes/status-transform/status-transform.pipe';
import { RequestTypeTransformPipe } from '../../pipes/request-type-transform/request-type-transform.pipe';
import { User } from '../../models/user';
import { BehaviorSubject, debounceTime, forkJoin, of, Subscription, switchMap, tap } from 'rxjs';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfigService } from '../../services/config/config.service';
import { Extension } from '../../models/extension';
import * as data from 'public/config/config.json';
import { LanguageService } from '../../services/language/language.service';
import { NavigationService } from '../../services/navigation/navigation.service';

enum Mode {
    NEW,
    VIEW
}

@Component({
    selector: 'app-request',
    imports: [CommonModule, FormsModule, NgIf, StatusTransformPipe, RequestTypeTransformPipe, TranslatePipe],
    templateUrl: './request.component.html',
    styleUrl: './request.component.scss',
    providers: [StatusTransformPipe]
})
export class RequestComponent implements OnInit, OnDestroy {

    @ViewChild('summarySpanElement') summarySpanElement!: ElementRef;

    deleteOption: RequestComment | null;

    requestComments: RequestComment[] = [];
    user!: User;
    userSubscription: Subscription;
    extension: Extension;
    extensionSubscription: Subscription;
    displayWorkflowDiagram: boolean = false;
    comment: string = '';
    assignees: any[] = [];
    userDisplayNameByUsername: Map<string, string> = new Map<string, string>();
    config: any = data;
    request: Request;
    originalRequest!: Request;
    requestId: string;
    country: string;
    expandedSummary: boolean = false;
    summarySpanLines: number = 0;

    // Typeahead properties
    typeaheadResults: string[] = [];
    showTypeahead: boolean = false;
    typeaheadSubject = new BehaviorSubject<string>('');
    typeaheadSubscription: Subscription;

    // Assignee typeahead properties
    assigneeTypeaheadResults: any[] = [];
    showAssigneeTypeahead: boolean = false;
    assigneeTypeaheadSubject = new BehaviorSubject<string>('');
    assigneeTypeaheadSubscription: Subscription;

    ModeType = Mode; // Expose the Mode enum to the template for use in conditionals
    mode: Mode = Mode.NEW; // Default mode is NEW

    constructor(private readonly authoringService: AuthoringService,
        private readonly toastr: ToastrService,
        private readonly authenticationService: AuthenticationService,
        private readonly configService: ConfigService,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
        private readonly statusPipe: StatusTransformPipe,
        private readonly languageService: LanguageService,
        private readonly navigationService: NavigationService) {
        this.userSubscription = this.authenticationService.getUser().subscribe(data => this.user = data);
        this.extensionSubscription = this.configService.getExtension().subscribe(extension => this.extension = extension);

        // Initialize typeahead subscription
        this.typeaheadSubscription = this.typeaheadSubject.pipe(
            debounceTime(300), // Delay for 300ms after the last event
            tap(() => {
                this.typeaheadResults = [];
                this.showTypeahead = false;
            }),
            switchMap(searchText => {
                if (searchText && searchText.trim() !== '' && searchText.length >= 2) {
                    return this.authoringService.getTypeahead(this.country, searchText);
                } else {
                    return of([]);
                }
            })
        ).subscribe({
            next: (response: string[]) => {
                this.typeaheadResults = response;
                this.showTypeahead = response.length > 0;
            },
            error: (error) => {
                console.error('Typeahead error:', error);
                this.typeaheadResults = [];
                this.showTypeahead = false;
            }
        });

        // Initialize assignee typeahead subscription
        this.assigneeTypeaheadSubscription = this.assigneeTypeaheadSubject.pipe(
            debounceTime(300),
            tap(() => {
                this.assigneeTypeaheadResults = [];
                this.showAssigneeTypeahead = false;
            }),
            switchMap(searchText => {
                if (searchText && searchText.trim() !== '' && searchText.length >= 1) {
                    const filtered = this.assignees.filter(assignee => {
                        const displayName = this.getDisplayFromUserObject(assignee);
                        return displayName.toLowerCase().includes(searchText.toLowerCase());
                    });
                    return of(filtered);
                } else {
                    return of(this.assignees || []);
                }
            })
        ).subscribe({
            next: (results: any[]) => {
                this.assigneeTypeaheadResults = results;
                this.showAssigneeTypeahead = results.length > 0;
            },
            error: (error) => {
                console.error('Assignee typeahead error:', error);
                this.assigneeTypeaheadResults = [];
                this.showAssigneeTypeahead = false;
            }
        });
    }

    ngOnInit(): void {
        this.languageService.initializeLanguageFromUrl();
        this.country = this.activatedRoute.snapshot.paramMap.get('country');
        this.requestId = this.activatedRoute.snapshot.paramMap.get('id');
        this.configService.setExtension(this.config.extensions.find(extension => extension.shortCode === this.activatedRoute.snapshot.paramMap.get('country')));
        if (this.requestId) {
            this.mode = Mode.VIEW; // Set mode to view if requestId is present
            this.authoringService.httpGetRMPRequestDetails(this.requestId).subscribe(response => {
                if (response) {
                    this.request = response as Request;
                    this.originalRequest = JSON.parse(JSON.stringify(this.request));
                }
            });
            this.authoringService.httpGetComments(this.requestId).subscribe(response => {
                this.requestComments = response;
            });
            this.populateAssignees();
        } else {
            this.resetFormValues(); // Reset form values to defaults
        }
        this.getSummarySpanLines();
    }

    ngOnDestroy(): void {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
        if (this.extensionSubscription) {
            this.extensionSubscription.unsubscribe();
        }
        if (this.typeaheadSubscription) {
            this.typeaheadSubscription.unsubscribe();
        }
        if (this.assigneeTypeaheadSubscription) {
            this.assigneeTypeaheadSubscription.unsubscribe();
        }
    }

    getDisplayName(identifier: string): string {
        if (!identifier) {
            return '';
        }
        if (this.user) {
            const selfKeys: string[] = [this.user?.username, this.user?.login, this.user?.email].filter(Boolean);
            if (selfKeys.includes(identifier)) {
                const selfDisplay = this.user?.displayName || [this.user?.firstName, this.user?.lastName].filter(Boolean).join(' ').trim();
                if (selfDisplay) {
                    return selfDisplay;
                }
            }
        }
        return this.userDisplayNameByUsername?.get(identifier) ?? identifier;
    }

    saveRequest(form: NgForm): void {
        if (this.mode === Mode.NEW) {
            if (!form.valid) {
                this.toastr.error('Please fill in all required fields before submitting.', 'Form Incomplete');
                return;
            }

            this.request.country = this.country; // Set the country from the route parameter
            this.request.status = 'NEW'; // Default status for new requests

            this.toastr.info('Creating new request...', 'Please wait');
            this.authoringService.httpCreateRMPRequest(this.request).subscribe(response => {
                if (response) {
                    this.navigationService.navigateWithLanguage([this.country]); // Navigate to the country page after creation
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
        // const currentFormType = this.formType; // Store current form type
        form.resetForm(); // Reset the form state
        this.resetFormValues(); // Reset form values to defaults
        this.toastr.clear(); // Clear any previous toastr messages

        // setTimeout(() => {
        //     this.formType = currentFormType;
        //     this.formLangageRefset = ''; // Reset language refset
        //     this.formContextRefset = ''; // Reset context refset
        // }, 0);
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
        if (this.comment !== '') {
            let requestComment = new RequestComment(null, this.comment);

            this.authoringService.httpPostComment(this.request.id, requestComment).subscribe({
                next: () => {
                    this.toastr.success('#' + this.request.id + ' Comment Added', 'SUCCESS');
                    this.comment = '';
                    this.authoringService.httpGetComments(this.requestId).subscribe(response => {
                        this.requestComments = response;
                    });
                },
                error: () => {
                    this.toastr.error('#' + this.request.id + ' Comment Addition Failed', 'ERROR');
                }
            });
        }
    }

    deleteComment(commentId: number): void {
        this.authoringService.httpDeleteComment(commentId).subscribe({
            next: () => {
                this.toastr.success('Comment Deleted', 'SUCCESS');
                this.authoringService.httpGetComments(this.requestId).subscribe(response => {
                    this.requestComments = response;
                });
                this.deleteOption = null; // Clear the delete option after successful deletion
            },
            error: () => {
                this.toastr.error('Comment Deletion Failed', 'ERROR');
                this.deleteOption = null; // Clear the delete option on error
            }
        });
    }

    onParentConceptInput(event: any): void {
        const searchText = event.target.value;
        this.typeaheadSubject.next(searchText);
    }

    selectTypeaheadResult(result: string, field: string): void {
        this.request[field] = result;
        this.showTypeahead = false;
        this.typeaheadResults = [];
    }

    onAssigneeInput(event: any): void {
        const searchText = event.target.value;
        this.assigneeTypeaheadSubject.next(searchText);
    }

    selectAssigneeResult(assignee: any): void {
        this.request.assignee = assignee.name;
        this.showAssigneeTypeahead = false;
        this.assigneeTypeaheadResults = [];
    }

    getAssigneeDisplayValue(): string {
        if (!this.request.assignee) {
            return '';
        }
        return this.getDisplayName(this.request.assignee);
    }

    isStaff(user: User): boolean {
        return user ? user.roles.includes('ROLE_ms-' + this.extension.name.toLowerCase()) : false;
    }

    isUser(user: User): boolean {
        return user ? user.roles.includes('ROLE_rmp-' + this.extension.shortCode + '-requestor') : false;
    }

    populateAssignees(): void {
        forkJoin([
            this.authoringService.httpGetUsersByRole('ms-' + this.extension.name.toLowerCase()),
            this.authoringService.httpGetUsersByRole('rmp-' + this.extension.shortCode + '-requestor')
        ]).subscribe({
            next: ([staff, requestors]) => {
                this.assignees = staff.users.items.concat(requestors.users.items);
                // Build a display name map from the fetched users
                const allUsers: any[] = this.assignees ?? [];
                allUsers.forEach((u: any) => {
                    const computedFullName = [u?.firstName, u?.lastName].filter(Boolean).join(' ').trim();
                    const display: string = u?.displayName || (computedFullName || undefined) || u?.name;
                    const keys: string[] = [u?.username, u?.login, u?.id, u?.name, u?.email].filter(Boolean);
                    keys.forEach((k: string) => {
                        if (display) {
                            this.userDisplayNameByUsername.set(k, display);
                        }
                    });
                });
            },
            error: () => { }
        });
    }

    getDisplayFromUserObject(userObj: any): string {
        if (!userObj) {
            return '';
        }
        const computedFullName = [userObj?.firstName, userObj?.lastName].filter(Boolean).join(' ').trim();
        const display = userObj?.displayName || (computedFullName || undefined) || userObj?.name;
        return display || '';
    }

    hasRequestChanged(): boolean {
        // Ignore server-managed fields:
        const normalize = (r: Request) => {
            const { created, updated, status, ...rest } = r as any;
            return rest;
        };
        return JSON.stringify(normalize(this.request)) !== JSON.stringify(normalize(this.originalRequest));
    }

    updateRequest(form: NgForm): void {
        if (!form.valid) {
            this.toastr.error('Please fill in all required fields before submitting.', 'Form Incomplete');
            return;
        }

        if (!this.hasRequestChanged()) {
            this.toastr.info('No changes detected.', 'Nothing to update');
            return;
        }

        const updatedRequest: Request = this.request;

        this.authoringService.httpPutRMPRequest(updatedRequest).subscribe({
            next: () => {
                this.toastr.success('#' + updatedRequest.id + ' Saved', 'SUCCESS');
                this.originalRequest = JSON.parse(JSON.stringify(this.request));
                form.form.markAsPristine();
            },
            error: () => {
                this.toastr.error('#' + updatedRequest.id + ' Not saved', 'ERROR');
            }
        });
    }

    navigateBack(): void {
        this.navigationService.navigateWithLanguage([this.country]);
    }

    getSummarySpanLines(): void {
        let attempts = 0;
        const maxAttempts = 100;
        const interval = setInterval(() => {
            if (this.summarySpanElement) {
                const spanElement = this.summarySpanElement.nativeElement;
                if (spanElement.textContent && spanElement.textContent.trim().length > 0) {
                    const computedStyle = window.getComputedStyle(spanElement);
                    const lineHeight = parseFloat(computedStyle.lineHeight);
                    const totalHeight = spanElement.getBoundingClientRect().height;
                    if (lineHeight > 0 && this.summarySpanLines === 0) {
                        this.summarySpanLines = Math.round(totalHeight / lineHeight);
                    }
                }
                clearInterval(interval);
            } else if (++attempts >= maxAttempts) {
                clearInterval(interval);
            }
        }, 100);
    }

}
