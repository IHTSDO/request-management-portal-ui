import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-request',
    imports: [FormsModule, NgIf],
    templateUrl: './request.component.html',
    styleUrl: './request.component.scss'
})
export class RequestComponent {
    public formType: string = 'add-concept';
}
