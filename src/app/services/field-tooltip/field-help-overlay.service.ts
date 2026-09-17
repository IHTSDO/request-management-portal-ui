import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FieldHelpAnchor {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export interface FieldHelpOverlayState {
    visible: boolean;
    text: string;
    tooltipId: string;
    sourceId: string;
    anchor: FieldHelpAnchor | null;
    pinned: boolean;
}

const HIDDEN_STATE: FieldHelpOverlayState = {
    visible: false,
    text: '',
    tooltipId: '',
    sourceId: '',
    anchor: null,
    pinned: false
};

@Injectable({
    providedIn: 'root'
})
export class FieldHelpOverlayService {
    private readonly stateSubject = new BehaviorSubject<FieldHelpOverlayState>(HIDDEN_STATE);
    readonly state$ = this.stateSubject.asObservable();
    private hideTimer: ReturnType<typeof setTimeout> | null = null;

    show(sourceId: string, text: string, tooltipId: string, anchor: FieldHelpAnchor, pinned = false): void {
        this.clearHideTimer();
        this.stateSubject.next({
            visible: true,
            text,
            tooltipId,
            sourceId,
            anchor,
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

    get current(): FieldHelpOverlayState {
        return this.stateSubject.value;
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
