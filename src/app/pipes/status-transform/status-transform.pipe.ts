import {Pipe, PipeTransform} from '@angular/core';

export enum StatusEnum {
    NEW = 'New',
    ACCEPTED = 'Accepted',
    IN_PROGRESS = 'In Progress',
    READY_FOR_RELEASE = 'Ready for Release',
    PUBLISHED = 'Published',
    ON_HOLD = 'On Hold',
    CLOSED = 'Closed',
    CLARIFICATION_REQUESTED = 'Clarification Requested',
    APPEAL_CLARIFICATION_REQUESTED = 'Appeal Clarification Requested',
    UNDER_APPEAL = 'Under Appeal',
    APPEAL_REJECTED = 'Appeal Rejected',
    WITHDRAWN = 'Withdrawn',
    REJECTED = 'Rejected',
    UNKNOWN = 'Unknown'
}

@Pipe({
    name: 'statusTransform'
})
export class StatusTransformPipe implements PipeTransform {

    transform(value: string): string {
        if (value == null || value == null) {
            return '';
        }
        return StatusEnum[value] || value;
    }

}
