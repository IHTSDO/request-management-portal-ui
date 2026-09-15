import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FieldHelpOverlayService } from '../../services/field-tooltip/field-help-overlay.service';

@Component({
    selector: 'app-field-help-overlay',
    standalone: true,
    imports: [CommonModule],
    template: `
        <ng-container *ngIf="state$ | async as state">
            <div *ngIf="state.visible"
                 [id]="state.tooltipId"
                 role="tooltip"
                 class="field-help-overlay"
                 [style.top]="state.top"
                 [style.left]="state.left"
                 (mouseenter)="onEnter(state.sourceId)"
                 (mouseleave)="onLeave(state.sourceId)">
                {{ state.text }}
            </div>
        </ng-container>
    `,
    styles: [`
        .field-help-overlay {
            position: fixed;
            z-index: 80;
            width: 20rem;
            max-width: calc(100vw - 1rem);
            padding: 0.75rem 0.9rem;
            border: 1px solid #bae6fd;
            border-radius: 0.5rem;
            background: #fff;
            box-shadow: 0 10px 15px -3px rgb(15 23 42 / 0.12), 0 4px 6px -4px rgb(15 23 42 / 0.08);
            color: #475569;
            font-size: 0.75rem;
            font-weight: 400;
            line-height: 1.4;
            white-space: pre-wrap;
            text-align: left;
        }
    `]
})
export class FieldHelpOverlayComponent {
    readonly state$ = this.fieldHelpOverlayService.state$;

    constructor(private readonly fieldHelpOverlayService: FieldHelpOverlayService) {}

    onEnter(sourceId: string): void {
        this.fieldHelpOverlayService.keepOpen(sourceId);
    }

    onLeave(sourceId: string): void {
        this.fieldHelpOverlayService.scheduleHide(sourceId);
    }
}
