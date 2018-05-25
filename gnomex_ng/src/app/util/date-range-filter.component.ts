import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material";
import {DateRangeFilterPopupComponent} from "./date-range-filter-popup.component";

@Component({
    selector: 'date-range-filter',
    templateUrl: "./date-range-filter.component.html",
    styles: [`
    `],
})

export class DateRangeFilterComponent implements OnInit {
    public yearMenuArray: YearMenuItem[];
    public label: string;
    private dateRange: DateRange;

    @Output() onChange = new EventEmitter<DateRange>();

    constructor(private dialog: MatDialog) {
    }

    ngOnInit() {
        let currentYear: number = new Date().getFullYear();
        this.yearMenuArray = [];
        for (let i = 0; i < 10; i++) {
            let year: number = currentYear - i;
            this.yearMenuArray.push({label: year + "", year: year});
        }
        this.updateRange(null, false);
    }

    public static getRangeWithinLast(days: number): DateRange {
        let to: Date = new Date();
        let from: Date = new Date(to.getFullYear(), to.getMonth(), to.getDate() - days);
        return {from: from, to: to};
    }

    public static getRangeForYear(year: number): DateRange {
        return {from: new Date(year, 0, 1), to: new Date(year + 1, 0, 0)};
    }

    public setRangeWithinLast(days: number): void {
        this.updateRange(DateRangeFilterComponent.getRangeWithinLast(days));
    }

    public setRangeForYear(year: number): void {
        this.updateRange(DateRangeFilterComponent.getRangeForYear(year));
    }

    public clear(): void {
        this.updateRange(null);
    }

    public updateRange(range: DateRange, emit: boolean = true): void {
        if (range && range.from && range.to) {
            this.dateRange = range;
            this.label = range.from.toLocaleDateString() + " - " + range.to.toLocaleDateString();
        } else {
            this.dateRange = {from: null, to: null};
            this.label = "Filter by Date";
        }
        if (emit) {
            this.onChange.emit(this.dateRange);
        }
    }

    public openPopup(): void {
        let popupDialogRef: MatDialogRef<DateRangeFilterPopupComponent> = this.dialog.open(DateRangeFilterPopupComponent, {
            data: {
                range: this.dateRange,
                filter: this
            }
        });
    }

}

interface YearMenuItem {
    readonly label: string;
    readonly year: number;
}

export interface DateRange {
    readonly from: Date;
    readonly to: Date;
}
