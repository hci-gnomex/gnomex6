import { Injectable } from '@angular/core'
import {Validators} from "@angular/forms";
import {emailMatcher} from "../util/validators/email-matcher.validator"

@Injectable()
export class ExperimentViewService {
    /*template binds to these rule variables which determine if they'll been show or not
      will eventually remove and probably place back in tab components */
    labName: boolean = true;
    email: boolean = true;
    confirmEmail: boolean = true;
    phone: boolean = true;
    notification: boolean = true;
    experimentType: boolean = true;


    /* this tree is all the rules both template and typescript set by this during ngOnInit */
    //see prep-tab for example. It
    experimentViewRules = {
        'PrepTab': {
            'capSeq': {
                'labName': true,
                'emailGroup': {
                    email: true,
                    confirmEmail: true
                },
                'phone': true,
                'notification': true,
                'experimentType': true
            }
        },
        'DescriptionTab': {},
        'TestComponent': {}
    };

    controlValidators: {} = {
        //PrepTab
        labName: [Validators.required, Validators.minLength(3)],
        experimentType: [Validators.required],
        emailGroup: emailMatcher,
        email: [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+')],
        confirmEmail: [Validators.required],
        phone: [],
        notification: [],
        //TestTab
        energyDrink: [Validators.minLength(3),Validators.required],
        //DescriptionTab
        expName: [],
        expDescript: [Validators.maxLength(5000)],
        notesForCore:[Validators.maxLength(2000)]
    };
    getControlValidator(fieldName:string):Array<Function>{
        return this.controlValidators[fieldName];
    }

    constructor() { }

}