// Button Styling - Pure CSS Radio Button Tiles by Casey Callow (https://codepen.io/caseycallow/pen/yaGQro)

import {Component, EventEmitter, Input, Output, OnInit} from '@angular/core';
import {DictionaryService} from "../services/dictionary.service";

@Component({
    selector: 'billing-period-picker',
    templateUrl: "./billing-period-picker.component.html"
})

export class BillingPeriodPickerComponent implements OnInit {
    readonly MONTHS: any[] = [
        {id: "jan", value: "Jan", label: "Jan"},
        {id: "feb", value: "Feb", label: "Feb"},
        {id: "mar", value: "Mar", label: "Mar"},
        {id: "apr", value: "Apr", label: "Apr"},
        {id: "may", value: "May", label: "May"},
        {id: "jun", value: "Jun", label: "Jun"},
        {id: "jul", value: "Jul", label: "Jul"},
        {id: "aug", value: "Aug", label: "Aug"},
        {id: "sep", value: "Sep", label: "Sep"},
        {id: "oct", value: "Oct", label: "Oct"},
        {id: "nov", value: "Nov", label: "Nov"},
        {id: "dec", value: "Dec", label: "Dec"}
    ];

    private showPicker: boolean;
    private label: string;
    private billingPeriods: any[];

    private currentYear: number;
    private minYear: number;
    private maxYear: number;
    private monthString: string;
    private billingPeriodObject: any;

    private billingPeriodValue: string;
    @Output() billingPeriodChange = new EventEmitter();
    @Input() get billingPeriod(): string {
        return this.billingPeriodValue;
    }
    set billingPeriod(value: string) {
        this.billingPeriodValue = value;
        this.billingPeriodChange.emit(this.billingPeriodValue);
    }

    constructor(private dictionaryService: DictionaryService) {
        this.clear();
        this.showPicker = false;
        this.billingPeriods = [];
        this.resetYear();
        this.minYear = this.currentYear;
        this.maxYear = this.currentYear;
        this.determineLabel();
    }

    ngOnInit() {
        this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.BillingPeriod").subscribe((response) => {
            this.billingPeriods = response;
            let index: number;
            let bp: any;
            for (index = 0; index < response.length; index++) {
                bp = response[index];
                if (bp.calendarYear < this.minYear) {
                    this.minYear = parseInt(bp.calendarYear);
                } else if (bp.calendarYear > this.maxYear) {
                    this.maxYear = parseInt(bp.calendarYear);
                }
                if (bp.isCurrentPeriod === "Y") {
                    this.monthString = bp.display.substring(0, 3);
                    this.select(bp);
                    this.resetYear();
                }
            }
        });
    }

    change(): void {
        let selection: string = this.monthString + " " + this.currentYear;
        let index: number;
        let bp: any;
        for (index = 0; index < this.billingPeriods.length; index++) {
            bp = this.billingPeriods[index];
            if (bp.billingPeriod === selection) {
                this.select(bp);
                return;
            }
        }

        // Billing period was not found
        this.clear();
    }

    changeYear(delta: number) {
        let newYear: number = this.currentYear + delta;
        if (newYear >= this.minYear && newYear <= this.maxYear) {
            this.currentYear = newYear;
        }
    }

    select(bp: any): void {
        this.billingPeriodObject = bp;
        this.billingPeriod = bp.idBillingPeriod;
        this.determineLabel();
    }

    resetYear(): void {
        if (!(this.billingPeriodObject === null)) {
            this.currentYear = parseInt(this.billingPeriodObject.calendarYear);
        } else {
            this.currentYear = new Date().getFullYear();
        }
    }

    clear(): void {
        this.billingPeriodObject = null;
        this.billingPeriod = "";
        this.monthString = "";
    }

    toggleShowPicker(): void {
        this.showPicker = !this.showPicker;
        this.resetYear();
        this.determineLabel();
    }

    determineLabel(): void {
        if (!(this.billingPeriodObject === null)) {
            this.label = this.billingPeriodObject.display;
        } else {
            this.label = "Billing Period";
        }
    }

}