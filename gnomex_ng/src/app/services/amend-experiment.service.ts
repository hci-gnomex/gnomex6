import {Injectable} from "@angular/core";
import {Experiment} from "../util/models/experiment.model";
import {FormGroup} from "@angular/forms";
import {BehaviorSubject, Subject} from "rxjs";

@Injectable()
export class AmendExperimentService {

    private _experiment: Experiment;
    public get experiment(): Experiment {
        return this._experiment;
    }
    public set experiment(experiment: Experiment) {
        this._experiment = experiment;
        this.inputs = {
            experiment: this._experiment,
            stateChangeSubject: this.stateChangeSubject,
            isAmendState: true,
            agreeCheckboxLabelSubject: this.billingAgreementLabel,
        };
        this.onExperimentChanged.next(experiment);
    }
    public onExperimentChanged: Subject<Experiment> = new Subject<Experiment>();

    public form: FormGroup = new FormGroup({});
    public inputs: any = {};
    public stateChangeSubject: BehaviorSubject<string> = new BehaviorSubject<string>("NEW");
    public billingAgreementLabel: BehaviorSubject<string> = new BehaviorSubject<string>("");

    constructor() {
    }

    public initialize(): void {
        this.form = new FormGroup({
            "Choose the services you want to add": new FormGroup({}),
            "Seq Options": new FormGroup({}),
            "Annotations": new FormGroup({}),
            "Experiment Design": new FormGroup({}),
            "Visibility": new FormGroup({}),
            "Bioinformatics": new FormGroup({}),
            "Confirm": new FormGroup({}),
        });

        this.experiment = null;

        this.inputs = {};
    }

    public setForm(tabLabel: string, form: FormGroup): void {
        this.form.setControl(tabLabel, form);
    }

}
