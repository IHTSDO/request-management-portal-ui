import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { FieldHelpAnchor, FieldHelpOverlayService } from '../../services/field-tooltip/field-help-overlay.service';

@Component({
    selector: 'app-field-help-overlay',
    standalone: true,
    imports: [CommonModule],
    template: `
        <ng-container *ngIf="state$ | async as state">
            <div *ngIf="state.visible"
                 #tooltip
                 [id]="state.tooltipId"
                 role="tooltip"
                 class="field-help-overlay"
                 (mouseenter)="onEnter(state.sourceId)"
                 (mouseleave)="onLeave(state.sourceId)">{{ state.text }}</div>
        </ng-container>
    `,
    styles: [`
        .field-help-overlay {
            position: fixed;
            z-index: 80;
            box-sizing: border-box;
            width: max-content;
            max-width: min(28rem, calc(100vw - 1rem));
            padding: 0.75rem 0.85rem;
            border: 1px solid #bae6fd;
            border-radius: 0.5rem;
            background: #fff;
            box-shadow: 0 10px 15px -3px rgb(15 23 42 / 0.12), 0 4px 6px -4px rgb(15 23 42 / 0.08);
            color: #475569;
            font-size: 0.75rem;
            font-weight: 400;
            line-height: 1.4;
            white-space: pre-line;
            text-align: left;
            text-indent: 0;
            pointer-events: auto;
            visibility: hidden;
        }
    `]
})
export class FieldHelpOverlayComponent implements AfterViewChecked {
    @ViewChild('tooltip') tooltip?: ElementRef<HTMLElement>;
    readonly state$ = this.fieldHelpOverlayService.state$;
    private lastLayoutKey = '';

    constructor(private readonly fieldHelpOverlayService: FieldHelpOverlayService) {}

    ngAfterViewChecked(): void {
        const el = this.tooltip?.nativeElement;
        const state = this.fieldHelpOverlayService.current;
        if (!el || !state.anchor) {
            this.lastLayoutKey = '';
            return;
        }

        const key = `${state.sourceId}:${state.text}:${state.anchor.top}:${state.anchor.left}:${state.anchor.bottom}`;
        if (key === this.lastLayoutKey) {
            return;
        }

        this.fitToLongestLine(el);
        this.placeBesideAnchor(el, state.anchor);
        this.lastLayoutKey = key;
    }

    onEnter(sourceId: string): void {
        this.fieldHelpOverlayService.keepOpen(sourceId);
    }

    onLeave(sourceId: string): void {
        this.fieldHelpOverlayService.scheduleHide(sourceId);
    }

    private fitToLongestLine(el: HTMLElement): void {
        el.style.width = 'max-content';

        const range = document.createRange();
        range.selectNodeContents(el);
        const rects = range.getClientRects();
        let longestLine = 0;
        for (let i = 0; i < rects.length; i++) {
            longestLine = Math.max(longestLine, rects[i].width);
        }
        if (longestLine <= 0) {
            return;
        }

        const styles = getComputedStyle(el);
        const extra = styles.boxSizing === 'border-box'
            ? parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)
                + parseFloat(styles.borderLeftWidth) + parseFloat(styles.borderRightWidth)
            : 0;
        el.style.width = `${Math.ceil(longestLine + extra)}px`;
    }

    private placeBesideAnchor(el: HTMLElement, anchor: FieldHelpAnchor): void {
        const margin = 8;
        const tooltipWidth = el.offsetWidth;
        const tooltipHeight = el.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = anchor.left;
        if (left + tooltipWidth > viewportWidth - margin) {
            left = Math.max(margin, viewportWidth - tooltipWidth - margin);
        }

        let top = anchor.bottom + margin;
        const overflowsBottom = top + tooltipHeight > viewportHeight - margin;
        const fitsAbove = anchor.top - margin - tooltipHeight >= margin;
        if (overflowsBottom && fitsAbove) {
            top = anchor.top - tooltipHeight - margin;
        } else {
            top = Math.min(top, Math.max(margin, viewportHeight - tooltipHeight - margin));
        }

        el.style.left = `${Math.max(margin, left)}px`;
        el.style.top = `${Math.max(margin, top)}px`;
        el.style.visibility = 'visible';
    }
}
