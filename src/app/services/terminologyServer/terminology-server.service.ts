import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { AuthoringService } from '../authoring/authoring.service';
import { BranchingService } from '../branching/branching.service';
import { map } from 'rxjs/operators';
import { SnomedUtilityService } from '../snomedUtility/snomed-utility.service';
import { SnomedResponseObject } from '../../models/snomedResponseObject';
import { Configuration } from '../../models/configuration';

@Injectable({
    providedIn: 'root'
})
export class TerminologyServerService {

    private branchPath: string;
    private branchPathSubscription: Subscription;

    private configuration: any;
    private configurationSubscription: Subscription;

    constructor(private http: HttpClient,
                private authoringService: AuthoringService,
                private branchingService: BranchingService) {
        this.branchPathSubscription = this.branchingService.getBranchPath().subscribe(data => this.branchPath = data);
        this.configurationSubscription = this.authoringService.getConfig().subscribe(data => this.configuration = data);
    }

    getTypeahead(term) {
        const params = {
            termFilter: term,
            limit: 20,
            expand: 'fsn()',
            activeFilter: true,
            termActive: true
        };
        return this.http.get(this.configuration.terminologyServerEndpoint + this.branchPath + '/concepts?activeFilter=true&termActive=true&limit=20&term=' + term)
            .pipe(map(responseData => {
                const typeaheads = [];

                responseData['items'].forEach((item) => {
                    typeaheads.push(SnomedUtilityService.convertShortConceptToString(item));
                });

                return typeaheads;
            }));
    }

    getVersions(showFutureVersions): Observable<SnomedResponseObject> {
        return this.http.get<SnomedResponseObject>(this.configuration.terminologyServerEndpoint +
            'codesystems/SNOMEDCT/versions?showFutureVersions=' + showFutureVersions);
    }
}
