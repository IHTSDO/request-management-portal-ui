import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InstanceService {

    instance = new Subject();
    language = new Subject();

    constructor() {
    }

    // Setters & Getters: Instance
    setInstance(instance) {
        this.instance.next(instance);
    }

    getInstance() {
        return this.instance.asObservable();
    }

    // Setters & Getters: Language
    setLanguage(language) {
        this.language.next(language);
    }

    getLanguage() {
        return this.language.asObservable();
    }
}
