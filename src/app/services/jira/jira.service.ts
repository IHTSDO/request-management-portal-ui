import { Injectable } from '@angular/core';
import { Observable, Subscription } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { AuthoringService } from "../authoring/authoring.service";
import { BranchingService } from "../branching/branching.service";
import { Request } from "../../models/request";
import { Configuration } from "../../models/configuration";

@Injectable({
    providedIn: 'root'
})
export class JiraService {

    private branchPath: string;
    private branchPathSubscription: Subscription;

    private configuration: Configuration;
    private configurationSubscription: Subscription;

    constructor(private http: HttpClient,
                private authoringService: AuthoringService,
                private branchingService: BranchingService) {
        this.branchPathSubscription = this.branchingService.getBranchPath().subscribe(data => this.branchPath = data);
        this.configurationSubscription = this.authoringService.getConfig().subscribe(data => this.configuration = data);

    }

    postJiraIssue(request: Request, requestType: string): Observable<object> {
        let params = this.createRequestObject(request, requestType);
        return this.http.post<object>('/jira/issue', params);
    }

    createRequestObject(request: Request, requestType: string) {
        let requestObject = {
            "fields": {
                "project": {"key": this.configuration.extension.projectKey},
                "issuetype": {"id": requestType}
            }
        };

        if (request.summary) {
            requestObject.fields['summary'] = request.summary;
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
            requestObject.fields['customfield_14216'] = { "value": request.relationshipType };
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

        return requestObject;
    }
}
