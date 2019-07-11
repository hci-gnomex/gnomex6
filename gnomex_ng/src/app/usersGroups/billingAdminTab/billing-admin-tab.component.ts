
import {Component, Input, OnInit, SimpleChanges} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DictionaryService} from "../../services/dictionary.service";
import {Router} from "@angular/router";

@Component({
    selector: 'billing-admin-tab',
    templateUrl: './billing-admin-tab.html',
    styles: [`
        
        .form-width {
            width: 45em;
            min-width: 45em;
            max-width: 100%;
        }
        
        .edit-button {
            color: blue;
        }

    `]
})
export class BillingAdminTabComponent implements OnInit {
    @Input()
    group: any;

    states: any[];

    public billingForm: FormGroup;

    private billingContactFC: FormControl;
    private billingContactEmailFC: FormControl;
    private phoneFC: FormControl;
    private departmentFC: FormControl;
    private addressFC: FormControl;
    private address2FC: FormControl;
    private cityFC: FormControl;
    private stateFC: FormControl;
    private zipFC: FormControl;
    private countryFC: FormControl;
    private selectedState: string;

    constructor(private dictionaryService: DictionaryService,
                private router: Router) { }


    ngOnInit() {
        this.createBillingForm();
        this.setBillingFields();
        this.states = this.dictionaryService.getEntriesExcludeBlank('hci.gnomex.model.State');
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['group']) {
            this.setBillingFields();
        }
    }

    createBillingForm() {
        this.billingContactFC = new FormControl("", Validators.required);
        this.billingContactEmailFC = new FormControl("", Validators.required);
        this.phoneFC = new FormControl("");
        this.departmentFC = new FormControl("");
        this.addressFC = new FormControl("");
        this.address2FC = new FormControl("");
        this.cityFC = new FormControl("");
        this.stateFC = new FormControl("");
        this.zipFC = new FormControl("");
        this.countryFC = new FormControl("");

        this.billingForm = new FormGroup({
            contactName: this.billingContactFC,
            billingContactEmail: this.billingContactEmailFC,
            billingContactPhone: this.phoneFC,
            department: this.departmentFC,
            contactAddress: this.addressFC,
            contactAddress2: this.address2FC,
            contactCity: this.cityFC,
            contactCodeState: this.stateFC,
            contactZip: this.zipFC,
            contactCountry: this.countryFC
        });
    }

    setBillingFields() {
        if (this.billingContactFC) {
            this.billingContactFC.setValue(this.group.contactName);
            this.billingContactEmailFC.setValue(this.group.billingContactEmail);
            this.phoneFC.setValue(this.group.billingContactPhone);
            this.departmentFC.setValue(this.group.department);
            this.addressFC.setValue(this.group.contactAddress);
            this.address2FC.setValue(this.group.contactAddress2);
            this.cityFC.setValue(this.group.contactCity);
            this.stateFC.setValue(this.group.contactCodeState);
            this.zipFC.setValue(this.group.contactZip);
            this.countryFC.setValue(this.group.contactCountry);
            this.selectedState = this.group.contactCodeState;
            this.billingForm.markAsPristine();
            this.touchFields();
        }
    }

    touchFields() {
        for (let field in this.billingForm.controls) {
            const control = this.billingForm.get(field);
            if (control) {
                if (control.valid === false) {
                    control.markAsTouched();
                }
            }
        }
    }

    editDictionary() {
        this.router.navigate([{outlets: {modal: ['editDictionary']}}]);
    }
}