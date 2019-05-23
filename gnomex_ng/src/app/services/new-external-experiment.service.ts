import {Injectable} from "@angular/core";
import {Experiment} from "../util/models/experiment.model";
import {FormGroup} from "@angular/forms";
import {BehaviorSubject} from "rxjs";

@Injectable()
export class NewExternalExperimentService {

    private _experiment: Experiment;
    public get experiment(): Experiment {
        return this._experiment;
    }
    public set experiment(experiment: Experiment) {
        this._experiment = experiment;
        this.inputs = {
            experiment: this._experiment,
            stateChangeSubject: this.stateChangeSubject,
        };
    }

    public form: FormGroup = new FormGroup({});
    public inputs: any = {};
    public stateChangeSubject: BehaviorSubject<string> = new BehaviorSubject<string>("NEW");

    constructor() {
    }

    public initialize(): void {
        this.form = new FormGroup({
            "Setup": new FormGroup({}),
            "Description": new FormGroup({}),
            "Annotations": new FormGroup({}),
            "Samples": new FormGroup({}),
            "Visibility": new FormGroup({}),
            "Confirm": new FormGroup({}),
        });

        this.experiment = null;

        this.inputs = {};
    }

    public setForm(tabLabel: string, form: FormGroup): void {
        this.form.setControl(tabLabel, form);
    }

    public static createSequenceLane(sample: any): any {
        return {
            idSequenceLane: "SequenceLane",
            notes: "",
            idSeqRunType: "",
            idNumberSequencingCycles: "",
            idNumberSequencingCyclesAllowed: "",
            idSample: sample.idSample,
            idGenomeBuildAlignTo: ""
        };
    }

}
