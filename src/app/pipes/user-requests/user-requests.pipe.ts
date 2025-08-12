import {Pipe, PipeTransform} from '@angular/core';
import {User} from '../../models/user';
import {Request} from '../../models/request';

@Pipe({
    name: 'userRequests'
})
export class UserRequestsPipe implements PipeTransform {

    transform(requests: Request[], user: User): Request[] {
        let results: Request[] = [];

        if (!user || this.isStaff(user)) {
            return requests;
        }

        results = requests.filter((request: Request) => request.reporter === user.login)

        return results;
    }

    isStaff(user: User): boolean {
        return user.roles.includes('ROLE_ms-belgium')
            || user.roles.includes('ROLE_ms-denmark')
            || user.roles.includes('ROLE_ms-estonia')
            || user.roles.includes('ROLE_ms-ireland')
            || user.roles.includes('ROLE_ms-newzealand')
            || user.roles.includes('ROLE_ms-france')
            || user.roles.includes('ROLE_ms-switzerland')
            || user.roles.includes('ROLE_ms-korea');
    }
}
