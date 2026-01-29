import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {DictionaryService} from "../services/dictionary.service";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";
import {BillingPeriodSelectorPopupComponent} from "./billing-period-selector-popup.component";
import {DictionaryEntry} from "../configuration/dictionary-entry.type";
import {PropertyService} from "../services/property.service";

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
                private propertyService: PropertyService,
                private dialog: MatDialog) {
    }

    ngOnInit() {
        let currentYear: number = new Date().getFullYear();
        this.minYear = currentYear;
        this.maxYear = currentYear;
        // if value is null it converts offsetBilingPeriod to  0 which ignores the offset functionality
        let offsetBillingPeriod:number = +this.propertyService.getPropertyValue(PropertyService.PROPERTY_OFFSET_BILLING_PERIOD);

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
                    if(offsetBillingPeriod){
                        let currentDate = new Date();
                        let currentMonth = currentDate.getMonth() + 1;

                        currentDate.setDate(currentDate.getDate() - offsetBillingPeriod);
                        let offsetDate = currentDate;

                        let monthOffset = this.makePeriodOffset(currentMonth, offsetDate.getMonth() + 1);
                        if(monthOffset > 0 ){
                            let currentBillingPeriods:any[] = this.getSortedCurrentBillingPeriods(currentYear);
                            let offsetIndex: number = -1;
                            for(let i = 0; i < currentBillingPeriods.length; i++){
                                if(currentBillingPeriods[i].idBillingPeriod === bp.idBillingPeriod){
                                    offsetIndex = i - monthOffset;
                                }
                            }
                            bp = offsetIndex > -1 && offsetIndex < currentBillingPeriods.length ?  currentBillingPeriods[offsetIndex] : bp;
                        }

                    }
                    this.selectBillingPeriod(bp);

                });
            }
        }

    }

    private makePeriodOffset(currentMonth:number, offsetMonth:number): number {
        let offsetPeriod: number = -1;
        if(currentMonth === offsetMonth){
            return 0;
        }
        if(currentMonth < offsetMonth){
            offsetPeriod = ((currentMonth - offsetMonth) + 12);
        }else{
            offsetPeriod = currentMonth - offsetMonth;
        }
        return offsetPeriod;
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

    private getSortedCurrentBillingPeriods(currentYear:number): any[] {
        let lastYear: string = "" + (currentYear - 1);
        let year: string = "" + currentYear;
        let currentBillingPeriods = this.billingPeriodList.filter((bp: BillingPeriod) => {
            return bp.calendarYear === year || bp.calendarYear === lastYear;
        }).sort((a: BillingPeriod, b: BillingPeriod) => {
            return a.startDateSort.localeCompare(b.startDateSort);
        });

        return currentBillingPeriods;
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
