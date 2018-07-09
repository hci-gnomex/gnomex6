import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {BillingPeriod} from "./billing-period-selector.component";

@Component({
    selector: 'billing-period-selector-popup',
    template: `
        <h6 mat-dialog-title>Billing Period Picker</h6>
        <mat-dialog-content>
            <div class="flex-container-col align-center">
                <div>
                    <button mat-button [hidden]="this.currentYear - 1 < this.minYear" (click)="this.changeYear(-1)"><img src="../../assets/arrow_left.png"></button>
                    <label>{{this.currentYear}}</label>
                    <button mat-button [hidden]="this.currentYear + 1 > this.maxYear" (click)="this.changeYear(1)"><img src="../../assets/arrow_right.png"></button>
                </div>
            </div>
            <div class="flex-container-row flex-wrap">
                <button mat-button *ngFor="let bp of this.currentBillingPeriods" (click)="this.selectBillingPeriod(bp)">{{bp.display.substring(0,3)}}</button>
            </div>
        </mat-dialog-content>
        <mat-dialog-actions>
            <button mat-button (click)="this.clear()">Clear</button>
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
