import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthoringService } from '../authoring/authoring.service';
import { BranchingService } from '../branching/branching.service';
import { Request } from '../../models/request';
import {ExtensionService} from '../extension/extension.service';

@Injectable({
    providedIn: 'root'
})
export class JiraService {

    private branchPath: string;
    private branchPathSubscription: Subscription;

    private extension: any;
    private extensionSubscription: Subscription;

    constructor(private http: HttpClient,
                private authoringService: AuthoringService,
                private branchingService: BranchingService,
                private extensionService: ExtensionService) {
        this.branchPathSubscription = this.branchingService.getBranchPath().subscribe(data => this.branchPath = data);
        this.extensionSubscription = this.extensionService.getExtension().subscribe(data => this.extension = data);

    }

    postJiraIssue(request: Request, requestType: string): Observable<object> {
        const params = this.createRequestObject(request, requestType);
        console.log('params: ', params);
        return this.http.post<object>('/jira/issue', params);
    }

    createRequestObject(request: Request, requestType: string) {
        console.log('extension: ', this.extension);
        const requestObject = {
            'fields': {
                'project': {'key': this.extension.projectKey},
                'issuetype': {'id': requestType}
            }
        };

        if (request.summary) {
            requestObject.fields['summary'] = request.summary;
        }

        if (request.language) {
            requestObject.fields['customfield_15000'] = { 'value': request.language };
        }

        if (request.context) {
            requestObject.fields['customfield_15001'] = { 'value': request.context };
        }

        if (request.justification) {
            requestObject.fields['customfield_14205'] = request.justification;
        }

        if (request.reference) {
            requestObject.fields['customfield_14204'] = request.reference;
        }

        if (request.newFSN) {
            requestObject.fields['customfield_14208'] = request.newFSN;
        }

        if (request.newPreferredTerm) {
            requestObject.fields['customfield_14209'] = request.newPreferredTerm;
        }

        if (request.parentConcept) {
            requestObject.fields['customfield_14206'] = request.parentConcept;
        }

        if (request.conceptId) {
            requestObject.fields['customfield_10602'] = request.conceptId;
        }

        if (request.conceptName) {
            requestObject.fields['customfield_10601'] = request.conceptName;
        }

        if (request.newRelationship) {
            requestObject.fields['customfield_14214'] = request.newRelationship;
        }

        if (request.relationshipType) {
            requestObject.fields['customfield_14216'] = { 'value': request.relationshipType };
        }

        if (request.newDescription) {
            requestObject.fields['customfield_14213'] = request.newDescription;
        }

        if (request.existingRelationship) {
            requestObject.fields['customfield_14212'] = request.existingRelationship;
        }

        if (request.destinationConcept) {
            requestObject.fields['customfield_14215'] = request.destinationConcept;
        }

        if (request.existingDescription) {
            requestObject.fields['customfield_14211'] = request.existingDescription;
        }

        if (request.eclQuery) {
            requestObject.fields['customfield_15901'] = request.eclQuery;
        }

        if (request.membersList) {
            requestObject.fields['customfield_15902'] = request.membersList;
        }

        return requestObject;
    }
}
