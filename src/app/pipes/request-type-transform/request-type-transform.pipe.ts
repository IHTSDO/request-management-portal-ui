import {Pipe, PipeTransform} from '@angular/core';

export enum RequestTypeEnum {
    add_concept = 'Add Concept',
    add_description = 'Add Description',
    add_relationship = 'Add Relationship',
    add_refset = 'Add Refset',
    change_description = 'Change Description',
    change_relationship = 'Change Relationship',
    change_refset = 'Change Refset',
    inactivate_description = 'Inactivate Description',
    inactivate_relationship = 'Inactivate Relationship',
    other = 'Other'
}

@Pipe({
    name: 'requestTypeTransform'
})

export class RequestTypeTransformPipe implements PipeTransform {

    transform(value: string): string {
        if (value == null || value == null) {
            return '';
        }
        return RequestTypeEnum[value.replace('-', '_').toLowerCase()] || value;
    }

}
