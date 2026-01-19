import {Pipe, PipeTransform} from '@angular/core';
import {User} from '../../models/user';
import {Request} from '../../models/request';
import { Extension } from '../../models/extension';

@Pipe({
    name: 'userRequests'
})
export class UserRequestsPipe implements PipeTransform {

    transform(requests: Request[], user: User, extension: Extension): Request[] {
        let results: Request[] = [];
        
        if (!requests || requests.length === 0) {
            return results;
        }

        if (user || this.isStaff(user, extension)) {
            return requests;
        }

        results = requests.filter((request: Request) => request.reporter === user.login)

        return results;
    }

    isStaff(user: User, extension: Extension): boolean { 
        return user.roles.includes('ROLE_rmp-' + extension.shortCode + '-staff');
    }
}
