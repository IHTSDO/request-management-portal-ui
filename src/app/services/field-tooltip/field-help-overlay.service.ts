import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FieldHelpOverlayState {
    visible: boolean;
    text: string;
    tooltipId: string;
    sourceId: string;
    top: string;
    left: string;
    pinned: boolean;
}

const HIDDEN_STATE: FieldHelpOverlayState = {
    visible: false,
    text: '',
    tooltipId: '',
    sourceId: '',
    top: '0px',
    left: '0px',
    pinned: false
};

@Injectable({
    providedIn: 'root'
})
export class FieldHelpOverlayService {
    private readonly stateSubject = new BehaviorSubject<FieldHelpOverlayState>(HIDDEN_STATE);
    readonly state$ = this.stateSubject.asObservable();
    private hideTimer: ReturnType<typeof setTimeout> | null = null;

    show(sourceId: string, text: string, tooltipId: string, top: string, left: string, pinned = false): void {
        this.clearHideTimer();
        this.stateSubject.next({
            visible: true,
            text,
            tooltipId,
            sourceId,
            top,
            left,
            pinned
        });
    }

    scheduleHide(sourceId: string): void {
        const current = this.stateSubject.value;
        if (!current.visible || current.sourceId !== sourceId || current.pinned) {
            return;
        }
        this.clearHideTimer();
        this.hideTimer = setTimeout(() => {
            const latest = this.stateSubject.value;
            if (latest.sourceId === sourceId && !latest.pinned) {
                this.hide(sourceId);
            }
        }, 180);
    }

    keepOpen(sourceId: string): void {
        if (this.stateSubject.value.sourceId !== sourceId) {
            return;
        }
        this.clearHideTimer();
    }

    hide(sourceId?: string): void {
        if (sourceId && this.stateSubject.value.sourceId !== sourceId) {
            return;
        }
        this.clearHideTimer();
        this.stateSubject.next(HIDDEN_STATE);
    }

    isActive(sourceId: string): boolean {
        const current = this.stateSubject.value;
        return current.visible && current.sourceId === sourceId;
    }

    isPinned(sourceId: string): boolean {
        const current = this.stateSubject.value;
        return current.visible && current.sourceId === sourceId && current.pinned;
    }

    private clearHideTimer(): void {
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
    }
}
