import {Injectable, EventEmitter} from '@angular/core'
import {ValidatorFn, Validators} from "@angular/forms";
import {emailMatcher} from "../util/validators/email-matcher.validator"
import {Subject} from "rxjs";
import {ControlChangeState} from "../util/tabs/control-change-state"
import {Observable} from "rxjs";

@Injectable()
export class ExperimentViewService {
    /*template binds to these rule variables which determine if they'll been show or not
      will eventually remove and probably place back in tab components */

    private controlSubject: Subject<ControlChangeState> = new Subject();

    /*labName: any = {visible:true};
    email: any = {visible:true};
    confirmEmail: any = {visible:true};
    phone: any = {visible:true};
    notification: any = {visible:true};
    experimentType:any = {visible:true};*/





    /*IMPORTANT
     * experimentViewRules is the blue print for what will be shown on the form depending on the requestCategory, in future more
      * layers may need to be added. Any leaf node such as labName or email will be dynamically added to this service as property.
      * For example you will have this.experimentViewService.labName added during runtime even though it is not defined
      * explicitly in the code as property of this service. This dynamic property is create in PrimaryTab -> initFormRules()
      *
      * The property is an Object and has its own properties, path and visible. ex. this.experimentViewService.labName.path and
      * this.experimentViewService.labName.visible. The path property is an Array<string|number> which angulars FormGroup or
      * FormsArray can use to find their associated FormControls. Ex.  control:FormGroup =formGroup.get(path).
      *
       * The visible property is a boolean and will be used in your html to toggle visibility of a field/control
       *
       * Remember every leaf property in the blueprint(experimentViewRules) will be create as property of this service dynamically.
       * This saves a lot  extra code defining the properties, but this can be confusing if you don't realize this is
       * occuring. We can change it if we'd rather explicitly define each property. Although the path property still needs
       * to be created dynamically.
    */
   readonly experimentViewRules = {
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
       'TestComponent': {
           'capSeq':{
               'energyDrink':true
           }
       },
        'DescriptionTab': {
            'capSeq': {
                'expName': true,
                'expDescript': true,
                'notesForCore': true,
            }
        },
       'SamplesTabComponent': {
       },
       'SequenceLanesTabComponent': {
       },
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
    getControlValidator(fieldName:string):Array<ValidatorFn>{
        return this.controlValidators[fieldName];
    }

    changeControlState(controlChange:ControlChangeState):void{
        this.controlSubject.next(controlChange);
    }
    getControlState():Observable<ControlChangeState>{
        return this.controlSubject.asObservable();
    }

    constructor() {
        this.experimentEmitter = new EventEmitter();
    }

    private experiment: any;
    private experimentEmitter: EventEmitter<any>;

    setExperiment(experiment: any) {
        this.experiment = experiment;
        this.experimentEmitter.emit(experiment);
    }

    getExperiment(): any {
        return this.experiment;
    }

    getExperimentObservable(): Observable<any> {
        return this.experimentEmitter.asObservable();
    }

}