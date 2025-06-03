import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {User} from '../../models/user';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {

    private activeLanguage = new BehaviorSubject<string>('gb');


    constructor() {
    }

    setActiveLanguage(language: string) {
        this.activeLanguage.next(language);
    }

    getActiveLanguage() {
        return this.activeLanguage.asObservable();
    }
}
