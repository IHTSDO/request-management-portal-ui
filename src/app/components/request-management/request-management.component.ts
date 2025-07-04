import {CommonModule} from '@angular/common';
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {Request} from '../../models/request';
import {AuthoringService} from '../../services/authoring/authoring.service';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmationModalComponent} from '../confirmation-modal/confirmation-modal.component';
import {ToastrService} from 'ngx-toastr';
import {debounceTime, BehaviorSubject, Subscription, switchMap, tap} from 'rxjs';
import {MatPaginatorModule, MatPaginator} from '@angular/material/paginator';
import {StatusTransformPipe} from '../../pipes/status-transform/status-transform.pipe';
import {RequestTypeTransformPipe} from '../../pipes/request-type-transform/request-type-transform.pipe';
import {ImsService} from '../../services/ims/ims.service';

@Component({
    selector: 'app-request-management',
    imports: [RouterLink, CommonModule, MatPaginatorModule, StatusTransformPipe, RequestTypeTransformPipe],
    templateUrl: './request-management.component.html',
    styleUrl: './request-management.component.scss'
})
export class RequestManagementComponent implements OnInit, OnDestroy {

    users: any[] = [];
    requests: Request[] = [];
    country: string;
    requestLoading: boolean = false;

    searchQuery = new BehaviorSubject<string>('');
    private readonly subscription: Subscription;

    // MatPaginator properties
    @ViewChild('requestsPaginator') requestsPaginator: MatPaginator;
    totalRecords: number;
    pageSize: number = 10;
    pageIndex: number = 0;
    pageSizeOptions: number[] = [5, 10, 25, 50, 100];

    constructor(private readonly authoringService: AuthoringService,
                private readonly imsService: ImsService,
                private readonly activatedRoute: ActivatedRoute,
                private readonly dialog: MatDialog,
                private readonly toastr: ToastrService) {

        this.subscription = this.searchQuery.pipe(
            debounceTime(300), // Delay for 300ms after the last event
            tap(() => {
                this.requestLoading = true;
                this.pageIndex = 0; // Reset page index on new search
                this.totalRecords = 0; // Reset total records count
                this.requests = [];
            }),
            switchMap(searchText => this.authoringService.searchRMPTask(this.country, searchText, this.pageIndex, this.pageSize)) // Switch to the new observable, cancels the previous one
        ).subscribe((response: any) => {
            if (response?.content) {
                this.requests = response.content as Request[];
                this.getUsers(); // Fetch user details for the requests
            } else {
                this.requests = [];
            }
            this.totalRecords = response.totalElements;
            this.requestLoading = false; // Reset loading state after the request completes
        });
    }

    ngOnInit(): void {
        this.country = this.activatedRoute.snapshot.paramMap.get('country');
        this.searchRequests('');
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    getUserDisplayName(username: string): string {
        const user = this.users.find(user => user.username === username);
        if (user) {
            return user.displayName || username;
        }
        return username;
    }

    onSearchInput(event: any) {
        this.searchQuery.next(event.target.value);
    }

    onPageChange(event) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.searchRequests(this.searchQuery.getValue());

    }

    deleteRequest(request: Request): void {
        const dialogRef = this.dialog.open(ConfirmationModalComponent, {
            data: {message: 'Are you sure you want to delete the request with ID: #' + request.id + '? This action can not be undone.'}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.toastr.info('Deleting request with ID: ' + request.id, 'Deleting Request');
                this.authoringService.httpDeleteRMPRequest(request.id).subscribe(() => {
                    this.toastr.clear(); // Clear any previous toastr messages
                    this.toastr.success('Request with ID: ' + request.id + ' has been deleted successfully.', 'Request Deleted');
                    if (this.requests.length === 1 && this.pageIndex > 0) {
                        this.pageIndex--; // Adjust page index if the last item on the current page was deleted
                    }
                    this.searchRequests(this.searchQuery.getValue()); // Refresh the list after deletion
                }, error => {
                    this.toastr.clear(); // Clear any previous toastr messages
                    this.toastr.error('Error deleting request: ' + error, 'Error');
                });
            } else {
                console.log('User dismissed!');
            }
        });
    }

    private getUsers(): void {
        let userNames = [];
        for (let i = 0; i < this.requests.length; i++) {
            if (!this.users.find(u => u.username === this.requests[i].reporter) && userNames.indexOf(this.requests[i].reporter) === -1) {
                // Fetch user details only if not already present
                // Avoid duplicate API calls for the same user
                userNames.push(this.requests[i].reporter);
                this.imsService.httpGetUser(this.requests[i].reporter).subscribe(user => {
                    if (!this.users.find(u => u.username === user.username)) {
                        this.users.push(user);
                    }
                });
            }
        }
    }

    private searchRequests(searchText: string): void {
        this.requestLoading = true;
        this.requests = [];
        let httpRequest = null;
        if (!searchText || searchText.trim().length === 0) {
            httpRequest = this.authoringService.httpGetRMPRequests(this.country, this.pageIndex, this.pageSize);
        } else {
            searchText = searchText.trim();
            httpRequest = this.authoringService.searchRMPTask(this.country, searchText, this.pageIndex, this.pageSize);
        }
        httpRequest.subscribe(response => {
            if (response?.content) {
                this.requests = response.content as Request[];
            }
            this.totalRecords = response.totalElements;
            this.requestLoading = false;
        });
    }

}
