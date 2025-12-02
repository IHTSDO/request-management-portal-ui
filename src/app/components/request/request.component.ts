import { FormsModule, NgForm } from '@angular/forms';
import { NgIf, CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

    deleteOption: RequestComment | null;

    requestComments: RequestComment[] = [];
    user!: User;
    userSubscription: Subscription;
    extension: Extension;
    extensionSubscription: Subscription;
    displayWorkflowDiagram: boolean = false;
    comment: string = '';
    reporters: any[] = [];
    assignees: any[] = [];
    userDisplayNameByUsername: Map<string, string> = new Map<string, string>();
    config: any = data;
    request: Request;
    originalRequest!: Request;
    requestId: string;
    country: string;

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

    // Reporter typeahead properties
    reporterTypeaheadResults: any[] = [];
    showReporterTypeahead: boolean = false;
    reporterTypeaheadSubject = new BehaviorSubject<string>('');
    reporterTypeaheadSubscription: Subscription;

    ModeType = Mode; // Expose the Mode enum to the template for use in conditionals
    mode: Mode = Mode.NEW; // Default mode is NEW

    constructor(private readonly authoringService: AuthoringService,
        private readonly toastr: ToastrService,
        private readonly authenticationService: AuthenticationService,
        private readonly configService: ConfigService,
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

        // Initialize reporter typeahead subscription
        this.reporterTypeaheadSubscription = this.reporterTypeaheadSubject.pipe(
            debounceTime(300),
            tap(() => {
                this.reporterTypeaheadResults = [];
                this.showReporterTypeahead = false;
            }),
            switchMap(searchText => {
                if (searchText && searchText.trim() !== '' && searchText.length >= 1) {
                    const filtered = this.reporters.filter(reporter => {
                        const displayName = this.getDisplayFromUserObject(reporter);
                        return displayName.toLowerCase().includes(searchText.toLowerCase());
                    });
                    return of(filtered);
                } else {
                    return of(this.reporters || []);
                }
            })
        ).subscribe({
            next: (results: any[]) => {
                this.reporterTypeaheadResults = results;
                this.showReporterTypeahead = results.length > 0;
            },
            error: (error) => {
                console.error('Reporter typeahead error:', error);
                this.reporterTypeaheadResults = [];
                this.showReporterTypeahead = false;
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
        if (this.reporterTypeaheadSubscription) {
            this.reporterTypeaheadSubscription.unsubscribe();
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
            // Check if type is selected
            if (!this.request.type || this.request.type.trim() === '') {
                this.toastr.error('Please select a request type before submitting.', 'Type Required');
                return;
            }

            // Check if summary is provided
            if (!this.request.summary || this.request.summary.trim() === '') {
                this.toastr.error('Please provide a summary before submitting.', 'Summary Required');
                return;
            }

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
            'add-concept', // type
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

    onAssigneeFocus(event: any): void {
        this.showAssigneeTypeahead = true;
        this.assigneeTypeaheadSubject.next('');
    }

    onAssigneeBlur(event: any): void {
        setTimeout(() => {
            this.showAssigneeTypeahead = false;
            this.assigneeTypeaheadResults = [];
        }, 200); // Delay to allow click event to register
    }

    selectAssigneeResult(assignee: any): void {
        if (this.request.assignee === assignee.name) {
            this.showAssigneeTypeahead = false;
            this.assigneeTypeaheadResults = [];
            return; // No change, do nothing
        }
        if (assignee.name === 'unassigned') {
            if (!this.request.assignee) return; // Already unassigned, do nothing
            this.request.assignee = '';
        } else {
            this.request.assignee = assignee.name;
        }
        this.showAssigneeTypeahead = false;
        this.assigneeTypeaheadResults = [];

        const updatedRequest: Request = this.request;
        this.toastr.info('Updating assignee...', 'INFO');
        this.authoringService.httpPutRMPRequest(updatedRequest).subscribe({
            next: () => {
                this.toastr.clear(); // Clear any previous toastr messages
                this.toastr.success(assignee.name === 'unassigned' ? 'Assignee removed successfully' : 'Assignee updated successfully', 'SUCCESS');
                this.originalRequest = JSON.parse(JSON.stringify(this.request));
            },
            error: () => {
                this.toastr.clear(); // Clear any previous toastr messages
                this.toastr.error('Assignee update failed', 'ERROR');
            }
        });
    }

    onReporterInput(event: any): void {
        const searchText = event.target.value;
        this.reporterTypeaheadSubject.next(searchText);
    }

    onReporterFocus(event: any): void {
        this.showReporterTypeahead = true;
        this.reporterTypeaheadSubject.next('');
    }

    onReporterBlur(event: any): void {
        setTimeout(() => {
            this.showReporterTypeahead = false;
            this.reporterTypeaheadResults = [];
        }, 200); // Delay to allow click event to register
    }

    selectReporterResult(reporter: any): void {
        if (this.request.reporter === reporter.name) {
            this.showReporterTypeahead = false;
            this.reporterTypeaheadResults = [];
            return; // No change, do nothing
        }

        this.request.reporter = reporter.name;
        this.showReporterTypeahead = false;
        this.reporterTypeaheadResults = [];

        const updatedRequest: Request = this.request;
        this.toastr.info('Updating reporter...', 'INFO');
        this.authoringService.httpPutRMPRequest(updatedRequest).subscribe({
            next: () => {
                this.toastr.clear(); // Clear any previous toastr messages
                this.toastr.success('Reporter updated successfully', 'SUCCESS');
                this.originalRequest = JSON.parse(JSON.stringify(this.request));
            },
            error: () => {
                this.toastr.clear(); // Clear any previous toastr messages
                this.toastr.error('Reporter update failed', 'ERROR');
            }
        });
    }

    getAssigneeDisplayValue(): string {
        if (!this.request.assignee) {
            return '';
        }
        return this.getDisplayName(this.request.assignee);
    }

    getReporterDisplayValue(): string {
        if (!this.request.reporter) {
            return '';
        }
        return this.getDisplayName(this.request.reporter);
    }

    isStaff(user: User): boolean {
        return user ? user.roles.includes('ROLE_ms-' + this.extension.name.toLowerCase().replaceAll(" ", "")) : false;
    }

    isUser(user: User): boolean {
        return user ? user.roles.includes('ROLE_rmp-' + this.extension.shortCode + '-requestor') : false;
    }

    isRequestOwner(): boolean {
        return this.request.reporter === this.user.username;
    }

    populateAssignees(): void {
        forkJoin([
            this.authoringService.httpGetUsersByRole('ms-' + this.extension.name.toLowerCase().replaceAll(" ", "")),
            this.authoringService.httpGetUsersByRole('rmp-' + this.extension.shortCode + '-requestor')
        ]).subscribe({
            next: ([staff, requestors]) => {
                const staffItems = staff?.users?.items ?? [];
                const requestorItems = requestors?.users?.items ?? [];
                this.assignees = [{name: 'unassigned', displayName: 'Unassigned'}, ...staffItems];
                this.reporters = staffItems.concat(requestorItems);
                // Build a display name map from the fetched users
                const allUsers = staffItems.concat(requestorItems);
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
            const { created, updated, status, assignee, reporter, ...rest } = r as any;
            return rest;
        };
        return JSON.stringify(normalize(this.request)) !== JSON.stringify(normalize(this.originalRequest));
    }

    areMandatoryFieldsPopulated(): boolean {
        if (!this.request) {
            return false;
        }

        // Common mandatory fields
        if (!this.request.type || this.request.type.trim() === '') {
            return false;
        }

        if (!this.request.summary || this.request.summary.trim() === '') {
            return false;
        }

        // Type-specific mandatory fields
        switch (this.request.type) {
            case 'add-concept':
                if (!this.request.newFSN || this.request.newFSN.trim() === '') return false;
                if (!this.request.newPT || this.request.newPT.trim() === '') return false;
                if (!this.request.parentConcept || this.request.parentConcept.trim() === '') return false;
                break;

            case 'add-description':
                if (!this.request.conceptId || this.request.conceptId.trim() === '') return false;
                if (!this.request.conceptName || this.request.conceptName.trim() === '') return false;
                if (!this.request.newDescription || this.request.newDescription.trim() === '') return false;
                break;

            case 'add-relationship':
                if (!this.request.conceptId || this.request.conceptId.trim() === '') return false;
                if (!this.request.conceptName || this.request.conceptName.trim() === '') return false;
                if (!this.request.relationshipType || this.request.relationshipType.trim() === '') return false;
                if (!this.request.relationshipTarget || this.request.relationshipTarget.trim() === '') return false;
                break;

            case 'change-description':
                if (!this.request.conceptId || this.request.conceptId.trim() === '') return false;
                if (!this.request.conceptName || this.request.conceptName.trim() === '') return false;
                if (!this.request.existingDescription || this.request.existingDescription.trim() === '') return false;
                if (!this.request.newDescription || this.request.newDescription.trim() === '') return false;
                break;

            case 'change-relationship':
                if (!this.request.conceptId || this.request.conceptId.trim() === '') return false;
                if (!this.request.conceptName || this.request.conceptName.trim() === '') return false;
                if (!this.request.existingRelationship || this.request.existingRelationship.trim() === '') return false;
                if (!this.request.relationshipType || this.request.relationshipType.trim() === '') return false;
                if (!this.request.relationshipTarget || this.request.relationshipTarget.trim() === '') return false;
                break;

            case 'inactivate-description':
                if (!this.request.conceptId || this.request.conceptId.trim() === '') return false;
                if (!this.request.conceptName || this.request.conceptName.trim() === '') return false;
                if (!this.request.existingDescription || this.request.existingDescription.trim() === '') return false;
                break;

            case 'inactivate-relationship':
                if (!this.request.conceptId || this.request.conceptId.trim() === '') return false;
                if (!this.request.conceptName || this.request.conceptName.trim() === '') return false;
                if (!this.request.existingRelationship || this.request.existingRelationship.trim() === '') return false;
                break;

            // For 'add-refset', 'change-refset', and 'other', only common fields are mandatory
            case 'add-refset':
            case 'change-refset':
            case 'other':
                // Only common mandatory fields (already checked above)
                break;

            default:
                // For unknown types, only validate common fields
                break;
        }

        return true;
    }

    updateRequest(form: NgForm): void {
        // Check if type is selected
        if (!this.request.type || this.request.type.trim() === '') {
            this.toastr.error('Please select a request type before saving.', 'Type Required');
            return;
        }

        // Check if summary is provided
        if (!this.request.summary || this.request.summary.trim() === '') {
            this.toastr.error('Please provide a summary before saving.', 'Summary Required');
            return;
        }

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
}
