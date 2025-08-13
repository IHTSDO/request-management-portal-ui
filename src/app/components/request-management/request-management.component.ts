import {CommonModule} from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {Request} from '../../models/request';
import {AuthoringService} from '../../services/authoring/authoring.service';
import {ToastrService} from 'ngx-toastr';
import {debounceTime, BehaviorSubject, Subscription, switchMap, tap} from 'rxjs';
import {StatusTransformPipe} from '../../pipes/status-transform/status-transform.pipe';
import {RequestTypeTransformPipe} from '../../pipes/request-type-transform/request-type-transform.pipe';
import {FormsModule} from '@angular/forms';
import {UserRequestsPipe} from '../../pipes/user-requests/user-requests.pipe';
import {User} from '../../models/user';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import {TranslatePipe} from '@ngx-translate/core';
import * as data from 'public/config/config.json';
import {ConfigService} from '../../services/config/config.service';
import {Extension} from '../../models/extension';

@Component({
    selector: 'app-request-management',
    imports: [RouterLink, CommonModule, FormsModule, StatusTransformPipe, RequestTypeTransformPipe, UserRequestsPipe, TranslatePipe],
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
                private readonly toastr: ToastrService) {
        this.userSubscription = this.authenticationService.getUser().subscribe(data => {
            this.user = data;
            if (data) {
                this.reporters = [data.username];
                this.assignees = [data.username];
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
                this.searchText = searchText;
                const sortParam = `${this.sortColumn},${this.sortDirection}`;
                return this.authoringService.searchRMPTask(this.country, searchText, this.visibleRequests, 0, sortParam, this.statusList);
            })
        ).subscribe((response: any) => {
            if (response?.content) {
                this.requests = response.content as Request[];
                this.totalRequests = response.totalElements as number;
            } else {
                this.requests = [];
            }
            this.requestLoading = false; // Reset loading state after the request completes
        });
    }

    ngOnInit(): void {
        this.country = this.activatedRoute.snapshot.paramMap.get('country');
        this.configService.setExtension(this.config.extensions.find(extension => extension.shortCode === this.activatedRoute.snapshot.paramMap.get('country')));
        this.searchRequests();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
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
                this.toastr.success('Request with ID: ' + request.id + ' has been deleted successfully.', 'Request Deleted');
                this.searchRequests();
                this.deleteOption = null;
            },
            error: error => {
                this.toastr.clear();
                this.toastr.error('Error deleting request: ' + error, 'Error');
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

    searchRequests(): void {
        this.requestLoading = true;
        this.requests = [];
        let httpRequest = null;
        const sortParam = `${this.sortColumn},${this.sortDirection}`;
        if (!this.searchText || this.searchText.trim().length === 0) {
            httpRequest = this.authoringService.httpGetRMPRequests(this.country, this.visibleRequests, 0, sortParam);
        } else {
            httpRequest = this.authoringService.searchRMPTask(this.country, this.searchText.trim(), this.visibleRequests, 0, sortParam, this.statusList);
        }
        httpRequest.subscribe(response => {
            if (response?.content) {
                this.requests = response.content as Request[];
            }
            this.requestLoading = false;
        });
    }

    searchRequests2(): void {
        this.requestLoading = true;
        this.requests = [];

        this.statusList = this.calculateStatus();

        const sortParam = this.sortColumn + ',' + this.sortDirection;
        this.authoringService.searchRMPTask(this.country, this.searchText.trim(), this.visibleRequests, 0, sortParam, this.statusList, this.assignedRequests ? this.assignees : null, this.myRequests ? this.reporters : null).subscribe({
            next: (response) => {
                this.requests = response.content as Request[];
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

    private populateUserDisplayMap(): void {
        if (!this.extension) {
            return;
        }
        this.authoringService.httpGetUsersByRole('ms-' + this.extension.name.toLowerCase()).subscribe({
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
