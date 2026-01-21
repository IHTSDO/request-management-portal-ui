import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Request, RequestComment } from '../../models/request';
import { Description } from '../../models/description';
import { Relationship } from '../../models/relationship';
import { AuthoringService } from '../../services/authoring/authoring.service';
import { ToastrService } from 'ngx-toastr';
import { StatusTransformPipe } from '../../pipes/status-transform/status-transform.pipe';
import { RequestTypeTransformPipe } from '../../pipes/request-type-transform/request-type-transform.pipe';
import { User } from '../../models/user';
import { BehaviorSubject, catchError, debounceTime, forkJoin, of, Subscription, switchMap, tap, firstValueFrom } from 'rxjs';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfigService } from '../../services/config/config.service';
import { Extension } from '../../models/extension';
import * as data from 'public/config/config.json';
import { LanguageService } from '../../services/language/language.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { MarkdownComponent } from 'ngx-markdown';

enum Mode {
    NEW,
    VIEW
}

@Component({
    selector: 'app-request',
    imports: [CommonModule, FormsModule, StatusTransformPipe, RequestTypeTransformPipe, TranslatePipe, MarkdownComponent],
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
    languageRefsets: any[] = [];
    filteredContextRefsets: any[] = [];
    allContextRefsets: any[] = [];
    noneLanguageRefsetValue: string = '';
    noneContextRefsetValue: string = '';
    availableDescriptions: Description[] = [];
    availableRelationships: Relationship[] = [];
    request: Request;
    originalRequest!: Request;
    requestId: string;
    country: string;

    // Typeahead properties
    forTypeaheadProperty: string = '';
    typeaheadResults: string[] = [];
    showTypeahead: boolean = false;
    typeaheadLoading: boolean = false;
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
        private readonly navigationService: NavigationService,
        private readonly translateService: TranslateService) {
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
                    this.typeaheadLoading = true;
                    return this.authoringService.getTypeahead(this.country, searchText).pipe(
                        catchError((error) => {
                            console.error('API error:', error);
                            // Reset loading state on error
                            this.typeaheadLoading = false;
                            // Return empty array on error so the stream continues working
                            // The subscription's next handler will process this empty array
                            return of([]);
                        })
                    );
                } else {
                    this.typeaheadLoading = false;
                    return of([]);
                }
            })
        ).subscribe({
            next: (response: string[]) => {
                this.typeaheadResults = response;
                this.showTypeahead = response.length > 0;
                this.typeaheadLoading = false;
            },
            error: (error) => {
                // This should rarely be called now since errors are caught in switchMap
                console.error('Typeahead subscription error:', error);
                this.typeaheadResults = [];
                this.showTypeahead = false;
                this.typeaheadLoading = false;
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

        // Wait for translations to be loaded before proceeding
        this.initializeTranslations().then(() => {
            // Load and filter language refsets from config by country code
            this.filterLanguageRefsetsByCountry();
            // Load and filter context refsets from config by country code
            this.filterContextRefsetsByCountry();
            this.loadRequestData();
        });
    }

    async initializeTranslations(): Promise<void> {
        // Wait for translations to be loaded and store "None" values
        try {
            const [noneLanguageRefset, noneContextRefset] = await Promise.all([
                firstValueFrom(this.translateService.get('request.languageRefsets.none')),
                firstValueFrom(this.translateService.get('request.contextRefsets.none'))
            ]);
            this.noneLanguageRefsetValue = noneLanguageRefset;
            this.noneContextRefsetValue = noneContextRefset;
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to instant
            this.noneLanguageRefsetValue = this.translateService.instant('request.languageRefsets.none');
            this.noneContextRefsetValue = this.translateService.instant('request.contextRefsets.none');
        }
    }

    loadRequestData(): void {
        if (this.requestId) {
            this.mode = Mode.VIEW; // Set mode to view if requestId is present
            this.authoringService.httpGetRMPRequestDetails(this.requestId).subscribe(response => {
                if (response) {
                    this.request = response as Request;
                    // Normalize empty refsets to "None" for display
                    this.normalizeRefsetsForDisplay();
                    // Store normalized request as original for change detection
                    this.originalRequest = JSON.parse(JSON.stringify(this.request));
                    // Load descriptions and relationships if concept ID is already set
                    if (this.request.conceptId) {
                        this.loadConcept(this.request.conceptId);
                    }
                }
            });
            this.authoringService.httpGetComments(this.requestId).subscribe(response => {
                this.requestComments = response;
            });
            this.populateAssignees();
        } else {
            this.resetFormValues(); // Reset form values to defaults
            // Normalize empty refsets to "None" for display
            this.normalizeRefsetsForDisplay();
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

            // Create a copy of the request for saving
            const requestToSave: Request = JSON.parse(JSON.stringify(this.request));

            // Normalize "None" values back to empty in the copy before saving
            // Use stored values if available, otherwise use instant (may be translation key if not loaded)
            const noneLanguageRefsetValue = this.noneLanguageRefsetValue || this.translateService.instant('request.languageRefsets.none');
            const noneContextRefsetValue = this.noneContextRefsetValue || this.translateService.instant('request.contextRefsets.none');

            if (requestToSave.languageRefset === noneLanguageRefsetValue) {
                requestToSave.languageRefset = '';
            }
            if (requestToSave.contextRefset === noneContextRefsetValue) {
                requestToSave.contextRefset = '';
            }

            // Clear languageRefset and contextRefset for relationship request types
            if (requestToSave.type === 'change-relationship' || requestToSave.type === 'add-relationship' || requestToSave.type === 'inactivate-relationship') {
                requestToSave.languageRefset = '';
                requestToSave.contextRefset = '';
            }

            this.toastr.info('Creating new request...', 'Please wait');
            this.authoringService.httpCreateRMPRequest(requestToSave).subscribe(response => {
                if (response) {
                    this.navigationService.navigateWithLanguage([this.country]); // Navigate to the country page after creation
                    this.request = response as Request;
                    // Normalize empty refsets to "None" for display
                    this.normalizeRefsetsForDisplay();
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
        // Normalize empty refsets to "None" for display
        this.normalizeRefsetsForDisplay();
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

    onParentConceptInput(forTypeaheadProperty: string, event: any): void {
        this.forTypeaheadProperty = forTypeaheadProperty;
        const searchText = event.target.value;
        this.typeaheadSubject.next(searchText);
    }

    selectTypeaheadResult(result: string, field: string): void {
        this.request[field] = result;
        this.showTypeahead = false;
        this.typeaheadResults = [];
        this.typeaheadLoading = false;

        // If concept field is selected, automatically populate conceptId, conceptName, and load descriptions
        if (field === 'concept') {
            this.loadConceptDetails(result);
        }
    }

    loadConceptDetails(conceptString: string): void {
        // Parse the concept string format: "id |FSN term|"
        const match = conceptString.match(/^(\d+)\s*\|\s*(.+?)\s*\|$/);
        if (match) {
            const conceptId = match[1];
            const conceptName = match[2];

            // Clear existing description and relationship when concept changes
            this.request.existingDescription = '';
            this.request.existingRelationship = '';
            this.availableDescriptions = [];
            this.availableRelationships = [];

            // Update concept ID and name
            this.request.conceptId = conceptId;
            this.request.conceptName = conceptName;

            // Load descriptions and relationships for this concept
            this.loadConcept(conceptId);
        }
    }

    loadConcept(conceptId: string): void {
        if (!conceptId || !this.country) {
            return;
        }

        this.authoringService.getConcept(this.country, conceptId).subscribe({
            next: (response) => {
                this.availableDescriptions = [];
                if (response.descriptions && Array.isArray(response.descriptions)) {
                    response.descriptions.forEach((item: any) => {
                        if (item.term) {
                            this.availableDescriptions.push(new Description(
                                item.descriptionId, // descriptionId
                                item.term, // term
                                item.active, // active
                                item.conceptId, // conceptId
                                item.type // type
                            ));
                        }
                    });
                }

                this.availableRelationships = [];
                if (response.relationships && Array.isArray(response.relationships)) {
                    response.relationships.forEach((item: any) => {
                        if (item.typeId && item.destinationId && item.active) {
                            this.availableRelationships.push(new Relationship(
                                item.relationshipId, // relationshipId
                                item.typeId, // type
                                item.destinationId, // destinationId
                                item.active, // active
                                item.sourceId, // conceptId
                                item?.type?.fsn?.term, // type FSN
                                item?.target?.fsn?.term // destination FSN
                            ));
                        }
                    });
                }
            },
            error: (error) => {
                console.error('Error loading concept details:', error);
                this.availableDescriptions = [];
            }
        });
    }

    getActiveDescriptions(): Description[] {
        // For 'inactivate-description' request type, filter only active descriptions
        if (this.request?.type === 'inactivate-description') {
            return this.availableDescriptions
                .filter((item: Description) => {
                    return item.active && item.term;
                });
        }
        // For other request types, return all descriptions
        return this.availableDescriptions;
    }    

    formatRelationshipForDisplay(relationship: Relationship): string {
        if (relationship.typeFsn && relationship.destinationFsn) {
            return `${relationship.typeFsn} - ${relationship.destinationFsn}`;
        }
        return  `${relationship.type} - ${relationship.destinationId}`;
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
        return user ? user.roles.includes('ROLE_rmp-' + this.extension.shortCode + '-staff') : false;
    }

    isUser(user: User): boolean {
        return user ? user.roles.includes('ROLE_rmp-' + this.extension.shortCode + '-requestor') : false;
    }

    isRequestOwner(): boolean {
        return this.request.reporter === this.user.username;
    }

    populateAssignees(): void {
        forkJoin([
            this.authoringService.httpGetUsersByRole('rmp-' + this.extension.shortCode + '-staff'),
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

    filterLanguageRefsetsByCountry(): void {
        if (!this.config?.languageRefsets || !this.country) {
            this.languageRefsets = this.config?.languageRefsets || [];
            return;
        }

        // Filter language refsets based on country code
        // If countries array is empty or not present, the refset is available for all countries
        // If countries array contains the current country code, include it
        // Always include "none"
        this.languageRefsets = this.config.languageRefsets.filter((refset: any) => {
            // Always include "none"
            if (refset.translationKey === 'request.languageRefsets.none') {
                return true;
            }

            // If no countries array or empty array, available for all countries
            if (!refset.countries || refset.countries.length === 0) {
                return true;
            }

            // Check if current country is in the countries array
            return refset.countries.includes(this.country.toLowerCase());
        });
    }

    filterContextRefsetsByCountry(): void {
        if (!this.config?.contextRefsets || !this.country) {
            this.allContextRefsets = this.config?.contextRefsets || [];
            this.filteredContextRefsets = this.allContextRefsets;
            return;
        }

        // Filter context refsets based on country code
        // If countries array is empty or not present, the refset is available for all countries
        // If countries array contains the current country code, include it
        // Always include "none"
        this.allContextRefsets = this.config.contextRefsets.filter((refset: any) => {
            // Always include "none"
            if (refset.translationKey === 'request.contextRefsets.none') {
                return true;
            }

            // If no countries array or empty array, available for all countries
            if (!refset.countries || refset.countries.length === 0) {
                return true;
            }

            // Check if current country is in the countries array
            return refset.countries.includes(this.country.toLowerCase());
        });

        // Set filtered context refsets to all context refsets (no language filtering)
        this.filteredContextRefsets = this.allContextRefsets;
    }

    normalizeRefsetsForDisplay(): void {
        // Use stored translation values (loaded in initializeTranslations)
        // Fallback to instant if not yet loaded (will be translation key if translations not ready)
        const noneLanguageRefset = this.noneLanguageRefsetValue || this.translateService.instant('request.languageRefsets.none');
        const noneContextRefset = this.noneContextRefsetValue || this.translateService.instant('request.contextRefsets.none');

        // Convert empty language refset to "None" for display
        if (!this.request.languageRefset || this.request.languageRefset.trim() === '') {
            this.request.languageRefset = noneLanguageRefset;
        }

        // Convert empty context refset to "None" for display
        if (!this.request.contextRefset || this.request.contextRefset.trim() === '') {
            this.request.contextRefset = noneContextRefset;
        }
    }

    normalizeRefsetsForSave(): void {
        // Use stored translation values (loaded in initializeTranslations)
        // Fallback to instant if not yet loaded
        const noneLanguageRefset = this.noneLanguageRefsetValue || this.translateService.instant('request.languageRefsets.none');
        const noneContextRefset = this.noneContextRefsetValue || this.translateService.instant('request.contextRefsets.none');

        // Convert "None" language refset back to empty for saving
        if (this.request.languageRefset === noneLanguageRefset) {
            this.request.languageRefset = '';
        }

        // Convert "None" context refset back to empty for saving
        if (this.request.contextRefset === noneContextRefset) {
            this.request.contextRefset = '';
        }
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

        // Create a copy of the request for saving
        const updatedRequest: Request = JSON.parse(JSON.stringify(this.request));

        // Normalize "None" values back to empty in the copy before saving
        // Use stored values if available, otherwise use instant (may be translation key if not loaded)
        const noneLanguageRefsetValue = this.noneLanguageRefsetValue || this.translateService.instant('request.languageRefsets.none');
        const noneContextRefsetValue = this.noneContextRefsetValue || this.translateService.instant('request.contextRefsets.none');

        if (updatedRequest.languageRefset === noneLanguageRefsetValue) {
            updatedRequest.languageRefset = '';
        }
        if (updatedRequest.contextRefset === noneContextRefsetValue) {
            updatedRequest.contextRefset = '';
        }

        // Clear languageRefset and contextRefset for relationship request types
        if (updatedRequest.type === 'change-relationship' || updatedRequest.type === 'add-relationship' || updatedRequest.type === 'inactivate-relationship') {
            updatedRequest.languageRefset = '';
            updatedRequest.contextRefset = '';
        }

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

    /**
     * Prepare comment body for markdown rendering.
     * - Converts literal "\n" sequences from the backend into real newlines
     * - Then converts runs of newlines into <br> tags so multiple blank lines are preserved
     */
    getMarkdownBody(comment: RequestComment): string {
        if (!comment || !comment.body) {
            return '';
        }

        // 1. Convert escaped newlines ("\\n") to real newline characters
        let body = comment.body.replace(/\\n/g, '\n');

        // 2. Turn one or more newlines into the same number of <br> tags
        body = body.replace(/\n+/g, (match) => '<br>'.repeat(match.length));

        return body;
    }
}
