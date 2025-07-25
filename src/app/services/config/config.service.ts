import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {Extension} from '../../models/extension';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {

    private extension = new Subject<Extension>();

    constructor(private readonly http: HttpClient) {
    }

    setExtension(extension: Extension) {
        this.extension.next(extension);
        console.log(extension);
    }

    getExtension() {
        return this.extension.asObservable();
    }
}

