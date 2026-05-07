import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

/**
 * Represents a single valid destination for a "Move to…" operation.
 */
export interface MoveToTarget {
    /** Display label shown in the list. */
    label: string;
    /** Optional breadcrumb string shown after the label (e.g., lab or parent folder name). */
    path?: string;
    /** The original node.data object that will be passed back to the opener on close. */
    data: any;
}

/**
 * Data injected via MAT_DIALOG_DATA when opening this dialog.
 */
export interface MoveToDialogData {
    /** Label of the item being moved — shown in the dialog title. */
    sourceLabel: string;
    /** List of valid destinations to show. */
    targets: MoveToTarget[];
    /**
     * When true a "Copy instead of move" checkbox is shown.
     * Intended for browse-analysis where Ctrl+drag creates a copy.
     */
    allowCopy?: boolean;
}

/**
 * Result returned by the dialog when the user selects a destination.
 * The dialog returns `null` when the user cancels.
 */
export interface MoveToDialogResult {
    target: MoveToTarget;
    copy: boolean;
}

/**
 * Single-pointer alternative to drag-and-drop (WCAG 2.5.7 Level AA).
 *
 * Opens a modal listing valid destination folders/groups.  The user
 * clicks (or presses Enter/Space on) an item to move the source node
 * there.  This requires only a single pointer action per step with no
 * path-based gesture, satisfying WCAG 2.5.7.
 */
@Component({
    selector: 'move-to-dialog',
    template: `
        <h2 mat-dialog-title id="move-to-title">
            Move "{{ data.sourceLabel }}"
        </h2>

        <mat-dialog-content aria-labelledby="move-to-title">
            <p *ngIf="data.targets.length === 0" role="status">
                No valid destinations found.
            </p>

            <ul *ngIf="data.targets.length > 0"
                class="move-target-list"
                role="listbox"
                [attr.aria-label]="'Select destination for ' + data.sourceLabel">
                <li *ngFor="let target of data.targets"
                    role="option"
                    tabindex="0"
                    class="move-target-item"
                    [attr.aria-label]="target.label + (target.path ? ', in ' + target.path : '')"
                    (click)="select(target)"
                    (keydown.enter)="select(target)"
                    (keydown.space)="$event.preventDefault(); select(target)">
                    <span class="move-target-label">{{ target.label }}</span>
                    <span class="move-target-path" *ngIf="target.path"> — {{ target.path }}</span>
                </li>
            </ul>

            <mat-checkbox *ngIf="data.allowCopy"
                          [(ngModel)]="copyMode"
                          class="move-copy-checkbox"
                          aria-label="Copy instead of move">
                Copy instead of move
            </mat-checkbox>
        </mat-dialog-content>

        <mat-dialog-actions class="justify-flex-end">
            <button mat-button (click)="cancel()" aria-label="Cancel move">Cancel</button>
        </mat-dialog-actions>
    `,
    styleUrls: ["./move-to-dialog.component.scss"]
})
export class MoveToDialogComponent {
    copyMode = false;

    constructor(
        public dialogRef: MatDialogRef<MoveToDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: MoveToDialogData
    ) {}

    select(target: MoveToTarget): void {
        const result: MoveToDialogResult = { target, copy: this.copyMode };
        this.dialogRef.close(result);
    }

    cancel(): void {
        this.dialogRef.close(null);
    }
}
