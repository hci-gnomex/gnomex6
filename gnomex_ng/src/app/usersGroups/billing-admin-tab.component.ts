
import {Component, Input, OnInit, SimpleChanges, ViewChild} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material";
import {Observable} from "rxjs/Observable";
import {DictionaryService} from "../services/dictionary.service";
import {Router} from "@angular/router";

@Component({
    selector: 'billing-admin-tab',
    templateUrl: './billing-admin-tab.html',
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
        mat-form-field.halfFormField {
            width: 50%;
            margin: 0 0.5%;

        }
        mat-form-field.fortyFormField {
            width: 40%;
            margin: 0 0.5%;

        }
        mat-form-field.thirtyFormField {
            width: 30%;
            margin: 0 0.5%;

        }
    mat-form-field.formField {
        width: 30%;
        margin: 0 0.5%;
    }
    .billing-admin-row-one {
        display: flex;
        flex-grow: 1;
    }
    .flex-container{

        display: flex;
        justify-content: space-between;
        margin-left: auto;
        margin-top: 1em;
        padding-left: 1em;
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
    @ViewChild(MatAutocompleteTrigger) matAutocompleteTrigger: MatAutocompleteTrigger;
    @ViewChild(MatAutocomplete) matAutocomplete: MatAutocomplete;

    public billingForm: FormGroup;
    public showSpinner: boolean = false;

    public billingContactFC: FormControl;
    public billingContactEmailFC: FormControl;
    public phoneFC: FormControl;
    public departmentFC: FormControl;
    public addressFC: FormControl;
    public address2FC: FormControl;
    public cityFC: FormControl;
    public stateFC: FormControl;
    public zipFC: FormControl;
    public countryFC: FormControl;
    public selectedState: string;
    filteredStates: Observable<any[]>;

    constructor(private dictionaryService: DictionaryService,
                private router: Router) {

    }


    ngOnInit() {
        this.createBillingForm();
        this.setBillingFields();
        this.states = this.dictionaryService.getEntries('hci.gnomex.model.State');
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['group']) {
            this.setBillingFields();
        }
    }

    ngAfterViewInit() {
        this.matAutocompleteTrigger.panelClosingActions
            .subscribe(e => {
                if (!(e && e.source)) {
                    this.stateFC.setValue(null);
                    this.matAutocompleteTrigger.closePanel();
                }
            });
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
            billingContact: this.billingContactFC,
            email: this.billingContactEmailFC,
            phone: this.phoneFC,
            department: this.departmentFC,
            address: this.addressFC,
            address2: this.address2FC,
            city: this.cityFC,
            state: this.stateFC,
            zip: this.zipFC,
            country: this.countryFC
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
        }
    }

    chooseFirstOption(): void {
        this.matAutocomplete.options.first.select();
    }

    filterStates(name: any): any[] {
        if (name) {
            return this.states.filter(state =>
                state.value.toLowerCase().indexOf(name.toLowerCase()) === 0);
        } else {
            return [];
        }
    }
    selectOption(event) {
        this.stateFC.setValue(event.source.value);
        console.log("selectOption");
    }

    editDictionary() {
        this.router.navigate([{outlets: {modal: ['editDictionary']}}]);
    }
}