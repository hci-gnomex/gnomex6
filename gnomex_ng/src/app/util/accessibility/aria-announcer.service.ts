import { Inject, Injectable, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';
import { TreeKeyboardMoveService } from './tree-keyboard-move.service';

/**
 * Manages the application-wide `aria-live="assertive"` region used to announce
 * drag-and-drop state changes (keyboard AND mouse) to screen readers.
 *
 * WCAG criteria addressed:
 *   4.1.3 Status Messages (Level AA) — users are notified of move/copy results
 *         without requiring focus to move to the message.
 *
 * Usage:
 *   1. The service self-subscribes to `TreeKeyboardMoveService.announcement$`
 *      at construction time, so keyboard announcements are automatic.
 *   2. For mouse drag-and-drop, call `this.ariaAnnouncer.announce(message)` in
 *      each component's `onMoveNode` / `moveNode` handler.
 *
 * The live region `<div>` is created programmatically and appended to
 * `document.body`.  It is visually hidden via the global `.sr-only` class.
 * Injecting this service in `GnomexAppComponent` ensures it is instantiated
 * (and starts listening) at app startup.
 */
@Injectable({ providedIn: 'root' })
export class AriaAnnouncerService implements OnDestroy {

    private _el: HTMLElement;
    private _clearTimer: any = null;
    private _kbSub: Subscription;

    constructor(
        @Inject(DOCUMENT) private _doc: Document,
        private _treeKbMove: TreeKeyboardMoveService
    ) {
        this._el = this._createLiveRegion();
        // Keyboard-move announcements are wired automatically
        this._kbSub = this._treeKbMove.announcement$.subscribe(msg => this.announce(msg));
    }

    /**
     * Announce `message` to screen readers.
     *
     * The live region is cleared first so that identical consecutive messages
     * are re-announced (the browser does not re-read unchanged content).
     * A 50 ms delay gives the DOM time to register the cleared state before
     * the new text is written.
     */
    announce(message: string): void {
        if (!message) { return; }
        if (this._clearTimer) {
            clearTimeout(this._clearTimer);
            this._clearTimer = null;
        }
        this._el.textContent = '';
        this._clearTimer = setTimeout(() => {
            this._el.textContent = message;
            this._clearTimer = null;
        }, 50);
    }

    ngOnDestroy(): void {
        if (this._kbSub) { this._kbSub.unsubscribe(); }
        if (this._clearTimer) { clearTimeout(this._clearTimer); }
        if (this._el && this._el.parentNode) {
            this._el.parentNode.removeChild(this._el);
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private _createLiveRegion(): HTMLElement {
        // Re-use an existing region if the component is hot-reloaded
        const existing = this._doc.getElementById('gnomex-aria-announcer');
        if (existing) { return existing; }

        const el = this._doc.createElement('div');
        el.id              = 'gnomex-aria-announcer';
        el.setAttribute('role',         'status');
        el.setAttribute('aria-live',    'assertive');
        el.setAttribute('aria-atomic',  'true');
        el.setAttribute('aria-relevant','additions text');
        el.className = 'sr-only';

        this._doc.body.appendChild(el);
        return el;
    }
}
