import {Component, EventEmitter, Output} from '@angular/core'
import { FormGroup, FormBuilder, FormArray, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common'
import { PrimaryTab } from '../../util/tabs/primary-tab.component'
import 'rxjs/add/operator/debounceTime'
import {ExperimentViewService} from "../../services/experiment-view.service";

@Component({

    selector: 'prep-tab',
    templateUrl: './prep-tab.component.html'
})
export class PrepTab extends PrimaryTab {

    entries = [];
    @Output() initNewExperiment = new EventEmitter();
    name: string = "Prep Tab";
    selectedEntry: { [key: string]: any } = {
        value: null,
        description: null
    };
    emailMessage: string;

    private validationMessages = {
        required: 'Please enter your email address',
        pattern: 'Please enter a valid email address'
    };

    prepForm: FormGroup;



    constructor(protected fb: FormBuilder,private expViewRules:ExperimentViewService) {
        super(fb,expViewRules);
    }


    ngOnInit() {

        this.entries = [
            {
                description: 'entry 1',
                value: ["TestComponent", "DescriptionTab"]
            },
            {
                description: 'entry 2',
                value:  ["TestComponent", "PrepTab"]
            },
            {
                description: 'entry 3',
                value: ["TestComponent"]
            },
            {
                description: 'entry 4',
                value: ["DescriptionTab","TestComponent","DescriptionTab","TestComponent",]
            }
        ];


        this.prepForm = this.fb.group({
            labName: ['', this.rules.getControlValidator('labName')], //
            experimentType: ['', this.rules.getControlValidator('experimentType')],//this.rules.getControlValidator('experimentType')
            emailGroup: this.fb.group({
                email: ['', this.rules.getControlValidator('email') ],
                confirmEmail: ['', this.rules.getControlValidator('confirmEmail')],
            }, { validator: this.rules.getControlValidator('emailGroup') }),
            phone: '',
            notification: 'email',

        });

        /*this.addChildToForm(this.prepForm);  // important for cross form validation
        this.setformRules(tabName,'capSeq');
        this.removeControls(this.prepForm,this.getformRules());
        this.initFormRules();*/
        this.setupForm('capSeq',this.prepForm);


        this.controlsToLink("expDescript",this.prepForm.get("labName"));
        this.controlsToLink("energyDrink", this.prepForm.get("phone"));



        // select the first one
        if (this.entries) {
            this.onSelectionChange(this.entries[0]);
        }


        this.prepForm.get("notification").valueChanges
            .subscribe(value => this.setNotification(value));
        const emailControl = this.prepForm.get('emailGroup.email');
        if(emailControl){
            emailControl.valueChanges.debounceTime(1000).subscribe(value => {
                this.setMessage(emailControl)
            });
        }
    }
    onSelectionChange(entry) {
        // clone the object for immutability
        if(this.prepForm.get("experimentType").value !== ''){
            this.initNewExperiment.emit(entry.value);
        }

    }
    save() {
        this.rules.changeControlState({controlName:'email',remove:true});
    }
    add(){
        this.rules.changeControlState({controlName:'email',remove:false});
    }

    setNotification(notifyVia: string): void { // used for radio button email and text option
        // Will change validation during runtime

        const phoneControl = this.prepForm.get('phone'); // getting access to the phoneControl
        if (notifyVia === 'text') {
            phoneControl.setValidators(Validators.required); // setting validator during runtime
        } else {
            phoneControl.clearValidators();
        }
        phoneControl.updateValueAndValidity();
    }

    setMessage(c: AbstractControl): void {
        this.emailMessage = '';
        if ((c.touched || c.dirty) && c.errors) {
            this.emailMessage = Object.keys(c.errors).map(key =>
                this.validationMessages[key]).join(' ');
        }
    }



}

