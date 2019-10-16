import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {DictionaryService} from "../services/dictionary.service";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";
import {BillingPeriodSelectorPopupComponent} from "./billing-period-selector-popup.component";
import {DictionaryEntry} from "../configuration/dictionary-entry.type";

@Component({
    selector: 'billing-period-selector',
    template: `
        
        <div class="full-height full-width double-padded align-baseline">
            <label class="double-padded-right">
                Billing Period :
            </label> 
            <button mat-raised-button type="button" class="minimize" (click)="this.showPopup()">
                {{this.label}}
            </button>
        </div>
        
    `,
    styles: [``]
})

export class BillingPeriodSelectorComponent implements OnInit {

    public billingPeriod: BillingPeriod;
    public label: string = "";
    public billingPeriodList: BillingPeriod[] = [];
    private minYear: number;
    private maxYear: number;

    @Output() onChange = new EventEmitter<BillingPeriod>();

    constructor(private dictionaryService: DictionaryService,
                private dialog: MatDialog) {
    }

    ngOnInit() {
        let currentYear: number = new Date().getFullYear();
        this.minYear = currentYear;
        this.maxYear = currentYear;

        this.billingPeriodList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.BILLING_PERIOD) as BillingPeriod[];
        for (let bp of this.billingPeriodList) {
            let year: number = parseInt(bp.calendarYear);
            if (year < this.minYear) {
                this.minYear = year;
            } else if (year > this.maxYear) {
                this.maxYear = year;
            }
            if (bp.isCurrentPeriod === "Y") {
                setTimeout(() => {
                    this.selectBillingPeriod(bp);
                });
            }
        }
    }

    private selectBillingPeriod(bp: BillingPeriod): void {
        this.label = bp ? bp.display : "None";
        this.billingPeriod = bp;
        this.onChange.emit(bp);
    }

    public showPopup(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.data = {
            billingPeriodList: this.billingPeriodList,
            currentYear: this.billingPeriod ? parseInt(this.billingPeriod.calendarYear) : new Date().getFullYear(),
            minYear: this.minYear,
            maxYear: this.maxYear,
        };
        config.width = '400px';
        let dialog: MatDialogRef<BillingPeriodSelectorPopupComponent> = this.dialog.open(BillingPeriodSelectorPopupComponent, config);
        dialog.afterClosed().subscribe((val: any) => {
            if (val !== undefined) {
                this.selectBillingPeriod(val as BillingPeriod);
            }
        });
    }

}

export type BillingPeriod = DictionaryEntry & {
    idBillingPeriod: string;
    calendarYear: string;
    isCurrentPeriod: string;
    startDate: string;
    endDate: string;
    startDateSort: string;
}
