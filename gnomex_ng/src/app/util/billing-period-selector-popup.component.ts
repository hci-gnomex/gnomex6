import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {BillingPeriod} from "./billing-period-selector.component";

@Component({
    selector: 'billing-period-selector-popup',
    template: `
        <h6 mat-dialog-title id="billing-picker-title">Billing Period Picker</h6>
        <mat-dialog-content role="dialog" aria-labelledby="billing-picker-title">
            <div class="flex-container-col align-center" role="navigation" aria-label="Year navigation">
                <div>
                    <button mat-button [hidden]="this.currentYear - 1 < this.minYear" (click)="this.changeYear(-1)" aria-label="Previous year"><img [src]="'./assets/arrow_left.png'" alt="" aria-hidden="true"></button>
                    <label aria-live="polite">{{this.currentYear}}</label>
                    <button mat-button [hidden]="this.currentYear + 1 > this.maxYear" (click)="this.changeYear(1)" aria-label="Next year"><img [src]="'./assets/arrow_right.png'" alt="" aria-hidden="true"></button>
                </div>
            </div>
            <div class="flex-container-row flex-wrap" role="group" aria-label="Billing periods">
                <button mat-button *ngFor="let bp of this.currentBillingPeriods" (click)="this.selectBillingPeriod(bp)" [attr.aria-label]="bp.display">{{bp.display.substring(0,3)}}</button>
            </div>
        </mat-dialog-content>
        <mat-dialog-actions role="group" aria-label="Dialog actions">
            <button mat-button (click)="this.clear()" aria-label="Clear selection">Clear</button>
        </mat-dialog-actions>
    `,
    styles: [`
    `]
})

export class BillingPeriodSelectorPopupComponent implements OnInit {

    public billingPeriodList: BillingPeriod[];
    public currentBillingPeriods: BillingPeriod[] = [];
    public currentYear: number;
    private minYear: number;
    private maxYear: number;

    constructor(private dialogRef: MatDialogRef<BillingPeriodSelectorPopupComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any) {
    }

    ngOnInit() {
        this.billingPeriodList = this.data.billingPeriodList;
        this.currentYear = this.data.currentYear;
        this.minYear = this.data.minYear;
        this.maxYear = this.data.maxYear;

        this.updateCurrentBillingPeriods();
    }

    private updateCurrentBillingPeriods(): void {
        let year: string = "" + this.currentYear;
        this.currentBillingPeriods = this.billingPeriodList.filter((bp: BillingPeriod) => {
            return bp.calendarYear === year;
        }).sort((a: BillingPeriod, b: BillingPeriod) => {
            return a.startDateSort.localeCompare(b.startDateSort);
        });
    }

    public changeYear(delta: number): void {
        this.currentYear = this.currentYear + delta;
        this.updateCurrentBillingPeriods();
    }

    public clear(): void {
        this.dialogRef.close(null);
    }

    public selectBillingPeriod(bp: BillingPeriod): void {
        this.dialogRef.close(bp);
    }

}
