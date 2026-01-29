import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {DateRange, DateRangeFilterComponent} from "./date-range-filter.component";

@Component({
    selector: 'date-range-filter-popup',
    templateUrl: "./date-range-filter-popup.component.html",
    styles: [`
        .margin-right {
            margin-right: 2rem;
        }
    `]
})
export class DateRangeFilterPopupComponent implements OnInit {
    public fromDate: Date;
    public toDate: Date;

    constructor(@Inject(MAT_DIALOG_DATA) private data: any,
                private dialogRef: MatDialogRef<DateRangeFilterPopupComponent>) {
    }

    ngOnInit() {
        this.updateWith(this.data.range as DateRange);
    }

    public setRangeWithin(days: number): void {
        this.updateWith(DateRangeFilterComponent.getRangeWithinLast(days));
    }

    public updateWith(range: DateRange): void {
        if (range && range.from && range.to) {
            this.fromDate = range.from;
            this.toDate = range.to;
        } else {
            let today: Date = new Date();
            this.fromDate = today;
            this.toDate = today;
        }
    }

    public save(): void {
        if (this.fromDate && this.toDate && this.fromDate.getTime() <= this.toDate.getTime()) {
            (this.data.filter as DateRangeFilterComponent).updateRange({from: this.fromDate, to: this.toDate});
            this.dialogRef.close(true);
        }
    }

}
