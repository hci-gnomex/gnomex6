import {Component, EventEmitter, Inject, Input, OnInit, Output} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {LabListService} from "../services/lab-list.service";
import {GetLabService} from "../services/get-lab.service";
import {BillingPeriod} from "../util/billing-period-selector.component";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {BillingService} from "../services/billing.service";
import {UserPreferencesService} from "../services/user-preferences.service";

@Component({
    selector: 'billing-filter',
    templateUrl: "./billing-filter.component.html",
    styles: [`

        .mat-autocomplete-panel > .mat-option.ng-star-inserted {
            line-height: initial;
            padding: 0.3em;
            font-size: small;
        }
        
        
        .min-width { min-width: 10em; }
        
        .experiment-width {
            width: 8em;
            min-width: 8em;
        }
        
        .core-facility-width {
            width: 16em;
            min-width: 16em;
        }
        
        .lab-display-width {
            width: 20em;
            min-width: 20em;
        }
        
        .account-display-width {
            width: 25em;
            min-width: 25em;
        }
        
        
    `]
})

export class BillingFilterComponent implements OnInit {

    public form: FormGroup;
    @Output() onChange = new EventEmitter<BillingFilterEvent>();
    private previousChangeEvent: BillingFilterEvent;

    @Input() public selectedItem: ITreeNode = null;
    @Input() private isDirty: boolean = false;
    @Input() private filterByOrderType: string;
    @Input() private showRelatedCharges: boolean;
    @Input() private totalPrice: number;

    private billingPeriodString: string;

    public coreFacilityList: any[] = [];
    private labList: any[] = [];
    public filteredLabList: any[] = [];
    public billingAccountList: any[] = [];

    public requestNumberModel: string = "";
    public invoiceNumberModel: string = "";

    constructor(@Inject(FormBuilder) private fb: FormBuilder,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private labListService: LabListService,
                private getLabService: GetLabService,
                private billingService: BillingService,
                public prefService: UserPreferencesService) {
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
        this.coreFacilityList = this.createSecurityAdvisorService.coreFacilitiesICanManage.filter((value) => {
            return !value.isActive || value.isActive !== 'N';
        }).sort((a, b) => {
            if (!a && !b) {
                return 0;
            } else if (!a) {
                return -1;
            } else if (!b) {
                return 1;
            } else {
                if (!a.sortOrder && !b.sortOrder) {
                    if (!a.display && !b.display) {
                        return 0;
                    } else if (!a.display) {
                        return -1;
                    } else if (!b.display) {
                        return 1;
                    } else {
                        if (a.display.toLowerCase() < a.display.toLowerCase()) {
                            return -1;
                        } else if (a.display.toLowerCase() > a.display.toLowerCase()) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                } else if (!a.sortOrder) {
                    return -1;
                } else if (!b.sortOrder) {
                    return 1;
                } else {
                    if (+a.sortOrder < +b.sortOrder) {
                        return -1;
                    } else if (+a.sortOrder > +b.sortOrder) {
                        return 1;
                    } else {
                        if (!a.display && !b.display) {
                            return 0;
                        } else if (!a.display) {
                            return -1;
                        } else if (!b.display) {
                            return 1;
                        } else {
                            if (a.display.toLowerCase() < a.display.toLowerCase()) {
                                return -1;
                            } else if (a.display.toLowerCase() > a.display.toLowerCase()) {
                                return 1;
                            } else {
                                return 0;
                            }
                        }
                    }
                }
            }
        });


        if (this.coreFacilityList.length > 0) {
            this.form.controls['idCoreFacility'].setValue(this.coreFacilityList[0].idCoreFacility);
        }
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
                this.billingService.broadcastBillingViewChangeForCoreCommentsWindow(event, null, null);
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
        this.billingPeriodString = value ? value.display : '';
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
