import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ExtensionService {

    extension = new Subject();
    language = new Subject();

    constructor() {
    }

    // Setters & Getters: Extension
    setExtension(extension) {
        this.extension.next(extension);
    }

    getExtension() {
        return this.extension.asObservable();
    }

    // Setters & Getters: Language
    setLanguage(language) {
        this.language.next(language);
    }

    getLanguage() {
        return this.language.asObservable();
    }
}
