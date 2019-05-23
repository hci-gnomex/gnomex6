import {Component, forwardRef, Inject, Input, OnInit, SimpleChanges, ViewChild} from "@angular/core";
import {MatAutocomplete} from "@angular/material";
import {FormControl, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { URLSearchParams } from "@angular/http";

import * as moment from 'moment';
import {BehaviorSubject} from "rxjs";
import {BillingService} from "../../services/billing.service";
import {DictionaryService} from "../../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {DOCUMENT} from "@angular/common";

@Component({
    selector: 'invoices-tab',
    templateUrl: './invoices-tab.html',
    styles: [`
        div.form {
        display: flex;
        flex-direction: column;
        padding: 0 1%;
        }
    div.formColumn {
        display: flex;
        flex-direction: column;
        margin: 0.5% 0;
        width: 80%;
    }
        .flex-row-container {
            display: flex;
            flex-direction: row;
        }
        .flex-column-container {
            display: flex;
            flex-direction: column;
            background-color: white;
            height: 100%;
        }
        .users-groups-row-one {
            display: flex;
            flex-grow: 1;
        }
    .formField {
        width: 50%;
        margin: 0 0.5%;
    }
`],

})

export class InvoicesTabComponent implements OnInit {
    @Input()
    memberGroup: any;

    @Input() label = '';

    @ViewChild(MatAutocomplete) matAutocomplete: MatAutocomplete;
    private cores: any[];
    private monthInputCtrl: FormControl = new FormControl(new Date(2020,0,1));
    private billingPeriods: any[] = [];

    private visible = true;
    private coreFacilityComplete: boolean = true;
    private billingPeriodComplete: boolean = false;
    private complete: BehaviorSubject<boolean> = new BehaviorSubject<boolean> (false);
    private selectedBillingPeriod: any;
    private billingAccounts: any[] = [];
    private selectedAccounts: any[] = [];
    private invoiceBillingAccountList: string = "";
    private invoiceLabList: string = "";
    private monthString: string;
    private coreFacilityFC: FormControl;

    private minYear: number = 20000;
    private maxYear: number = 0;
    private min: Date;
    private max: Date;

    constructor(public billingService: BillingService,
                private dictionaryService: DictionaryService,
                public secAdvisor: CreateSecurityAdvisorService,
                @Inject(DOCUMENT) private document: Document) {

    }

    ngOnInit() {
        this.billingPeriods = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.BILLING_PERIOD);
        this.findMinimumYear();
        this.cores = this.memberGroup.coreFacilities;
        this.coreFacilityFC = new FormControl("", Validators.required);
        this.coreFacilityFC.markAsTouched();
        this.monthInputCtrl.valueChanges.subscribe((selectedDate) => {
            let selectedMoment = moment(selectedDate).format('MMM YYYY');
            this.coreFacilityComplete = true;
            this.selectedBillingPeriod = this.billingPeriods.filter((date => date.billingPeriod === selectedMoment))[0];
            if (this.coreFacilityComplete && this.billingPeriodComplete) {
                this.complete.next(true);
            }
        });
        this.complete.subscribe((value) => {
            if (value) {
                if (this.selectedBillingPeriod && this.coreFacilityFC.value) {
                    let params: URLSearchParams = new URLSearchParams();
                    params.set("idBillingPeriod", this.selectedBillingPeriod.value);
                    params.set("idCoreFacility", this.coreFacilityFC.value);
                    params.set("idLab", this.memberGroup.idLab);
                    this.billingService.getBillingAccountListForPeriodAndCore(params).subscribe((response: any) => {
                        if (response) {
                            if (!this.secAdvisor.isArray(response)) {
                                response = [response.BillingAccount];
                            }
                            this.billingAccounts = response;
                        } else {
                            this.billingAccounts = [];
                        }

                        this.complete.next(false);
                    });
                }
            }
        })
    }

    findMinimumYear() {
        for (let bp of this.billingPeriods) {
            if (bp.calendarYear < this.minYear) {
                this.minYear = parseInt(bp.calendarYear);
            } else if (bp.calendarYear > this.maxYear) {
                this.maxYear = parseInt(bp.calendarYear);
            }
            if (bp.isCurrentPeriod === "Y") {
                this.monthString = bp.display.substring(0, 3);
                this.selectedBillingPeriod = bp;
            }
        }
        this.min = new Date(this.monthString + ' ' + this.minYear);
        this.max = new Date(this.monthString + ' ' + this.maxYear);
        this.monthInputCtrl.setValue(this.max);
    }

    selectOption() {
        this.billingPeriodComplete = true;
        if (this.coreFacilityComplete && this.billingPeriodComplete && this.coreFacilityFC.value) {
            this.billingAccounts = [];
            this.complete.next(true);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['memberGroup']) {
            this.sortCoreFacilities();
            this.monthInputCtrl.setValue(this.max);
        }
    }

    sortCoreFacilities() {
        if (!!this.memberGroup.coreFacilities && this.memberGroup.coreFacilities.length > 0) {

            this.cores = this.memberGroup.coreFacilities.sort((a, b) => {
                if (a.sortOrder && a.sortOrder != "") {
                    if (b.sortOrder && b.sortOrder != "") {
                        return parseInt(a.sortOrder) - parseInt(b.sortOrder);
                    } else {
                        return -1;
                    }
                } else {
                    if (b.sortOrder && b.sortOrder != "") {
                        return 1;
                    } else {
                        if (a.display && b.display && a.display.toLowerCase() > b.display.toLowerCase()) {
                            return 1;
                        } else if (a.display && b.display && a.display.toLowerCase() === b.display.toLowerCase()) {
                            return 0
                        } else {
                            return -1;
                        }
                    }
                }
            });

        }
    }

    filterCores(name: any): any[] {
        return this.cores;
    }

    buildAccountsLabs() {
        for (var account of this.selectedAccounts) {
            if (this.invoiceBillingAccountList.length > 0) {
                this.invoiceBillingAccountList += ",";
                this.invoiceLabList += ","
            }
            this.invoiceBillingAccountList += account;
            this.invoiceLabList += this.memberGroup.idLab;
        }
    }

    onNgModelChange(event) {
    }

    public run(): void {
        this.buildAccountsLabs();
        let url: string = this.document.location.href;
        url += "/ShowBillingInvoiceForm.gx?idBillingPeriod=" + this.selectedBillingPeriod.idBillingPeriod;
        url += "&idLabs=" + this.invoiceLabList;
        url += "&idCoreFacility=" + this.coreFacilityFC.value;
        url += "&idBillingAccounts=" + this.invoiceBillingAccountList;
        window.open(url, "_blank");
    }


}
