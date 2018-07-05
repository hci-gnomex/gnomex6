import {Component, EventEmitter, Inject, OnInit, Output} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {LabListService} from "../services/lab-list.service";
import {GetLabService} from "../services/get-lab.service";
import {BillingPeriod} from "../util/billing-period-selector.component";

@Component({
    selector: 'billing-filter',
    templateUrl: "./billing-filter.component.html",
    styles: [`
        .small-margin-right {
            margin-right: 2em;
        }
        .large-margin-right {
            margin-right: 10em;
        }
        .padded {
            padding: 0.5em;
        }
        .bordered {
            border: grey solid 1px;
        }
    `]
})

export class BillingFilterComponent implements OnInit {

    public form: FormGroup;
    @Output() onChange = new EventEmitter<BillingFilterEvent>();
    private previousChangeEvent: BillingFilterEvent;

    public coreFacilityList: any[] = [];
    private labList: any[] = [];
    public filteredLabList: any[] = [];
    public billingAccountList: any[] = [];

    public requestNumberModel: string = "";
    public invoiceNumberModel: string = "";

    constructor(@Inject(FormBuilder) private fb: FormBuilder,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private labListService: LabListService,
                private getLabService: GetLabService) {
        this.form = fb.group({
            idCoreFacility: '',
            idBillingPeriod: '',
            idLab: '',
            idBillingAccount: '',
            requestNumber: '',
            invoiceNumber: ''
        });
    }

    ngOnInit() {
        this.coreFacilityList = this.createSecurityAdvisorService.coreFacilitiesICanManage;
        this.labListService.getLabList().subscribe((labs: any[]) => {
            this.labList = labs;
            this.filteredLabList = labs;
        });

        this.form.valueChanges.subscribe(() => {
            let event: BillingFilterEvent = new BillingFilterEvent();
            if (this.form.controls['idCoreFacility'].value) {
                event.idCoreFacility = this.form.controls['idCoreFacility'].value;
            }
            if (this.form.controls['idBillingPeriod'].value) {
                event.idBillingPeriod = this.form.controls['idBillingPeriod'].value;
            }
            if (this.form.controls['idLab'].value) {
                event.idLab = this.form.controls['idLab'].value;
            }
            if (this.form.controls['idBillingAccount'].value) {
                event.idBillingAccount = this.form.controls['idBillingAccount'].value;
            }
            if (this.form.controls['requestNumber'].value) {
                event.requestNumber = this.form.controls['requestNumber'].value;
            }
            if (this.form.controls['invoiceNumber'].value) {
                event.invoiceNumber = this.form.controls['invoiceNumber'].value;
            }

            if (!BillingFilterEvent.areEqualEvents(this.previousChangeEvent, event)) {
                this.previousChangeEvent = event;
                this.onChange.emit(event);
            }
        });

        this.form.controls['idCoreFacility'].valueChanges.subscribe(() => {
            if (this.form.controls['idLab'].value) {
                this.form.controls['idLab'].setValue('');
            }
            this.filteredLabList = [];
            if (this.form.controls['idCoreFacility'].value) {
                this.filteredLabList = this.labList.filter((lab: any) => {
                    let cores: any[] = Array.isArray(lab.coreFacilities) ? lab.coreFacilities : [lab.coreFacilities.CoreFacility];
                    for (let c of cores) {
                        if (c.idCoreFacility === this.form.controls['idCoreFacility'].value) {
                            return true;
                        }
                    }
                    return false;
                });
            } else {
                this.filteredLabList = this.labList;
            }
        });
        this.form.controls['idLab'].valueChanges.subscribe(() => {
            if (this.form.controls['idBillingAccount'].value) {
                this.form.controls['idBillingAccount'].setValue('');
            }
            this.billingAccountList = [];
            if (this.form.controls['idLab'].value) {
                this.getLabService.getLabBillingAccounts(this.form.controls['idLab'].value).subscribe((lab: any) => {
                    if (lab && lab.Lab && lab.Lab.billingAccounts) {
                        this.billingAccountList = Array.isArray(lab.Lab.billingAccounts) ? lab.Lab.billingAccounts : [lab.Lab.billingAccounts.BillingAccount];
                        if (this.form.controls['idCoreFacility'].value) {
                            this.billingAccountList = this.billingAccountList.filter((ba: any) => {
                                return ba.idCoreFacility === this.form.controls['idCoreFacility'].value;
                            });
                        }
                    }
                });
            }
        });
    }

    public onBillingPeriodChange(value: BillingPeriod): void {
        this.form.controls['idBillingPeriod'].setValue(value ? value.idBillingPeriod : '');
    }

    public onRequestNumberChange(): void {
        this.form.controls['requestNumber'].setValue(this.requestNumberModel);
    }

    public onInvoiceNumberChange(): void {
        this.form.controls['invoiceNumber'].setValue(this.invoiceNumberModel);
    }

}

export class BillingFilterEvent {
    idCoreFacility?: string;
    idBillingPeriod?: string;
    idLab?: string;
    idBillingAccount?: string;
    requestNumber?: string;
    invoiceNumber?: string;

    constructor() {
    }

    public static areEqualEvents(a: BillingFilterEvent, b: BillingFilterEvent): boolean {
        if (!a && !b) {
            return true;
        } else if (a && b) {
            return a.idCoreFacility === b.idCoreFacility &&
                a.idBillingPeriod === b.idBillingPeriod &&
                a.idLab === b.idLab &&
                a.idBillingAccount === b.idBillingAccount &&
                a.requestNumber === b.requestNumber &&
                a.invoiceNumber === b.invoiceNumber;
        } else {
            return false;
        }
    }
}
