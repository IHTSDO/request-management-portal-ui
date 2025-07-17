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

@Component({
    selector: 'app-request-management',
    imports: [RouterLink, CommonModule, FormsModule, StatusTransformPipe, RequestTypeTransformPipe, UserRequestsPipe],
    templateUrl: './request-management.component.html',
    styleUrl: './request-management.component.scss'
})
export class RequestManagementComponent implements OnInit, OnDestroy {

    deleteOption: Request | null;

    user!: User;
    userSubscription: Subscription;

    requests: Request[] = [];
    country: string;
    requestLoading: boolean = false;
    totalRequests: number = 0;
    visibleRequests: number = 100;
    searchText: string = '';

    searchQuery = new BehaviorSubject<string>('');
    private readonly subscription: Subscription;

    constructor(private readonly authoringService: AuthoringService,
                private readonly activatedRoute: ActivatedRoute,
                private readonly authenticationService: AuthenticationService,
                private readonly toastr: ToastrService) {
        this.userSubscription = this.authenticationService.getUser().subscribe(data => this.user = data);

        this.subscription = this.searchQuery.pipe(
            debounceTime(300), // Delay for 300ms after the last event
            tap(() => {
                this.requestLoading = true;
                this.requests = [];
            }),
            switchMap(searchText => this.authoringService.searchRMPTask(this.country, searchText)) // Switch to the new observable, cancels the previous one
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
        this.searchRequests(this.searchText);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    onSearchInput() {
        this.searchQuery.next(this.searchText);
    }

    loadMore(): void {
        this.visibleRequests += 100;
        this.searchRequests(this.searchText);
    }

    deleteRequest(request: Request): void {
        this.authoringService.httpDeleteRMPRequest(request.id).subscribe({
            next: () => {
                this.toastr.clear();
                this.toastr.success('Request with ID: ' + request.id + ' has been deleted successfully.', 'Request Deleted');
                this.searchRequests(this.searchQuery.getValue()); // Refresh the list after deletion
                this.deleteOption = null;
            },
            error: error => {
                this.toastr.clear();
                this.toastr.error('Error deleting request: ' + error, 'Error');
                this.deleteOption = null;
            }
        });
    }

    private searchRequests(searchText: string): void {
        this.requestLoading = true;
        this.requests = [];
        let httpRequest = null;
        if (!searchText || searchText.trim().length === 0) {
            httpRequest = this.authoringService.httpGetRMPRequests(this.country, this.visibleRequests);
        } else {
            searchText = searchText.trim();
            httpRequest = this.authoringService.searchRMPTask(this.country, searchText, this.visibleRequests);
        }
        httpRequest.subscribe(response => {
            if (response?.content) {
                this.requests = response.content as Request[];
            }
            this.requestLoading = false;
        });
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
