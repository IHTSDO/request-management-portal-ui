import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, Input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { merge, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FieldHelpOverlayService } from '../../services/field-tooltip/field-help-overlay.service';
import { FieldTooltipService } from '../../services/field-tooltip/field-tooltip.service';

@Component({
    selector: 'app-field-label',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './field-label.component.html',
    styleUrl: './field-label.component.scss'
})
export class FieldLabelComponent implements OnInit, OnDestroy {
    @Input() htmlFor = '';
    @Input() labelKey = '';
    @Input() tooltipKey = '';
    @Input() required = false;

    labelText = '';
    tooltipText = '';

    private readonly destroy$ = new Subject<void>();
    private readonly onScroll = (): void => this.onViewportChange();

    constructor(
        private readonly translate: TranslateService,
        private readonly fieldTooltipService: FieldTooltipService,
        private readonly fieldHelpOverlayService: FieldHelpOverlayService,
        private readonly elementRef: ElementRef<HTMLElement>,
        @Inject(PLATFORM_ID) private readonly platformId: object
    ) {}

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            window.addEventListener('scroll', this.onScroll, true);
        }
        merge(
            of(null),
            this.translate.onLangChange,
            this.translate.onTranslationChange,
            this.fieldTooltipService.overlay$
        ).pipe(takeUntil(this.destroy$)).subscribe(() => this.refreshTexts());
    }

    ngOnDestroy(): void {
        if (isPlatformBrowser(this.platformId)) {
            window.removeEventListener('scroll', this.onScroll, true);
        }
        this.fieldHelpOverlayService.hide(this.sourceId);
        this.destroy$.next();
        this.destroy$.complete();
    }

    get sourceId(): string {
        return this.htmlFor || this.tooltipKey || 'field';
    }

    get tooltipId(): string {
        return `${this.sourceId}-field-tooltip`;
    }

    get open(): boolean {
        return this.fieldHelpOverlayService.isActive(this.sourceId);
    }

    show(): void {
        if (!this.tooltipText) {
            return;
        }
        const position = this.getPosition();
        this.fieldHelpOverlayService.show(
            this.sourceId,
            this.tooltipText,
            this.tooltipId,
            position.top,
            position.left,
            this.fieldHelpOverlayService.isPinned(this.sourceId)
        );
    }

    scheduleHide(): void {
        this.fieldHelpOverlayService.scheduleHide(this.sourceId);
    }

    toggle(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        if (!this.tooltipText) {
            return;
        }
        if (this.fieldHelpOverlayService.isPinned(this.sourceId)) {
            this.fieldHelpOverlayService.hide(this.sourceId);
            return;
        }
        const position = this.getPosition();
        this.fieldHelpOverlayService.show(
            this.sourceId,
            this.tooltipText,
            this.tooltipId,
            position.top,
            position.left,
            true
        );
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.open) {
            return;
        }
        const target = event.target as Node | null;
        if (target && this.elementRef.nativeElement.contains(target)) {
            return;
        }
        const tooltip = document.getElementById(this.tooltipId);
        if (tooltip && target && tooltip.contains(target)) {
            return;
        }
        this.fieldHelpOverlayService.hide(this.sourceId);
    }

    @HostListener('window:scroll')
    @HostListener('window:resize')
    onViewportChange(): void {
        if (this.open) {
            this.show();
        }
    }

    private refreshTexts(): void {
        this.labelText = this.labelKey ? this.translate.instant(this.labelKey) : '';
        this.tooltipText = this.tooltipKey ? this.fieldTooltipService.resolve(this.tooltipKey) : '';
    }

    private getPosition(): { top: string; left: string } {
        const button = this.elementRef.nativeElement.querySelector('.field-help-button') as HTMLElement | null;
        if (!button) {
            return { top: '0px', left: '0px' };
        }

        const rect = button.getBoundingClientRect();
        const tooltipWidth = 320;
        const margin = 8;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = rect.left;
        if (left + tooltipWidth > viewportWidth - margin) {
            left = Math.max(margin, viewportWidth - tooltipWidth - margin);
        }

        const estimatedHeight = 120;
        const spaceBelow = viewportHeight - rect.bottom;
        const top = spaceBelow < estimatedHeight && rect.top > estimatedHeight
            ? rect.top - estimatedHeight - margin
            : rect.bottom + margin;

        return {
            top: `${Math.max(margin, top)}px`,
            left: `${left}px`
        };
    }
}
