import {CommonModule} from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {Request} from '../../models/request';
import {AuthoringService} from '../../services/authoring/authoring.service';
import {ToastrService} from 'ngx-toastr';
import {debounceTime, BehaviorSubject, Subscription, switchMap, tap, of, filter, combineLatest} from 'rxjs';
import {StatusTransformPipe, StatusEnum} from '../../pipes/status-transform/status-transform.pipe';
import {RequestTypeTransformPipe, RequestTypeEnum} from '../../pipes/request-type-transform/request-type-transform.pipe';
import {FormsModule} from '@angular/forms';
import {UserRequestsPipe} from '../../pipes/user-requests/user-requests.pipe';
import {User} from '../../models/user';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import * as data from 'public/config/config.json';
import {ConfigService} from '../../services/config/config.service';
import {Extension} from '../../models/extension';
import {LanguageService} from '../../services/language/language.service';
import {NavigationService} from '../../services/navigation/navigation.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-request-management',
    imports: [CommonModule, FormsModule, StatusTransformPipe, RequestTypeTransformPipe, UserRequestsPipe, TranslatePipe],
    templateUrl: './request-management.component.html',
    styleUrl: './request-management.component.scss'
})
export class RequestManagementComponent implements OnInit, OnDestroy {

    deleteOption: Request | null;
    filterMenu: boolean = false;
    statusList: string[] = ['NEW', 'ACCEPTED', 'IN_PROGRESS', 'ON_HOLD', 'CLARIFICATION_REQUESTED', 'APPEAL_CLARIFICATION_REQUESTED', 'UNDER_APPEAL', 'READY_FOR_RELEASE'];
    openRequests: boolean = true;
    closedRequests: boolean = false;
    assignedRequests: boolean = false;
    myRequests: boolean = false;
    reporters: string[] = [];
    assignees: string[] = [];
    userDisplayNameByUsername: Map<string, string> = new Map<string, string>();
    user!: User;
    userSubscription: Subscription;
    extension: Extension;
    extensionSubscription: Subscription;
    requests: Request[] = [];
    country: string;
    requestLoading: boolean = false;
    totalRequests: number = 0;
    visibleRequests: number = 100;
    searchText: string = '';
    config: any = data;

    searchQuery = new BehaviorSubject<string>('');
    private readonly subscription: Subscription;

    sortColumn: string = 'updatedDate';
    sortDirection: 'asc' | 'desc' = 'desc';

    constructor(private readonly authoringService: AuthoringService,
                private readonly activatedRoute: ActivatedRoute,
                private readonly authenticationService: AuthenticationService,
                private readonly configService: ConfigService,
                private readonly toastr: ToastrService,
                private readonly languageService: LanguageService,
                private readonly navigationService: NavigationService,
                private readonly translateService: TranslateService) {
        this.userSubscription = this.authenticationService.getUser().subscribe(data => {
            this.user = data;
            if (data) {
                this.reporters = [data.username];
                this.assignees = [data.username];
                // Trigger initial search once user is loaded and country is available
                if (this.country) {
                    // Use setTimeout to ensure this runs after ngOnInit sets the country
                    setTimeout(() => {
                        if (this.user && this.country) {
                            this.searchQuery.next('');
                        }
                    }, 0);
                }
            }
        });
        this.extensionSubscription = this.configService.getExtension().subscribe(extension => {
            this.extension = extension;
            if (extension) {
                this.populateUserDisplayMap();
            }
        });

        this.subscription = this.searchQuery.pipe(
            debounceTime(300), // Delay for 300ms after the last event
            tap(() => {
                this.requestLoading = true;
                this.requests = [];
            }),
            switchMap(searchText => {
                // Ensure user and country are available before making API call
                if (!this.user || !this.country) {
                    return of({content: [], totalElements: 0});
                }
                
                this.searchText = searchText;
                const sortParam = `${this.sortColumn},${this.sortDirection}`;
                this.visibleRequests = 100; // Reset visible requests on new search
                this.totalRequests = 0; // Reset total requests on new search
                
                if (this.isStaff(this.user)) {
                    return this.authoringService.searchRMPTask(this.country, searchText, this.visibleRequests, 0, sortParam, this.statusList);
                }
                return this.authoringService.searchRMPTask(this.country, searchText, this.visibleRequests, 0, sortParam, this.statusList, null, [this.user.login]);
            })
        ).subscribe((response: any) => {
            if (response?.content) {
                this.requests = response.content as Request[];
                this.totalRequests = response.totalElements as number;
            } else {
                this.requests = [];
                this.totalRequests = 0;
            }
            this.requestLoading = false; // Reset loading state after the request completes
        });
    }

    ngOnInit(): void {
        this.languageService.initializeLanguageFromUrl();
        this.country = this.activatedRoute.snapshot.paramMap.get('country');
        this.configService.setExtension(this.config.extensions.find(extension => extension.shortCode === this.activatedRoute.snapshot.paramMap.get('country')));
        
        // Trigger initial search if user is already loaded
        if (this.user && this.country) {
            this.searchQuery.next('');
        }
    }

    navigateToNewRequest(): void {
        this.navigationService.navigateWithLanguage([this.country, 'new-request']);
    }

    navigateToRequest(requestId: number): void {
        this.navigationService.navigateWithLanguage([this.country, requestId]);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
        if (this.extensionSubscription) {
            this.extensionSubscription.unsubscribe();
        }
    }

    onSearchInput() {
        this.searchQuery.next(this.searchText);
    }

    loadMore(): void {
        this.visibleRequests += 100;
        this.searchRequests();
    }

    deleteRequest(request: Request): void {
        this.authoringService.httpDeleteRMPRequest(request.id).subscribe({
            next: () => {
                this.toastr.clear();
                this.toastr.success(this.translateService.instant('requestManagement.delete.successMessage', {id: request.id}), this.translateService.instant('requestManagement.delete.successTitle'));
                this.searchRequests();
                this.deleteOption = null;
            },
            error: error => {
                this.toastr.clear();
                this.toastr.error(this.translateService.instant('requestManagement.delete.errorMessage', {error: error}), this.translateService.instant('requestManagement.delete.errorTitle'));
                this.deleteOption = null;
            }
        });
    }

    sortRequests(column: string): void {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        this.searchRequests();
    }

    resetVisibleRequests(): void {
        this.visibleRequests = 100;
        this.totalRequests = 0;
    }

    searchRequests(): void {
        // Ensure user and country are available before making API call
        if (!this.user || !this.country) {
            this.requests = [];
            this.totalRequests = 0;
            this.requestLoading = false;
            return;
        }

        this.requestLoading = true;
        this.requests = [];

        this.statusList = this.calculateStatus();

        const sortParam = this.sortColumn + ',' + this.sortDirection;
        if (this.isStaff(this.user)) {
            this.reporters = this.myRequests ? this.reporters : null;
        } else {
            this.reporters = [this.user.login];
        }
        this.authoringService.searchRMPTask(this.country, this.searchText.trim(), this.visibleRequests, 0, sortParam, this.statusList, this.assignedRequests ? this.assignees : null, this.reporters).subscribe({
            next: (response) => {
                this.requests = response.content as Request[];
                this.totalRequests = response.totalElements as number;
                this.requestLoading = false;
            }
        });
    }

    calculateStatus(): string[] {
        if (this.openRequests && this.closedRequests) return ['NEW', 'ACCEPTED', 'IN_PROGRESS', 'ON_HOLD', 'CLARIFICATION_REQUESTED', 'APPEAL_CLARIFICATION_REQUESTED', 'UNDER_APPEAL', 'READY_FOR_RELEASE', 'CLOSED', 'REJECTED', 'WITHDRAWN', 'APPEAL_REJECTED', 'PUBLISHED'];
        if (this.openRequests) return ['NEW', 'ACCEPTED', 'IN_PROGRESS', 'ON_HOLD', 'CLARIFICATION_REQUESTED', 'APPEAL_CLARIFICATION_REQUESTED', 'UNDER_APPEAL', 'READY_FOR_RELEASE'];
        if (this.closedRequests) return ['CLOSED', 'REJECTED', 'WITHDRAWN', 'APPEAL_REJECTED', 'PUBLISHED'];
        return [];
    }

    isUser(user: User): boolean {
        return user ? user.roles.includes('ROLE_rmp-' + this.extension.shortCode + '-requestor') : false;
    }

    isStaff(user: User): boolean {
        return user ? user.roles.includes('ROLE_rmp-' + this.extension.shortCode + '-staff') : false;
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

    downloadRequestsAsTSV(): void {
        // Ensure user and country are available before proceeding
        if (!this.user || !this.country) {
            this.toastr.warning(this.translateService.instant('requestManagement.download.waitForRequest'), this.translateService.instant('requestManagement.download.requestInProgress'));
            return;
        }

        if (this.requestLoading) {
            this.toastr.warning(this.translateService.instant('requestManagement.download.waitForRequest'), this.translateService.instant('requestManagement.download.requestInProgress'));
            return;
        }

        this.toastr.info(this.translateService.instant('requestManagement.download.fetchingRequests'), this.translateService.instant('requestManagement.download.pleaseWait'));

        // Fetch all requests from server with current filters using pagination
        const sortParam = `${this.sortColumn},${this.sortDirection}`;
        const statusList = this.calculateStatus();
        const pageSize = 500;
        let allRequests: Request[] = [];
        let currentPage = 0;
        let totalElements = 0;
        let hasMorePages = true;

        const fetchAllRequests = (): void => {
            this.authoringService.searchRMPTask(
                this.country,
                this.searchText.trim(),
                pageSize,
                currentPage,
                sortParam,
                statusList,
                this.assignedRequests ? this.assignees : null,
                this.myRequests ? this.reporters : (this.isStaff(this.user) ? null : [this.user.login])
            ).subscribe({
                next: (response) => {
                    const pageRequests = response.content as Request[];
                    const totalElementsFromResponse = response.totalElements as number;
                    
                    if (currentPage === 0) {
                        totalElements = totalElementsFromResponse;
                    }

                    if (pageRequests && pageRequests.length > 0) {
                        allRequests = allRequests.concat(pageRequests);
                    }

                    // Check if we have more pages to fetch
                    hasMorePages = (currentPage + 1) * pageSize < totalElements;
                    currentPage++;

                    if (hasMorePages) {
                        // Continue fetching next page
                        fetchAllRequests();
                    } else {
                        // All pages fetched, proceed with download
                        this.processDownload(allRequests);
                    }
                },
                error: (error) => {
                    this.toastr.clear();
                    this.toastr.error(this.translateService.instant('requestManagement.download.fetchFailed'), this.translateService.instant('requestManagement.download.downloadError'));
                    console.error('Error fetching requests for download:', error);
                }
            });
        };

        // Start fetching all requests
        fetchAllRequests();
    }

    private processDownload(allRequests: Request[]): void {
        if (!allRequests || allRequests.length === 0) {
            this.toastr.warning(this.translateService.instant('requestManagement.download.noRequestsFound'), this.translateService.instant('requestManagement.download.noData'));
            return;
        }

        // Create TSV headers
        const headers = [
            this.translateService.instant('requestManagement.tsvHeaders.id'),
            this.translateService.instant('requestManagement.tsvHeaders.summary'),
            this.translateService.instant('requestManagement.tsvHeaders.type'),
            this.translateService.instant('requestManagement.tsvHeaders.status'),
            this.translateService.instant('requestManagement.tsvHeaders.createdDate'),
            this.translateService.instant('requestManagement.tsvHeaders.updatedDate'),
            this.translateService.instant('requestManagement.tsvHeaders.reporter'),
            this.translateService.instant('requestManagement.tsvHeaders.assignee')
        ];

        // Create TSV rows
        const rows = allRequests.map(request => [
            request.id?.toString() || '',
            this.escapeTSVField(request.summary || ''),
            this.transformRequestType(request.type || ''),
            this.transformStatus(request.status || ''),
            request.created ? new Date(request.created).toISOString().split('T')[0] : '',
            request.updated ? new Date(request.updated).toISOString().split('T')[0] : '',
            this.escapeTSVField(this.getDisplayName(request.reporter) || ''),
            this.escapeTSVField(this.getDisplayName(request.assignee) || 'Unassigned')                    
        ]);

        // Combine headers and rows
        const tsvContent = [headers.join('\t'), ...rows.map(row => row.join('\t'))].join('\n');

        // Create and trigger download
        const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
        link.setAttribute('download', `requests_${this.country}_${timestamp}.tsv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        this.toastr.clear();
        this.toastr.success(this.translateService.instant('requestManagement.download.downloadedSuccessfully', {count: allRequests.length}), this.translateService.instant('requestManagement.download.downloadComplete'));
    }

    private escapeTSVField(field: string): string {
        if (!field) return '';
        // Escape tabs, newlines, and double quotes in TSV fields
        return field.replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/"/g, '""');
    }

    private transformStatus(status: string): string {
        if (!status) return '';
        return StatusEnum[status] || status;
    }

    private transformRequestType(type: string): string {
        if (!type) return '';
        return RequestTypeEnum[type.replace('-', '_').toLowerCase()] || type;
    }

    private populateUserDisplayMap(): void {
        if (!this.extension) {
            return;
        }
        this.authoringService.httpGetUsersByRole('rmp-' + this.extension.shortCode + '-staff').subscribe({
            next: (staff: any) => {
                const staffUsers: any[] = staff?.users?.items ?? [];
                staffUsers.forEach((u: any) => {
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
            error: () => {}
        });
        this.authoringService.httpGetUsersByRole('rmp-' + this.extension.shortCode + '-requestor').subscribe({
            next: (requestors: any) => {
                const reqUsers: any[] = requestors?.users?.items ?? [];
                reqUsers.forEach((u: any) => {
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
            error: () => {}
        });
    }
}
