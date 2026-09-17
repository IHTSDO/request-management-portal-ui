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
        const anchor = this.getAnchor();
        if (!anchor) {
            return;
        }
        this.fieldHelpOverlayService.show(
            this.sourceId,
            this.tooltipText,
            this.tooltipId,
            anchor,
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
        const anchor = this.getAnchor();
        if (!anchor) {
            return;
        }
        this.fieldHelpOverlayService.show(
            this.sourceId,
            this.tooltipText,
            this.tooltipId,
            anchor,
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

    private getAnchor() {
        const button = this.elementRef.nativeElement.querySelector('.field-help-button') as HTMLElement | null;
        if (!button) {
            return null;
        }
        const rect = button.getBoundingClientRect();
        return {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right
        };
    }
}
